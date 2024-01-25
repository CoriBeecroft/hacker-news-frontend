import React, { useEffect, useState, useRef, useReducer } from "react";
import throttle from "lodash/throttle";
import { STORY_TYPES } from "../util";
import { getYBaselineInPx, yPxToBaseline, getXPositionAtTime, getYPositionAtTime,
    getXVelocity, targetXPositionReached } from "./fishUtil";
import useHackerNewsApi from "../useHackerNewsApi"
import { useFishAnimation } from "./useFishAnimation";
import { useAddAndRemoveFish } from "./useAddAndRemoveFish";
import FishTank from "./FishTank"
import Seaweed from './seaweed.svg';
// https://fkhadra.github.io/react-toastify/introduction
import { toast, ToastContainer, Slide } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
// import printeff from "../../../printeff/dist/main.bundle.js"

import "./HackerNewsFish.scss";

function fishReducer(state, action) {
    switch (action.type) {
        case 'ADD_FISH':
            const newFish = action.newFish;
            return {
                ids: [...state.ids, newFish.id],
                data: { ...state.data, [newFish.id]: newFish }
            };
        case "UPDATE_FISH":
            const { id, update } = action;
            return {
                ...state,
                data: {
                    ...state.data,
                    [ id ]: {
                        ...state.data[id],
                        ...update
                    }
                }
            }
        case "REMOVE_OFFSCREEN_FISH":
            const onScreenFish = state.ids
                .map(id => state.data[ id ])
                .filter(f => !targetXPositionReached(f, performance.now()))

            return {
                ids: onScreenFish.map(f => f.id),
                data: onScreenFish.reduce( // convert to { id1: fish1, id2: fish2,... } format
                    (fishData, fish) => ({
                        ...fishData,
                        [fish.id]: fish
                    }),
                    {}
                )
            }
        case "MOVE_FISH_TO_TOP":
            // Re-order fish so the fish that was dragged will
            // be rendered in front of the other fish
            const otherFish = state.ids.filter(id => id !== action.id);
            return {
                ...state,
                ids: [ ...otherFish, action.id ]
            }
        case "SET_ACTIVE_FISH":
            return {
                ...state,
                data: Object.values(state.data).map(f => {
                    const newFish = { ...f }
                    if(f.active) {
                        // reset any already active fish to inactive
                        const now = performance.now();
                        newFish.xStartTime = f.xStartTime + (now - f.pauseStartTime);
                        newFish.yStartTime = f.yStartTime + (now - f.pauseStartTime);
                        newFish.active = false;
                        // Note: It's not ideal to have the transition cleared out at this point
                        // since that means the fish jumps from the top left of the screen to close
                        // to where it was before it was activated. Leaving the transition on smooths
                        // out the movement but it creates a weird bug where the fish isn't clickable
                        // for a while after it is deactivated. This is probably because the transition
                        // and my animation loop are competing for setting the transform property which
                        // seems to putting the location of the fish in some indeterminate state or
                        // something. It would be good to fix this at some point but right now it's
                        // looking like a huge rabbit hole for a very small thing so I'm just going to
                        // live with it for now and come back to it later.
                        f.ref.current.style.transition = ``
                    } else if(!f.active && f.id === action.id) {
                        // if fish with targetFish ID isn't already active, set it to active
                        newFish.pauseStartTime = performance.now();
                        newFish.active = true;
                        f.ref.current.style.transition = `translate 500ms, rotate 500ms`;
                        f.ref.current.style.translate = `0px 0px`;
                        f.ref.current.style.rotate = `0rad`;
                    }
                    return newFish;
                }).reduce((accumulator, currentValue) => ({
                    ...accumulator,
                    [currentValue.id]: currentValue
                }), {})
            }
        default:
            return state;
    }
}

