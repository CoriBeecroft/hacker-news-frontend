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

    useLayoutEffect(() => {
        if (modalRef.current && storyCardRef.current) {
            animate(modalRef.current, [{ opacity: 0 }, { opacity: 1 }], {
                duration: 300,
                easing: "ease",
                fill: "forwards",
            })

            animate(
                storyCardRef.current,
                [{ transform: "scale(0.7)" }, { transform: "scale(1)" }],
                { duration: 300, easing: "ease", fill: "forwards" }
            )
        }
    }, [])

    const collapseAndUnmount = useCallback(() => {
        if (modalRef.current && storyCardRef.current) {
            Promise.all([
                animate(
                    storyCardRef.current,
                    [{ transform: "scale(1)" }, { transform: "scale(0.7)" }],
                    { duration: 300, easing: "ease", fill: "forwards" }
                ),
                animate(modalRef.current, [{ opacity: 1 }, { opacity: 0 }], {
                    duration: 300,
                    easing: "ease",
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
        ${storyCardPositionRef.current.left}px,
        ${storyCardPositionRef.current.top}px
    ) scale(0.77)`
    const unscaledTransform = `translate(
        ${expandedStyle.translateX},
        ${expandedStyle.translateY}
    ) scale(1)`

    useLayoutEffect(() => {
        if (ref.current) {
            animate(ref.current, [{ opacity: 0 }, { opacity: 1 }], {
                duration: 100,
                easing: "ease",
                fill: "forwards",
            })

            animate(
                ref.current,
                [
                    { transform: scaledTransform },
                    { transform: unscaledTransform },
                ],
                { duration: 300, easing: "ease", fill: "forwards" }
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
                    { duration: 300, easing: "ease", fill: "forwards" }
                ),
                animate(ref.current, [{ opacity: 1 }, { opacity: 0 }], {
                    delay: 200,
                    duration: 100,
                    easing: "ease",
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

const createGradientBackground = ({
    score = 0,
    time,
    descendants = 0,
    large = false,
}) => {
    const mappedTime =
        255 - ((new Date().getTime() / 1000 - time) / (60 * 60 * 24 * 3)) * 255
    const mappedScore = (score / 500) * 180 + 75
    const mappedDescendants = descendants % 255
    return large
        ? {
              backgroundImage: `radial-gradient(
                    ellipse at -20% 100%,
                    rgba(0, 0, ${mappedScore}, 0.25),
                    transparent ${0.6 * 80}%
                ),
                linear-gradient(
                    184deg,
                    rgba(${mappedTime}, 6, 15, 0.4),
                    rgba(${mappedTime}, 6, 15, 0.2) ${1 * 10}%,
                    rgba(0, 0, 0, 0) ${1 * 25}%
                ),
                radial-gradient(
                    ellipse at 120% 100%,
                    rgba(${mappedDescendants}, 0, ${mappedDescendants}, 0.25
                ),
                    transparent ${0.6 * 80}%
                )`,
          }
        : {
              backgroundImage: `radial-gradient(
                    ellipse at -20% 100%,
                    rgba(0, 0, ${mappedScore}, 0.25),
                    transparent 80%
                ),
                linear-gradient(
                    184deg,
                    rgba(${mappedTime}, 6, 15, 0.4),
                    rgba(${mappedTime}, 6, 15, 0.2) 10%,
                    rgba(0, 0, 0, 0) 25%
                ),
                radial-gradient(
                    ellipse at 120% 100%,
                    rgba(${mappedDescendants}, 0, ${mappedDescendants}, 0.25
                ),
                    transparent 80%
                )`,
          }
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
                ${storyCardPositionRef.current.left}px -
                ${expandedStyle.width / 2}vw +
                ${collapsedStyle.width / 2}vw
            )`,
            translateY: `calc(
                ${storyCardPositionRef.current.top}px -
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
