import React, { useState, useRef, useLayoutEffect, useCallback } from "react"
import {
    StorySummary,
    SubmissionTime,
    SubmittedBy,
    Score,
    NumComments,
    Domain,
} from "../components/StorySummary"
import { StoryContent } from "../components/StoryContent"
import { createPortal } from "react-dom"
import { debounce, omit } from "lodash"
import { createGradientBackground } from "./util"

import "./StoryCard.scss"

// States
const COLLAPSED = "COLLAPSED",
    EXPANDED = "EXPANDED",
    FULLY_EXPANDED = "FULLY_EXPANDED"

export function StoryCard({ index, story }) {
    const [state, setState] = useState(COLLAPSED)
    const storyCardRef = useRef()
    const storyCardPositionRef = useRef({ top: 0, left: 0 })

    const getStoryCardPosition = () => {
        if (!storyCardRef.current) return

        const { left, top } = storyCardRef.current.getBoundingClientRect()
        storyCardPositionRef.current.left = left
        storyCardPositionRef.current.top = top
    }

    const expandCard = debounce(() => {
        if (state === COLLAPSED) {
            getStoryCardPosition()
            setState(EXPANDED)
        }
    }, 500)

    return (
        <>
            <CollapsedStoryCard
                {...{
                    story,
                    index,
                    state,
                    setState,
                    storyCardRef,
                    storyCardPositionRef,
                    expandCard,
                }}
            />
            {state === EXPANDED &&
                createPortal(
                    <ExpandedStoryCard
                        {...{
                            story,
                            index,
                            setState,
                            storyCardPositionRef,
                            expandCard,
                        }}
                    />,
                    document.getElementById("hn-and-chill") // TODO: do this the right way
                )}
            {state === FULLY_EXPANDED &&
                createPortal(
                    <FullyExpandedStoryCard {...{ story, index, setState }} />,
                    document.getElementById("hn-and-chill") // TODO: do this the right way
                )}
        </>
    )
}

function FullyExpandedStoryCard({ story, index, setState }) {
    const modalRef = useRef()
    const storyCardRef = useRef()
    const easing = "cubic-bezier(0.5, 0, 0.1, 1)"
    useLayoutEffect(() => {
        if (modalRef.current && storyCardRef.current) {
            animate(modalRef.current, [{ opacity: 0 }, { opacity: 1 }], {
                duration: 300,
                easing,
                fill: "forwards",
            })

            animate(
                storyCardRef.current,
                [{ transform: "scale(0.7)" }, { transform: "scale(1)" }],
                { duration: 300, easing, fill: "forwards" }
            )
        }
    }, [])

    const collapseAndUnmount = useCallback(() => {
        if (modalRef.current && storyCardRef.current) {
            Promise.all([
                animate(
                    storyCardRef.current,
                    [{ transform: "scale(1)" }, { transform: "scale(0.7)" }],
                    { duration: 300, easing, fill: "forwards" }
                ),
                animate(modalRef.current, [{ opacity: 1 }, { opacity: 0 }], {
                    duration: 300,
                    easing,
                    fill: "forwards",
                }),
            ]).then(() => setState(COLLAPSED))
        }
    }, [])

    return (
        <div
            {...{
                ref: modalRef,
                className: "modal-background",
                onClick: collapseAndUnmount,
            }}
        >
            <div
                {...{
                    ref: storyCardRef,
                    className: "story-card fully-expanded",
                    style: createGradientBackground({ ...story, large: true }),
                }}
            >
                <StorySummary
                    {...{
                        storyInfo: story,
                        index,
                        excludeNumber: true,
                        onClick: e => e.stopPropagation(),
                    }}
                />
                <StoryContent
                    {...{
                        onClick: e => e.stopPropagation(),
                        currentStory: story.id,
                        ...story,
                    }}
                />
            </div>
        </div>
    )
}

