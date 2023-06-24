import React, { useEffect, useState, useRef } from "react";
import { StorySummary } from "../components/StorySummary";
import { StoryContent } from "../components/StoryContent";
import { TIME_TO_TRAVERSE_SCREEN } from "./HackerNewsFish";

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

    // TODO: get rid of this
    function getCurrentXPosition() {
        const progress = (performance.now() - props.xStartTime)/(props.speedModifier*TIME_TO_TRAVERSE_SCREEN)
        const position = props.getInitialXPosition() + (props.targetXPosition - props.getInitialXPosition()) * progress;

        return position;
    }
    // TODO: get rid of this
    function getYBaselineInPx(f) {
        return f.yBaseline * (window.innerHeight - f.height)
    }
    // TODO: get rid of this
    function getCurrentYPosition() {
        const timeElapsed = performance.now() - props.yStartTime
        return props.amplitude * Math.sin(timeElapsed*0.0005 + props.phaseShift) + getYBaselineInPx(props.fish.find(f => f.id == props.id))
    }

    return <div { ...{
        ref,
        className,
        onTransitionEnd: e => {
            if(e.propertyName === "translate") {
                setAnimatingFish(false)
            }
        },
        onPointerDown: (e) => {
            if(props.active) { return; }    // active fish aren't draggable
            props.getDragInfo().eventType = "pointerDown"
            props.getDragInfo().xOffset = getCurrentXPosition() - e.pageX;
            props.getDragInfo().yOffset = getCurrentYPosition() - e.pageY;
            props.getDragInfo().dragStartX = e.pageX;
            props.getDragInfo().dragStartY = e.pageY;
            props.getDragInfo().targetFish = props.fish.find(f => f.id === props.id);
        }
    }}>
        <div className={ [ "fish", (props.active ? "active" : "") ].join(" ") }>
            <StorySummary { ...{
                className: props.color,
                loading: false,
                active: props.active,
                onClick: () => {
                    if(props.getDragInfo().eventType !== "click") { return; }
                    props.updateActiveFish(props.id)
                    setAnimatingFish(true)
                },
                index: props.storyInfo.index,
                storyInfo: props.storyInfo,
                style: {
                    animationDelay: props.animationDelay + "ms",
                    ...(props.dragging ? {} : { animationDuration: props.animationDuration + "ms" })
                }
            }}/>
            <div className={ `fish-tail ${props.color} ${props.active ? "active" : "" }` } style={{
                borderRightWidth: fishTailHeight.current/2,
                borderTopWidth: fishTailHeight.current/2,
                borderBottomWidth: fishTailHeight.current/2,
                marginLeft: fishTailHeight.current/2*-0.25,
                animationDelay: props.animationDelay + "ms",
                ...(props.dragging ? {} : { animationDuration: props.animationDuration + "ms" }),
            }} />
        </div>
        { props.active && <StoryContent { ...{
            currentStory: props.id,
            ...props.storyInfo,
            className: [ props.color, showStoryContent ? "" : "invisible" ].join(" ")
        }} /> }
    </div>
}
