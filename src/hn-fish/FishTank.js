import React, { useEffect, useLayoutEffect, useState, useRef, useMemo } from "react";
import { StorySummary } from "../components/StorySummary";
import { StoryContent } from "../components/StoryContent";
import { getPositionAtTime, shiftFishAnimationOrigin, initializeFish,
    pauseFish, unpauseFish, setFishPhase, HEADER_HEIGHT } from "./fishUtil"
import { getRandomSign } from "../util";

import "./FishTank.scss";

const status = {
    NOT_SELECTED: "NOT_SELECTED",
    SELECTING: "SELECTING",
    SELECTED: "SELECTED",
    DESELECTING: "DESELECTING",
}

function FishTank({ fish, isSelected, setSelectedFishId, getWasDragged, showStories, fishesAnimationData, startDrag, fishDispatch }) {
    // TODO: having three variables for selection state (isSelected, selected, selectionStatus)
    // is confusing and a little ridiculous, try to simplify this at some point
    const [ selected, setSelected ] = useState(false);
    const selectionStatus = useRef(status.NOT_SELECTED)
    const [ showStoryContent, setShowStoryContent ] = useState(false);
    const ref = useRef();
    const className = `fish-tank ${ selected ? "selected" : ""} ${ fish.dragging ? "dragging" : "" }`

    useEffect(() => {
        if(selectionStatus.current === status.SELECTED && !isSelected) {
            selectionStatus.current = status.DESELECTING
            setShowStoryContent(false)
        }
    }, [ isSelected ])

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
            if(selectionStatus.current === status.SELECTING) {
                if(e.propertyName === "translate") {
                    setShowStoryContent(true)
                } else if(e.propertyName == "opacity") {
                    selectionStatus.current = status.SELECTED
                }
            } else if(selectionStatus.current == status.DESELECTING
                    && e.propertyName == "opacity") {
                setSelected(false)
                requestAnimationFrame(time => {
                    const fishAnimationData = fishesAnimationData.current[fish.id];
                    const { pauseStartTime } = fishAnimationData
                    let { x, y } = fishAnimationData.ref.current.firstChild.getBoundingClientRect()
                    y -= HEADER_HEIGHT;

                    // target phase is pi/2 or 3pi/2 because those are points where fish
                    // rotation is 0.
                    const targetPhase = (getRandomSign() == 1 ? 1 : 3) *
                        (Math.PI/2)/fishAnimationData.phase - fishAnimationData.phaseShift
                    setFishPhase(fishAnimationData, targetPhase, pauseStartTime)
                    // getPositionAtTime and shiftFishAnimationOrigin need to be called after
                    // setFishPhase so the yBaseline is shifted by the appropriate amount. There
                    // might be a better way of doing this but that's how it works right now.
                    const [ prevX, prevY ] = getPositionAtTime(fishAnimationData, pauseStartTime)
                    shiftFishAnimationOrigin(fishAnimationData, x - prevX, y - prevY)

                    fishAnimationData.ref.current.style.transition = ``
                    unpauseFish(fishAnimationData)

                    // const [ currentX, currentY ] = getPositionAtTime(fishAnimationData, time)
                    // console.log(Math.round(y - currentY))

                    fishDispatch({ type: "MOVE_FISH_TO_TOP", id: fish.id })
                    selectionStatus.current = status.NOT_SELECTED
                })
            }
        },
        onPointerDown: e => {
            startDrag(fish, !selected, e)    // selected fish aren't draggable
        },
        onClick: () => {
            if(getWasDragged() || selectionStatus.current == status.SELECTING
                    || selectionStatus.current == status.DESELECTING) {
                return;
            }

            if(isSelected) { setSelectedFishId(null) }
            else {
                const fishAnimationData = fishesAnimationData.current[fish.id];
                setSelectedFishId(fish.id)
                setSelected(true)
                selectionStatus.current = status.SELECTING
                pauseFish(fishAnimationData)
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
        if(selected) {
            baseStyles.animationDuration = `${animationDuration * 2}ms`;
        } else if(!dragging) {
            baseStyles.animationDuration = `${animationDuration}ms`;
        }
        return baseStyles;
    }, [ animationDelay, animationDuration, selected, dragging ]);

    const tailStyles = useMemo(() => ({
        // borderRightWidth: fishTailHeight / 2,
        // borderTopWidth: fishTailHeight / 2,
        // borderBottomWidth: fishTailHeight / 2,
        // marginLeft: fishTailHeight / 2 * -0.25,
        ...animationStyles,
        // height: fishTailHeight,
        width: fishTailHeight,
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
        <svg { ...{
                className: `fish-tail ${ color } ${ selected ? "selected" : "" }`,
                style: tailStyles
            }}
            viewBox="0 0 133 201" fill="none" xmlns="http://www.w3.org/2000/svg"
        >
                <path d="M0.303769 114.196C0.305895 115.215 1.13139 116.041 2.15022 116.043V116.043C22.8563 116.082 42.8214 123.752 58.2279 137.586L127.785 200.043C130.267 202.272 133.987 199.394 132.454 196.432L109.358 151.809L108.927 151.006C91.9528 119.345 91.8598 81.31 108.679 49.5664V49.5664L131.573 5.06181C133.098 2.09653 129.372 -0.771576 126.896 1.46161L57.3269 64.1983C42.1686 77.868 22.4711 85.4165 2.05948 85.3779V85.3779C1.05778 85.376 0.245326 86.1886 0.247416 87.1903L0.303769 114.196Z" fill="#D9D9D9"/>
        </svg>

    </div>
}

export default React.memo(FishTank);