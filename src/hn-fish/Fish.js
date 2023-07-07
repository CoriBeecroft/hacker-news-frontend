import React, { useEffect, useState, useRef } from "react";
import { StorySummary } from "../components/StorySummary";
import { StoryContent } from "../components/StoryContent";

import "./Fish.scss";

export function Fish(props) {
    const [ animatingFish, setAnimatingFish ] = useState(false);
    const ref = useRef();
    const fishTailHeight = useRef(0);
    const showStoryContent = props.active && !animatingFish
    const className = [
        "fish-tank",
        ...(props.active ? ["active"] : []),
        ...(props.initialized ? [] : ["invisible"]),
        ...(props.dragging ? ["dragging"] : [])
    ].join(" ")

    useEffect(() => {
        if(ref.current) {
            fishTailHeight.current = ref.current.getBoundingClientRect().height * .75;
            props.setFish(oldFish => oldFish.map(f => f.id === props.id ? {
                ...f,
                ref,
                width: ref.current.getBoundingClientRect().width,
                height: ref.current.getBoundingClientRect().height,
            } : f))
        }
    }, [ ref.current ])

    return <div { ...{
        ref,
        className,
        onTransitionEnd: e => {
            if(e.propertyName === "translate") {
                setAnimatingFish(false)
            }
        },
        onPointerDown: () => {
            if(props.active) { return; }    // active fish aren't draggable

            props.getDragInfo().eventType = "pointerDown"
            props.getDragInfo().targetFish = props.fish.find(f => f.id === props.id);
            props.getDragInfo().pointerDownTime = Date.now();
            props.setFish(oldFish => oldFish.map(of => of.id === props.id ? { ...of, dragProbable: true } : of))
        }
    }}>
        <div { ...{
            className: [ "fish", (props.active ? "active" : "") ].join(" "),
            onClick: () => {
                if(props.getDragInfo().eventType !== "click") { return; }
                props.updateActiveFish(props.id)
                setAnimatingFish(true)
            }
        }}>
            <StorySummary { ...{
                className: props.color,
                loading: false,
                active: props.active,
                index: props.storyInfo.index,
                storyInfo: props.storyInfo,
                style: {
                    animationDelay: props.animationDelay + "ms",
                    ...(props.dragging ? {} : { animationDuration: (props.active ? props.animationDuration * 2 : props.animationDuration) + "ms" })
                }
            }}/>
            <div className={ `fish-tail ${props.color} ${props.active ? "active" : "" }` } style={{
                borderRightWidth: fishTailHeight.current/2,
                borderTopWidth: fishTailHeight.current/2,
                borderBottomWidth: fishTailHeight.current/2,
                marginLeft: fishTailHeight.current/2*-0.25,
                animationDelay: props.animationDelay + "ms",
                ...(props.dragging ? {} : { animationDuration: (props.active ? props.animationDuration * 2 : props.animationDuration) + "ms" }),
            }} />
        </div>
        { props.active && <StoryContent { ...{
            currentStory: props.id,
            ...props.storyInfo,
            className: [ props.color, showStoryContent ? "" : "invisible" ].join(" ")
        }} /> }
    </div>
}