export function HackerNews() {
    const [ fishState, fishDispatch] = useReducer(fishReducer, { ids: [], data: {} });
    const [ showStories, setShowStories ] = useState(true);
    const { stories, error, fetchAgain } = useHackerNewsApi(STORY_TYPES.TOP)
    const dragInfo = useRef({})
    const toastId = useRef(null)

    useEffect(() => {
        if(error) {
            toastId.current = toast.error(<div>
                Error fetching stories.
                <button onClick={ () => {
                    toast.dismiss(toastId.current)
                    toastId.current = null;
                    fetchAgain()
                }} style={{ margin: "0px 5px", color: "#444" }}>Retry</button>
            </div>, {
                position: "bottom-right", // Set position to bottom center
                transition: Slide, // Use the 'slide' transition
            });
            console.error(error);
        }
    }, [ error ])

    // const fps = useRef([]);
    // const frames = useRef(0);

    useEffect(() => {
        function handleKeyPress(e) {
            if(e.key === 's') { setShowStories(prev => !prev) }
        }
        function handlePointerMove(e) {
            e.preventDefault();

            if(dragInfo.current.eventType === "pointerDown") {
                const now = performance.now();
                const targetFish = dragInfo.current.targetFish;

                dragInfo.current.eventType = "dragProbable"
                dragInfo.current.xOffset = getXPositionAtTime(targetFish, now) - e.pageX;
                dragInfo.current.yOffset = getYPositionAtTime(targetFish, now) - e.pageY;
                dragInfo.current.pauseStartTime = now;
                dragInfo.current.dragStartX = e.pageX;
                dragInfo.current.dragStartY = e.pageY;

                fishDispatch({
                    type: "UPDATE_FISH",
                    id: targetFish.id,
                    update: { dragProbable: true }
                })
            } else if (dragInfo.current.eventType == "dragProbable" && (Date.now() - dragInfo.current.pointerDownTime > 50)) {
                const targetFish = dragInfo.current.targetFish;
                dragInfo.current.eventType = "drag"
                fishDispatch({
                    type: "UPDATE_FISH",
                    id: targetFish.id,
                    update: { paused: true, dragging: true }
                })
            } else if(dragInfo.current.eventType === "drag") {
                updateDraggedFish(e);
            }
        }
        function handlePointerUp(e) {
            if(dragInfo.current.eventType !== "drag") {
                dragInfo.current.eventType = "click";
                // if(dragInfo.current.targetFish) {
                //     setFish(oldFish => oldFish
                //         .map(of => of.id === dragInfo.current.targetFish.id ?
                //             { ...of, dragProbable: false } : of
                //         )
                //     )
                // }

                return;
            }

            e.stopPropagation();

            dragInfo.current.eventType = null;
            const xPosition = e.pageX === 0 ?
                dragInfo.current.prevX :
                e.pageX + dragInfo.current.xOffset;
            const yPosition = e.pageY === 0 ?
                dragInfo.current.prevY :
                e.pageY + dragInfo.current.yOffset;
            const targetFish = dragInfo.current.targetFish;

            requestAnimationFrame(() => {
                targetFish.ref.current.style.translate = `${xPosition}px ${yPosition}px`

                fishDispatch({ type: "MOVE_FISH_TO_TOP", id: targetFish.id })

                const pauseTime = performance.now() - dragInfo.current.pauseStartTime;
                fishDispatch({
                    type: "UPDATE_FISH",
                    id: targetFish.id,
                    update: {
                        xStartTime: targetFish.xStartTime + (xPosition - getXPositionAtTime(targetFish, performance.now()))/getXVelocity(targetFish),
                        yStartTime: targetFish.yStartTime + pauseTime,
                        yBaseline: yPxToBaseline(targetFish, getYBaselineInPx(targetFish) + (e.pageY - dragInfo.current.dragStartY)),
                        paused: false,
                        dragging: false,
                        dragProbable: false,
                    }
                })
            })
        }

        document.addEventListener('keypress', handleKeyPress)
        document.addEventListener("pointermove", handlePointerMove)
        document.addEventListener("pointerup", handlePointerUp, { capture: true })

        // printeff("frames", frames.current);
        // printeff("fps", fps.current);
        // setInterval(() => {
        //     fps.current.push(frames.current);
        //     if(fps.current.length > 100) {
        //         fps.current.shift();
        //     }
        //     // printeff("frames", frames.current);
        //     frames.current = 0;
        //     // printeff("fps", fps.current);
        // }, 1000)

        return () => {
            document.removeEventListener("keypress", handleKeyPress);
            document.removeEventListener("pointermove", handlePointerMove);
            document.removeEventListener("pointerup", handlePointerUp, true);
        }
    }, [])

    useFishAnimation(fishState.data)
    useAddAndRemoveFish(stories, fishState, fishDispatch)

    const getDragInfo = () => dragInfo.current
    const updateDraggedFish = throttle(e =>{
        const draggedFish = dragInfo.current.targetFish
        if(draggedFish) {
            const xPosition = e.pageX === 0 ? dragInfo.current.prevX : e.pageX + dragInfo.current.xOffset;
            const yPosition = e.pageY === 0 ? dragInfo.current.prevY : e.pageY + dragInfo.current.yOffset;

            requestAnimationFrame(() => {
                draggedFish.ref.current.style.translate = `${xPosition}px ${yPosition}px`

                dragInfo.current.prevX = xPosition;
                dragInfo.current.prevY = yPosition;
            })
        }
    })

    return <div id="HNFE" { ...{
        ...(Object.values(fishState.data).some(f => f.dragging || f.dragProbable) ?
            { style: { touchAction: "none" }} : {}),
    }}>
        { fishState.ids.map(id => fishState.data[id])
            .map(fish => <FishTank { ...{
                key: fish.id,
                fish,
                getDragInfo,
                showStories,
                fishDispatch
            }} /> )}
        <Seaweed { ...{
            width: 175,
            height: 175,
            viewBox: "0 0 512 512",
            fill: "#003d0099",
            style: {
                position: "absolute",
                zIndex: 1,
                top: "55vh",
                left: "22vw",
            }
        }} />
        <Seaweed { ...{
            width: 90,
            height: 90,
            viewBox: "0 0 512 512",
            fill: "#003d0055",
            style: {
                position: "absolute",
                zIndex: 1,
                top: "30vh",
                left: "80vw",
            }
        }} />
        <ToastContainer { ...{
            position: "bottom-right",
            autoClose: false,
            newestOnTop: false,
            closeOnClick: false,
            rtl: false,
            pauseOnFocusLoss: true,
            draggable: true,
            theme: "light",
            transition: Slide,
        }} />
	</div>
}
