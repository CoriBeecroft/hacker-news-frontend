import React, { useLayoutEffect, useState, useRef } from "react";
import { StorySummary } from "../components/StorySummary";
import { StoryContent } from "../components/StoryContent";
import { initializeFish } from "./fishUtil"

import "./FishTank.scss";

export function FishTank({ thisFish, updateActiveFish, fish, setFish, getDragInfo, showStories }) {
    const [ animatingFish, setAnimatingFish ] = useState(false);
    const ref = useRef();
    const showStoryContent = thisFish.active && !animatingFish
    const className = `fish-tank ${ thisFish.active ? "active" : ""} ${ thisFish.dragging ? "dragging" : "" }`

    useLayoutEffect(() => {
        const { width, height } = ref.current.getBoundingClientRect()
        const initializedFish = initializeFish({
            ...thisFish, ref, width, height,
        });
        setFish(oldFish => oldFish.map(of => of.id === thisFish.id ? initializedFish : of))
    }, [])

    return <div { ...{
        ref,
        className,
        onTransitionEnd: e => {
            if(e.propertyName === "translate") {
                setAnimatingFish(false)
            }
        },
        onPointerDown: () => {
            if(thisFish.active) { return; }    // active fish aren't draggable
            getDragInfo().eventType = "pointerDown"
            getDragInfo().targetFish = fish.find(f => f.id === thisFish.id);
            getDragInfo().pointerDownTime = Date.now();
            // setFish(oldFish => oldFish.map(of => of.id === thisFish.id ? { ...of, dragProbable: true } : of))
        },
        onClick: () => {
            if(getDragInfo().eventType !== "click") { return; }
            updateActiveFish(thisFish.id)
            setAnimatingFish(true)
        }
    }}>
        <Fish { ...{ ...thisFish, showStories }} />
        { thisFish.active && <StoryContent { ...{
            onClick: e => e.stopPropagation(),
            currentStory: thisFish.id,
            ...thisFish.storyInfo,
            className: `${ thisFish.color } ${ showStoryContent ? "" : "invisible" }`
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