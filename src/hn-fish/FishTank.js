import React, { useLayoutEffect, useState, useRef, useMemo } from "react";
import { StorySummary } from "../components/StorySummary";
import { StoryContent } from "../components/StoryContent";
import { getPositionAtTime, shiftFishAnimationOrigin, initializeFish,
    pauseFish, unpauseFish, setFishPhase } from "./fishUtil"
import { getRandomSign } from "../util";

import "./FishTank.scss";

function FishTank({ fish, selectedFishId, setSelectedFishId, getWasDragged, showStories, fishesAnimationData, startDrag, fishDispatch }) {
    const [ animatingFish, setAnimatingFish ] = useState(false);
    const ref = useRef();
    const selected = fish.id === selectedFishId;
    const showStoryContent = selected && !animatingFish
    const className = `fish-tank ${ selected ? "selected" : ""} ${ fish.dragging ? "dragging" : "" }`

    useLayoutEffect(() => {
        const { width, height } = ref.current.getBoundingClientRect()
        const initializedFish = initializeFish({
            ...fishesAnimationData.current[fish.id], ref, width, height,
        });
        fishesAnimationData.current[fish.id] = {
            ...fishesAnimationData.current[fish.id],
            ...initializedFish
        }
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
        onPointerDown: e => {
            if(selected) { return; }    // selected fish aren't draggable
            startDrag(fish, e)
        },
        onClick: () => {
            if(getWasDragged()) { return; }

            if(selectedFishId) {
                const fishAnimationData = fishesAnimationData.current[selectedFishId];
                const { pauseStartTime } = fishAnimationData
                const { x, y } = fishAnimationData.ref.current.firstChild.getBoundingClientRect()
                // target phase is pi/2 or 3pi/2 because those are points where fish
                // rotation is 0.
                const targetPhase = (getRandomSign() == 1 ? 1 : 3) *
                    (Math.PI/2)/fishAnimationData.phase - fishAnimationData.phaseShift
                setFishPhase(
                    fishAnimationData,
                    targetPhase,
                    pauseStartTime
                )
                // getPositionAtTime and shiftFishAnimationOrigin need to be called after
                // setFishPhase so the yBaseline is shifted by the appropriate amount. There
                // might be a better way of doing this but that's how it works right now.
                const [ prevX, prevY ] = getPositionAtTime(fishAnimationData, pauseStartTime)
                shiftFishAnimationOrigin(fishAnimationData, x - prevX, y - prevY)
                unpauseFish(fishAnimationData)
                fishAnimationData.ref.current.style.transition = ``
                fishDispatch({ type: "MOVE_FISH_TO_TOP", id: selectedFishId })
            }

            if(selectedFishId === fish.id) { setSelectedFishId(null) }
            else {
                const fishAnimationData = fishesAnimationData.current[fish.id];
                setSelectedFishId(fish.id)
                pauseFish(fishAnimationData)
                setAnimatingFish(true)
                fishAnimationData.ref.current.style.transition = `translate 500ms, rotate 500ms`;
                fishAnimationData.ref.current.style.translate = `0px 0px`;
                fishAnimationData.ref.current.style.rotate = `0rad`;
            }
        }
    }}>
        <Fish { ...{ ...fish, showStories, selected }} />
        { selected && <StoryContent { ...{
            onClick: e => e.stopPropagation(),
            currentStory: fish.id,
            ...fish.storyInfo,
            className: `${ fish.color } ${ showStoryContent ? "" : "invisible" }`
        }} /> }
    </div>
}

function Fish({ showStories, animationDelay, animationDuration,
        selected, dragging, color, storyInfo }) {
    const [ fishTailHeight, setFishTailHeight ] = useState(0);
    const ref = useRef();
    const animationStyles = useMemo(() => {
        const baseStyles = { animationDelay: `${animationDelay}ms` };
        if (selected) {
            baseStyles.animationDuration = `${animationDuration * 2}ms`;
        } else if (!dragging) {
            baseStyles.animationDuration = `${animationDuration}ms`;
        }
        return baseStyles;
    }, [ animationDelay, animationDuration, selected, dragging ]);

    const tailStyles = useMemo(() => ({
        borderRightWidth: fishTailHeight / 2,
        borderTopWidth: fishTailHeight / 2,
        borderBottomWidth: fishTailHeight / 2,
        marginLeft: fishTailHeight / 2 * -0.25,
        ...animationStyles
    }), [ animationStyles, fishTailHeight ]);

    useLayoutEffect(() => {
        const { height } = ref.current.getBoundingClientRect();
        setFishTailHeight(height * 0.75)
    }, [])
    // console.log("rendering Fish", storyInfo.index);
    return <div { ...{ ref, className: `fish ${(selected ? "selected" : "")}` }} >
        <div className={`fish-body ${ color }`} style={{
            ...animationStyles,
            ...(showStories || selected ? {} : { visibility: "hidden" })
        }}>
            <StorySummary { ...{
                loading: false,
                selected,
                index: storyInfo.index,
                storyInfo: storyInfo,
            }}/>
        </div>
        <div { ...{
            className: `fish-tail ${ color } ${ selected ? "selected" : "" }`,
            style: tailStyles
        }} />
    </div>
}

export default React.memo(FishTank);