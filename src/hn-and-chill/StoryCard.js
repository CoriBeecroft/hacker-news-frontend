import React, { useState, useRef } from "react"
import { getTimeElapsed } from "../util"
import { StorySummary } from "../components/StorySummary"
import { StoryContent } from "../components/StoryContent"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faComment } from "@fortawesome/free-regular-svg-icons"
import { createPortal } from "react-dom"
import { debounce } from "lodash"

import "./StoryCard.scss"

// States
const COLLAPSED = "COLLAPSED",
    EXPANDED = "EXPANDED",
    FULLY_EXPANDED = "FULLY_EXPANDED"

export function StoryCard({ index, story }) {
    const [state, setState] = useState(COLLAPSED)
    const storyCardRef = useRef()
    const storyCardPositionRef = useRef({ x: 0, y: 0 })

    const getStoryCardPosition = () => {
        if (!storyCardRef.current) return

        const { left, top } = storyCardRef.current.getBoundingClientRect()
        storyCardPositionRef.left = left
        storyCardPositionRef.top = top
    }

    const expandCard = debounce(() => {
        if (state === COLLAPSED) {
            getStoryCardPosition()
            setState(EXPANDED)
        }
    }, 500)

    return (
        <>
            <div
                {...{
                    ref: storyCardRef,
                    className: `story-card`,
                    onMouseEnter: expandCard,
                    onMouseLeave: () => {
                        if (state !== EXPANDED) {
                            expandCard.cancel()
                        }
                    },
                    onClick: () => {
                        expandCard.cancel()
                        setState(FULLY_EXPANDED)
                    },
                    style: calculateStoryCardStyle(false, storyCardPositionRef),
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
            {state === EXPANDED &&
                createPortal(
                    <div
                        {...{
                            className: `story-card ${"expanded"}`,
                            onMouseLeave: () => {
                                setState(COLLAPSED)
                            },
                            style: calculateStoryCardStyle(
                                true,
                                storyCardPositionRef
                            ),
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
                        <StoryDetails {...{ story }} />
                    </div>,
                    document.getElementById("hn-and-chill") // TODO: do this the right way
                )}
            {state === FULLY_EXPANDED &&
                createPortal(
                    <div
                        {...{
                            className: "modal-background",
                            onClick: () => setState(COLLAPSED),
                        }}
                    >
                        <div
                            {...{
                                className: `story-card fully-expanded`,
                                style: {
                                    ...createGradientBackground(story),
                                    backgroundColor: "#222",
                                },
                            }}
                        >
                            <StorySummary
                                {...{
                                    storyInfo: story,
                                    index,
                                    compact: true,
                                    excludeNumber: true,
                                    style: {
                                        height: "8vw",
                                        backgroundColor: "transparent",
                                    },
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
                    </div>,
                    document.getElementById("hn-and-chill") // TODO: do this the right way
                )}
        </>
    )
}

function StoryDetails({ story }) {
    return (
        <div className="story-details" style={{ opacity: 1 }}>
            <div>
                <div>{story.score + " pts"}</div>
                <div>{getTimeElapsed(story.time)}</div>
                <div>
                    {story.descendants}{" "}
                    <FontAwesomeIcon
                        icon={faComment}
                        style={{ marginLeft: 4 }}
                    />
                </div>
            </div>
            <div>
                <div>{story.by}</div>
                <div>{story.url ? new URL(story.url).hostname : ""}</div>
            </div>
        </div>
    )
}

const createGradientBackground = ({ score = 0, time, descendants = 0 }) => {
    const mappedTime =
        255 - ((new Date().getTime() / 1000 - time) / (60 * 60 * 24 * 3)) * 255
    const mappedScore = (score / 500) * 180 + 75
    const mappedDescendants = descendants % 255
    return {
        background: `radial-gradient(
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

const calculateStoryCardStyle = (expanded = false, storyCardPositionRef) => {
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
            top: `calc(
                ${storyCardPositionRef.top}px -
                ${expandedStyle.height / 2}vw +
                ${collapsedStyle.height / 2}vw
            )`,
            left: `calc(
                ${storyCardPositionRef.left}px -
                ${expandedStyle.width / 2}vw +
                ${collapsedStyle.width / 2}vw
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