function ExpandedStoryCard({
    setState,
    story,
    index,
    storyCardPositionRef,
    expandCard,
}) {
    const ref = useRef()
    const expandedStyle = calculateCardDimensionStyle(
        true,
        storyCardPositionRef
    )
    const scaledTransform = `translate(
        ${storyCardPositionRef.current.left + window.scrollX}px,
        ${storyCardPositionRef.current.top + window.scrollY}px
    ) scale(0.77)`
    const unscaledTransform = `translate(
        ${expandedStyle.translateX},
        ${expandedStyle.translateY}
    ) scale(1)`
    const easing= "cubic-bezier(0.5, 0, 0.1, 1)"

    useLayoutEffect(() => {
        if (ref.current) {
            animate(ref.current, [{ opacity: 0 }, { opacity: 1 }], {
                duration: 100,
                easing,
                fill: "forwards",
            })

            animate(
                ref.current,
                [
                    { transform: scaledTransform },
                    { transform: unscaledTransform },
                ],
                { duration: 300, easing, fill: "forwards" }
            )
        }
    }, [])

    const collapseAndUnmount = useCallback(() => {
        if (ref.current) {
            Promise.all([
                animate(
                    ref.current,
                    [
                        { transform: unscaledTransform },
                        { transform: scaledTransform },
                    ],
                    { duration: 300, easing, fill: "forwards" }
                ),
                animate(ref.current, [{ opacity: 1 }, { opacity: 0 }], {
                    delay: 200,
                    duration: 100,
                    easing,
                    fill: "forwards",
                }),
            ]).then(() => setState(COLLAPSED))
        }
    }, [])

    return (
        <div
            {...{
                ref,
                className: `story-card expanded`,
                onMouseLeave: collapseAndUnmount,
                style: omit(expandedStyle, ["translateX", "translateY"]),
            }}
        >
            <StorySummary
                {...{
                    storyInfo: story,
                    index,
                    compact: true,
                    excludeNumber: true,
                    style: createGradientBackground(story),
                    onClick: () => {
                        expandCard.cancel()
                        setState(FULLY_EXPANDED)
                    },
                }}
            />
            <StoryDetails {...story} />
        </div>
    )
}

function CollapsedStoryCard({
    story,
    index,
    state,
    setState,
    storyCardRef,
    expandCard,
    storyCardPositionRef,
}) {
    return (
        <div
            {...{
                ref: storyCardRef,
                className: `story-card collapsed`,
                onMouseEnter: expandCard,
                onMouseLeave: () => state !== EXPANDED && expandCard.cancel(),
                onClick: () => {
                    expandCard.cancel()
                    setState(FULLY_EXPANDED)
                },
                style: calculateCardDimensionStyle(false, storyCardPositionRef),
            }}
        >
            <StorySummary
                {...{
                    storyInfo: story,
                    index,
                    compact: true,
                    excludeNumber: true,
                    style: createGradientBackground(story),
                }}
            />
        </div>
    )
}

function StoryDetails({ score, time, descendants, type, by, url }) {
    return (
        <div className="story-details">
            <div>
                <Score {...{ score }} />
                <SubmissionTime {...{ time }} />
                <NumComments {...{ type, descendants }} />
            </div>
            <div>
                <SubmittedBy {...{ by }} />
                <Domain {...{ url }} />
            </div>
        </div>
    )
}

const calculateCardDimensionStyle = (
    expanded = false,
    storyCardPositionRef
) => {
    const collapsedStyle = {
        width: 22,
        minWidth: 250,
        maxWidth: 350,
        height: 11,
        minHeight: 137,
        maxHeight: 192,
    }

    const expandedStyle = {
        width: collapsedStyle.width * 1.3,
        minWidth: collapsedStyle.minWidth * 1.3,
        maxWidth: collapsedStyle.maxWidth * 1.3,
        height: collapsedStyle.height * 2,
        minHeight: collapsedStyle.minHeight * 2,
        maxHeight: collapsedStyle.maxHeight * 2,
    }

    if (expanded) {
        return {
            translateX: `calc(
                ${window.scrollX + storyCardPositionRef.current.left}px -
                ${expandedStyle.width / 2}vw +
                ${collapsedStyle.width / 2}vw
            )`,
            translateY: `calc(
                ${window.scrollY + storyCardPositionRef.current.top}px -
                ${expandedStyle.height / 2}vw +
                ${collapsedStyle.height / 2}vw
            )`,
            width: expandedStyle.width + "vw",
            minWidth: expandedStyle.minWidth + "px",
            maxWidth: expandedStyle.maxWidth + "px",
            height: expandedStyle.height + "vw",
            minHeight: expandedStyle.minHeight + "px",
            minWidth: expandedStyle.minWidth + "px",
        }
    } else {
        return {
            width: collapsedStyle.width + "vw",
            minWidth: collapsedStyle.minWidth + "px",
            maxWidth: collapsedStyle.maxWidth + "px",
            height: collapsedStyle.height + "vw",
            minHeight: collapsedStyle.minHeight + "px",
            maxHeight: collapsedStyle.maxHeight + "px",
        }
    }
}

const animate = (target, keyframes, options) => {
    const animation = target.animate(keyframes, options)
    return new Promise(resolve => {
        animation.onfinish = () => {
            target.style.transform = keyframes[1].transform
            resolve()
        }
    })
}
