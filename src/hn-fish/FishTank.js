import React, { useLayoutEffect, useState, useRef, useMemo } from "react";
import { StorySummary } from "../components/StorySummary";
import { StoryContent } from "../components/StoryContent";
import { initializeFish, pauseFish, unpauseFish } from "./fishUtil"

import "./FishTank.scss";

function FishTank({ fish, selectedFish, setSelectedFish, getWasDragged, showStories, fishesAnimationData, startDrag }) {
    const [ animatingFish, setAnimatingFish ] = useState(false);
    const ref = useRef();
    const selected = fish.id === selectedFish;
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

            if(selectedFish) {
                unpauseFish(fishesAnimationData.current[selectedFish])
                // Note: It's not ideal to have the transition cleared out at this point
                // since that means the fish jumps from the top left of the screen to close
                // to where it was before it was activated. Leaving the transition on smooths
                // out the movement but it creates a weird bug where the fish isn't clickable
                // for a while after it is deactivated. This is probably because the transition
                // and my animation loop are competing for setting the transform property which
                // seems to putting the location of the fish in some indeterminate state or
                // something. It would be good to fix this at some point but right now it's
                // looking like a huge rabbit hole for a very small thing so I'm just going to
                // live with it for now and come back to it later.
                fishesAnimationData.current[selectedFish].ref.current.style.transition = ``
            }

            if(selectedFish === fish.id) { setSelectedFish(null) }
            else {
                const fishAnimation = fishesAnimationData.current[fish.id]
                setSelectedFish(fish.id)
                pauseFish(fishAnimation)
                setAnimatingFish(true)
                fishAnimation.ref.current.style.transition = `translate 500ms, rotate 500ms`;
                fishAnimation.ref.current.style.translate = `0px 0px`;
                fishAnimation.ref.current.style.rotate = `0rad`;
            }
        }
    }}>
        <Fish { ...{ ...fish, showStories }} />
        { selected && <StoryContent { ...{
            onClick: e => e.stopPropagation(),
            currentStory: fish.id,
            ...fish.storyInfo,
            selected,
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
        if (!dragging) {
            baseStyles.animationDuration = `${animationDuration}ms`;
        } else if (selected) {
            baseStyles.animationDuration = `${animationDuration * 2}ms`;
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
        <div className={`fish-body ${ color }`}>
            <StorySummary { ...{
                loading: false,
                selected,
                index: storyInfo.index,
                storyInfo: storyInfo,
                style: {
                    ...animationStyles,
                    ...(showStories || selected ? {} : { visibility: "hidden" })
                }
            }}/>
        </div>
        <div { ...{
            className: `fish-tail ${ color } ${ selected ? "selected" : "" }`,
            style: tailStyles
        }} />
    </div>
}

export default React.memo(FishTank);