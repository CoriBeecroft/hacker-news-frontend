import React, { useLayoutEffect, useState, useRef, useMemo } from "react";
import StorySummary from "../components/StorySummary";
import { StoryContent } from "../components/StoryContent";
import { initializeFish } from "./fishUtil"

import "./FishTank.scss";
import { isEqual, isObject, transform } from "lodash";

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
    const animationStyles = useMemo(() => {
        const baseStyles = { animationDelay: `${animationDelay}ms` };
        if (!dragging) {
            baseStyles.animationDuration = `${animationDuration}ms`;
        } else if (active) {
            baseStyles.animationDuration = `${animationDuration * 2}ms`;
        }
        return baseStyles;
    }, [ animationDelay, animationDuration, active, dragging ]);

    const tailStyles = useMemo(() => ({
        borderRightWidth: fishTailHeight.current / 2,
        borderTopWidth: fishTailHeight.current / 2,
        borderBottomWidth: fishTailHeight.current / 2,
        marginLeft: fishTailHeight.current / 2 * -0.25,
        ...animationStyles
    }), [ animationStyles, fishTailHeight.current ]);

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
            style: tailStyles
        }} />
    </div>
}

export default React.memo(FishTank, (prevProps, nextProps) => {
    // Destructure the ref out of the fish object
    const { fish: { ref: prevRef, ...prevFish }, ...prevRest } = prevProps;
    const { fish: { ref: nextRef, ...nextFish }, ...nextRest } = nextProps;

    // Compare the rest of the fish object and other props
    return isEqual({ ...prevFish, ...prevRest }, { ...nextFish, ...nextRest });
});
// export default FishTank;