import React, { useEffect, useState, useRef } from "react";
import { StorySummary } from "../components/StorySummary";
import { StoryContent } from "../components/StoryContent";
import { TIME_TO_TRAVERSE_SCREEN } from "./HackerNewsFish";
import { throttle } from "lodash"

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

    useEffect(() => props.registerRef(ref, props.id), [])
    useEffect(() => {
        if(ref.current) {
            fishTailHeight.current = ref.current.getBoundingClientRect().height * .75;
        }
    }, [ ref.current ])

    function getXVelocity() {
        const distanceToTravel = window.innerWidth + ref.current.getBoundingClientRect().width;
        return distanceToTravel/TIME_TO_TRAVERSE_SCREEN;
    }

    function getCurrentXPosition() {
        const progress = (performance.now() - props.xStartTime)/TIME_TO_TRAVERSE_SCREEN
        const position = props.initialXPosition + (props.targetXPosition - props.initialXPosition) * progress;

        return position;
    }
    function getCurrentYPosition() {
        const timeElapsed = performance.now() - props.yStartTime
        return props.amplitude * Math.sin(timeElapsed*0.0005 + props.phaseShift) + props.initialYPosition
    }

    const dragInfo = useRef({})
    useEffect(() => {
        dragInfo.transparentImage = document.createElement("img");
        dragInfo.transparentImage.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
    }, [])
    return <div { ...{
        ref,
        className,
        onTransitionEnd: e => {
            if(e.propertyName === "translate") {
                setAnimatingFish(false)
            }
        },
        draggable: true,
        onDragStart: (e) => {
            e.nativeEvent.dataTransfer.setDragImage(dragInfo.transparentImage, 0, 0)

            dragInfo.xOffset = getCurrentXPosition() - e.pageX
            dragInfo.yOffset = getCurrentYPosition() - e.pageY

            props.setFish(oldFish => oldFish.map(of => of.id === props.id ? {
                ...of,
                paused: true,
                pauseStartTime: performance.now(),
                dragging: true,
            } : of))
        },
        onDrag: throttle(e => {
            e.preventDefault();

            const xPosition = e.pageX === 0 ? dragInfo.prevX : e.pageX + dragInfo.xOffset;
            const yPosition = e.pageY === 0 ? dragInfo.prevY : e.pageY + dragInfo.yOffset;

            ref.current.style.translate = `${xPosition}px ${yPosition}px`

            dragInfo.prevX = xPosition;
            dragInfo.prevY = yPosition;
        }),
        onDragEnd: e => {
            const xPosition = e.pageX === 0 ? dragInfo.prevX : e.pageX + dragInfo.xOffset;
            const yPosition = e.pageY === 0 ? dragInfo.prevY : e.pageY + dragInfo.yOffset;

            ref.current.style.translate = `${xPosition}px ${yPosition}px`

            props.setFish(oldFish => oldFish.map(of => {
                if(of.id !== props.id) { return of; }

                const pauseTime = performance.now() - of.pauseStartTime;
                return {
                    ...of,
                    initialYPosition: e.pageY + dragInfo.yOffset,
                    xStartTime: of.xStartTime + ((e.pageX + dragInfo.xOffset) - getCurrentXPosition())/getXVelocity(),// + pauseTime - 1000,
                    yStartTime: of.yStartTime + pauseTime,
                    paused: false,
                    dragging: false,
                }
            }))
        },
    }}>
        <div className={ [ "fish", (props.active ? "active" : "") ].join(" ") }>
            <StorySummary { ...{
                className: props.color,
                loading: false,
                active: props.active,
                onClick: () => {
                    props.updateActiveFish(props.id)
                    setAnimatingFish(true)
                },
                index: props.storyInfo.index,
                storyInfo: props.storyInfo,
            }}/>
            <div className={ `fish-tail ${props.color} ${props.active ? "active" : "" }` } style={{
                borderRightWidth: fishTailHeight.current/2,
                borderTopWidth: fishTailHeight.current/2,
                borderBottomWidth: fishTailHeight.current/2,
                marginLeft: fishTailHeight.current/2*-0.25,
                animationDelay: props.animationDelay + "ms",
            }} />
        </div>
        { props.active && <StoryContent { ...{
            currentStory: props.id,
            ...props.storyInfo,
            className: [ props.color, showStoryContent ? "" : "invisible" ].join(" ")
        }} /> }
    </div>
}
