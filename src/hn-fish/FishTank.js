import React, { useEffect, useLayoutEffect, useState, useRef, useMemo } from "react";
import { StorySummary } from "../components/StorySummary";
import { StoryContent } from "../components/StoryContent";
import { getPositionAtTime, shiftFishAnimationOrigin, initializeFish,
    pauseFish, unpauseFish, setFishPhase } from "./fishUtil"
import { getRandomSign } from "../util";

import "./FishTank.scss";

const status = { NOT_SELECTED: 0, SELECTING: 1, SELECTED: 2, DESELECTING_1: 3, DESELECTING_2: 4 }

function FishTank({ fish, selectedFishId, setSelectedFishId, getWasDragged, showStories, fishesAnimationData, startDrag, fishDispatch }) {
    const [ selectionStatus, setSelectionStatus ] = useState(status.NOT_SELECTED)
    const [ showStoryContent, setShowStoryContent ] = useState(false);
    const ref = useRef();
    const className = `fish-tank ${ selectionStatus !== status.NOT_SELECTED ? "selected" : ""} ${ fish.dragging ? "dragging" : "" }`

    useEffect(() => {
        if(selectionStatus === status.SELECTED && selectedFishId !== fish.id) {
            setSelectionStatus(status.DESELECTING_1)
            setShowStoryContent(false)
        } else if(selectionStatus === status.DESELECTING_2) {
            const fishAnimationData = fishesAnimationData.current[fish.id];
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
            fishDispatch({ type: "MOVE_FISH_TO_TOP", id: fish.id })
            setSelectionStatus(status.NOT_SELECTED)
        }
    }, [ selectedFishId, selectionStatus ])

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
            if(selectionStatus === status.SELECTING) {
                if(e.propertyName === "translate") {
                    setShowStoryContent(true)
                } else if(e.propertyName == "opacity") {
                    setSelectionStatus(status.SELECTED)
                }
            } else if(selectionStatus == status.DESELECTING_1
                    && e.propertyName == "opacity") {
                setSelectionStatus(status.DESELECTING_2)
            }
        },
        onPointerDown: e => {
            if(selectionStatus !== status.NOT_SELECTED) { return; }    // selected fish aren't draggable
            startDrag(fish, e)
        },
        onClick: () => {
            if(getWasDragged()) { return; }

            if(selectedFishId === fish.id) { setSelectedFishId(null) }
            else {
                const fishAnimationData = fishesAnimationData.current[fish.id];
                setSelectedFishId(fish.id)
                setSelectionStatus(status.SELECTING)
                pauseFish(fishAnimationData)
                fishAnimationData.ref.current.style.transition = `translate 500ms, rotate 500ms`;
                fishAnimationData.ref.current.style.translate = `0px 0px`;
                fishAnimationData.ref.current.style.rotate = `0rad`;
            }
        }
    }}>
        <Fish { ...{ ...fish, showStories, selected: selectionStatus !== status.NOT_SELECTED }} />
        { (selectionStatus !== status.NOT_SELECTED) && <StoryContent { ...{
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
        }}>
            <StorySummary { ...{
                loading: false,
                selected,
                index: storyInfo.index,
                storyInfo: storyInfo,
                style: showStories || selected ? {} : { visibility: "hidden" }
            }}/>
        </div>
        <div { ...{
            className: `fish-tail ${ color } ${ selected ? "selected" : "" }`,
            style: tailStyles
        }} />
    </div>
}

export default React.memo(FishTank);