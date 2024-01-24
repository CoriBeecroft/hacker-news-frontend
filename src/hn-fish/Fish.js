import React, { useLayoutEffect, useState, useRef } from "react";
import { StorySummary } from "../components/StorySummary";
import { StoryContent } from "../components/StoryContent";
import { initializeFish } from "./fishUtil"

import "./Fish.scss";

export function Fish({ thisFish, updateActiveFish, fish, setFish, getDragInfo, showStories }) {
    const [ animatingFish, setAnimatingFish ] = useState(false);
    const ref = useRef();
    const fishTailHeight = useRef(0);
    const showStoryContent = thisFish.active && !animatingFish
    const className = [
        "fish-tank",
        ...(thisFish.active ? ["active"] : []),
        ...(thisFish.dragging ? ["dragging"] : [])
    ].join(" ")

    useLayoutEffect(() => {
        fishTailHeight.current = ref.current.getBoundingClientRect().height * .75;

        const initializedFish = initializeFish({
            ...thisFish,
            ref,
            width: ref.current.getBoundingClientRect().width,
            height: ref.current.getBoundingClientRect().height,
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
        }
    }}>
        <div { ...{
            className: [ "fish", (thisFish.active ? "active" : "") ].join(" "),
            onClick: () => {
                if(getDragInfo().eventType !== "click") { return; }

                updateActiveFish(thisFish.id)
                setAnimatingFish(true)
            }
        }}>
            <div className={`fish-body ${thisFish.color}`}>
                <StorySummary { ...{
                    loading: false,
                    active: thisFish.active,
                    index: thisFish.storyInfo.index,
                    storyInfo: thisFish.storyInfo,
                    style: {
                        animationDelay: thisFish.animationDelay + "ms",
                        ...(thisFish.dragging ? {} : { animationDuration: (thisFish.active ? thisFish.animationDuration * 2 : thisFish.animationDuration) + "ms" }),
                        ...(showStories || thisFish.active ? {} : { visibility: "hidden" })
                    }
                }}/>
            </div>
            <div className={ `fish-tail ${thisFish.color} ${thisFish.active ? "active" : "" }` } style={{
                borderRightWidth: fishTailHeight.current/2,
                borderTopWidth: fishTailHeight.current/2,
                borderBottomWidth: fishTailHeight.current/2,
                marginLeft: fishTailHeight.current/2*-0.25,
                animationDelay: thisFish.animationDelay + "ms",
                ...(thisFish.dragging ? {} : { animationDuration: (thisFish.active ? thisFish.animationDuration * 2 : thisFish.animationDuration) + "ms" }),
            }} />
        </div>
        { thisFish.active && <StoryContent { ...{
            currentStory: thisFish.id,
            ...thisFish.storyInfo,
            className: [ thisFish.color, showStoryContent ? "" : "invisible" ].join(" ")
        }} /> }
    </div>
}
