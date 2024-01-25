import React, { useLayoutEffect, useState, useRef } from "react";
import { StorySummary } from "../components/StorySummary";
import { StoryContent } from "../components/StoryContent";
import { initializeFish } from "./fishUtil"

import "./FishTank.scss";

function FishTank({ fish, getDragInfo, showStories, fishDispatch }) {
    const [ animatingFish, setAnimatingFish ] = useState(false);
    const ref = useRef();
    const showStoryContent = fish.active && !animatingFish
    const className = `fish-tank ${ fish.active ? "active" : ""} ${ fish.dragging ? "dragging" : "" }`

    useLayoutEffect(() => {
        const { width, height } = ref.current.getBoundingClientRect()
        const initializedFish = initializeFish({
            ...fish, ref, width, height,
        });
        fishDispatch({ type: "UPDATE_FISH", id: fish.id, update: initializedFish })
    }, [])

    // console.log("rendering FishTank", fish.storyInfo.index);
    return <div { ...{
        ref,
        className,
        onTransitionEnd: e => {
            if(e.propertyName === "translate") {
                setAnimatingFish(false)
            }
        },
        onPointerDown: () => {
            if(fish.active) { return; }    // active fish aren't draggable
            getDragInfo().eventType = "pointerDown"
            getDragInfo().targetFish = fish;
            getDragInfo().pointerDownTime = Date.now();
            // setFish(oldFish => oldFish.map(of => of.id === fish.id ? { ...of, dragProbable: true } : of))
        },
        onClick: () => {
            if(getDragInfo().eventType !== "click") { return; }
            fishDispatch({ type: "SET_ACTIVE_FISH", id: fish.id })
            setAnimatingFish(true)
        }
    }}>
        <Fish { ...{ ...fish, showStories }} />
        { fish.active && <StoryContent { ...{
            onClick: e => e.stopPropagation(),
            currentStory: fish.id,
            ...fish.storyInfo,
            className: `${ fish.color } ${ showStoryContent ? "" : "invisible" }`
        }} /> }
    </div>
}

function Fish({ showStories, animationDelay, animationDuration,
        active, dragging, color, storyInfo }) {
    const fishTailHeight = useRef(0);
    const ref = useRef();
    const animationStyles = { animationDelay: animationDelay + "ms" }
    if(!dragging) {
        animationStyles.animationDuration = animationDuration + "ms"
    } else if(active) {
        animationStyles.animationDuration = animationDuration * 2 + "ms"
    }

    useLayoutEffect(() => {
        const { height } = ref.current.getBoundingClientRect();
        fishTailHeight.current = height * .75;
    }, [])

    return <div { ...{ ref, className: `fish ${(active ? "active" : "")}` }} >
        <div className={`fish-body ${ color }`}>
            <StorySummary { ...{
                loading: false,
                active,
                index: storyInfo.index,
                storyInfo: storyInfo,
                style: {
                    ...animationStyles,
                    ...(showStories || active ? {} : { visibility: "hidden" })
                }
            }}/>
        </div>
        <div { ...{
            className: `fish-tail ${ color } ${ active ? "active" : "" }`,
            style: {
                borderRightWidth: fishTailHeight.current/2,
                borderTopWidth: fishTailHeight.current/2,
                borderBottomWidth: fishTailHeight.current/2,
                marginLeft: fishTailHeight.current/2*-0.25,
                ...animationStyles
            }
        }} />
    </div>
}

// export default React.memo(FishTank);
export default FishTank;