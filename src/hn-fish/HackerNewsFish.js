import React, { useEffect, useState, useRef, useReducer } from "react";
import { STORY_TYPES } from "../util";
import { HEADER_HEIGHT } from "./fishUtil";
import useHackerNewsApi from "../useHackerNewsApi"
import { useFishAnimation } from "./useFishAnimation";
import { useAddAndRemoveFish } from "./useAddAndRemoveFish";
import useFishDrag from "./useFishDrag"
import FishTank from "./FishTank"
import Header from "./Header"
import Seaweed from './seaweed.svg';
// https://fkhadra.github.io/react-toastify/introduction
import { toast, ToastContainer, Slide } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
// import printeff from "../../../printeff/dist/main.bundle.js"

import "./HackerNewsFish.scss";


export function HackerNewsFish() {
    const [ fishesState, fishDispatch] = useReducer(fishReducer, { ids: [], data: {} });
    const fishesAnimationData = useRef({});
    const [ selectedFishId, setSelectedFishId ] = useState(null);
    const [ showStories, setShowStories ] = useState(true);
    const { stories, error, fetchAgain } = useHackerNewsApi(STORY_TYPES.TOP)
    const { getWasDragged, startDrag, containerStyle } = useFishDrag(fishesAnimationData, fishDispatch)
    const toastId = useRef(null)

    useFishAnimation(fishesAnimationData)
    useAddAndRemoveFish(stories, fishesAnimationData, fishDispatch)

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
                position: "bottom-right",
                transition: Slide,
            });
            console.error(error);
        }
    }, [ error ])

    useEffect(() => {
        function handleKeyPress(e) {
            if(e.key === 's') { setShowStories(prev => !prev) }
        }
        document.addEventListener('keypress', handleKeyPress)

        return () => {
            document.removeEventListener("keypress", handleKeyPress);
        }
    }, [])

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

    return <div id="hn-fish" style={ containerStyle }>
        <Header />
        <div id="ocean" style={{ height: `calc(100vh - ${ HEADER_HEIGHT }px)` }}>
            <div>
                { fishesState.ids.map(id => fishesState.data[id])
                    .map(fish => <FishTank { ...{
                        key: fish.id,
                        fish, fishesAnimationData,
                        startDrag, getWasDragged,
                        isSelected: selectedFishId === fish.id,
                        setSelectedFishId,
                        fishDispatch,
                        showStories,
                    }} /> )}
            </div>
            <Seaweed { ...{
                className: "seaweed foreground-seaweed",
                width: 175,
                height: 175,
                viewBox: "0 0 512 512",
                fill: "#003d0099",
            }} />
            <Seaweed { ...{
                className: "seaweed background-seaweed",
                width: 90,
                height: 90,
                viewBox: "0 0 512 512",
                fill: "#003d0055",
            }} />
        </div>
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
                    [ id ]: { ...state.data[id], ...update }
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
            // Re-order fish so the target fish will be rendered
            // in front of the other fish
            const otherFish = state.ids.filter(id => id !== action.id);
            return { ...state, ids: [ ...otherFish, action.id ] }
        default:
            return state;
    }
}
