import React, { useEffect, useState, useRef, useReducer, useCallback } from "react";
import { STORY_TYPES } from "../util";
import useHackerNewsApi from "../useHackerNewsApi"
import { useFishAnimation } from "./useFishAnimation";
import { useAddAndRemoveFish } from "./useAddAndRemoveFish";
import useFishDrag from "./useFishDrag"
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
        case "ADD_AND_REMOVE_FISH":
            const fishIdsToKeep = state.ids.filter(id => !action.fishIdsToRemove.includes(id))
            return {
                ids: fishIdsToKeep.concat(action.fishToAdd.map(f => f.id)),
                data: fishIdsToKeep
                    .map(id => state.data[id])
                    .concat(action.fishToAdd)
                    .reduce( // convert to { id1: fish1, id2: fish2,... } format
                        (fishData, fish) => ({ ...fishData, [fish.id]: fish }),
                        {}
                )
            }
        case "MOVE_FISH_TO_TOP":
            // Re-order fish so the fish that was dragged will
            // be rendered in front of the other fish
            const otherFish = state.ids.filter(id => id !== action.id);
            return { ...state, ids: [ ...otherFish, action.id ] }
        case "SET_ACTIVE_FISH":
            return {
                ...state,
                data: Object.values(state.data).map(f => {
                    const newFish = { ...f }
                    if(f.active) {
                        // reset any already active fish to inactive
                        newFish.active = false;
                    } else if(!f.active && f.id === action.id) {
                        // if fish with targetFish ID isn't already active, set it to active
                        newFish.active = true;
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
    const fishAnimationData = useRef({});
    const [ showStories, setShowStories ] = useState(true);
    const { stories, error, fetchAgain } = useHackerNewsApi(STORY_TYPES.TOP)
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
    // useEffect(() => {
    //     printeff("frames", frames.current);
    //     printeff("fps", fps.current);
    //     setInterval(() => {
    //         fps.current.push(frames.current);
    //         if(fps.current.length > 100) {
    //             fps.current.shift();
    //         }
    //         // printeff("frames", frames.current);
    //         frames.current = 0;
    //         // printeff("fps", fps.current);
    //     }, 1000)
    // }, [])

    useEffect(() => {
        function handleKeyPress(e) {
            if(e.key === 's') { setShowStories(prev => !prev) }
        }
        document.addEventListener('keypress', handleKeyPress)

        return () => {
            document.removeEventListener("keypress", handleKeyPress);
        }
    }, [])

    useFishAnimation(fishAnimationData)
    useAddAndRemoveFish(stories, fishAnimationData, fishDispatch)

    const { getWasDragged, startDrag, containerStyle } = useFishDrag(fishAnimationData, fishDispatch)

    return <div id="HNFE" style={ containerStyle }>
        <div>
            { fishState.ids.map(id => fishState.data[id])
                .map(fish => <FishTank { ...{
                    key: fish.id,
                    fish,
                    getWasDragged,
                    showStories,
                    fishDispatch,
                    fishAnimationData,
                    startDrag,
                }} /> )}
        </div>
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
