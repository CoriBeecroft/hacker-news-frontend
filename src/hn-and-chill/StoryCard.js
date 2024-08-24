import React, { useState, useRef } from "react"
import { getTimeElapsed } from "../util"
import { StorySummary } from "../components/StorySummary"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faComment } from "@fortawesome/free-regular-svg-icons"
import { createPortal } from "react-dom"
import { debounce } from "lodash"

import "./StoryCard.scss"

export function StoryCard({ index, story }) {
    const [expanded, setExpanded] = useState(false)
    const storyCardRef = useRef()
    const storyCardPositionRef = useRef({ x: 0, y: 0 })
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

    const getstoryCardPositionRef = () => {
        if (!storyCardRef.current) return

        const { left, top } = storyCardRef.current.getBoundingClientRect()
        storyCardPositionRef.left = left
        storyCardPositionRef.top = top
    }

    const expandCard = debounce(() => {
        if (!expanded) {
            getstoryCardPositionRef()
            setExpanded(true)
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
                        if (!expanded) {
                            expandCard.cancel()
                            setExpanded(false)
                        }
                    },
                    style: {
                        width: collapsedStyle.width + "vw",
                        minWidth: collapsedStyle.minWidth + "px",
                        maxWidth: collapsedStyle.maxWidth + "px",
                        height: collapsedStyle.height + "vw",
                        minHeight: collapsedStyle.minHeight + "px",
                        maxHeight: collapsedStyle.maxHeight + "px",
                    },
                }}
            >
                <StorySummary
                    {...{
                        storyInfo: story,
                        index,
                        compact: true,
                        excludeNumber: true,
                    }}
                />
            </div>
            {expanded &&
                createPortal(
                    <div
                        {...{
                            className: `story-card ${
                                expanded ? "expanded" : ""
                            }`,
                            onMouseLeave: () => {
                                setExpanded(false)
                            },
                            style: {
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
                            },
                        }}
                    >
                        <StorySummary
                            {...{
                                storyInfo: story,
                                index,
                                compact: true,
                                excludeNumber: true,
                            }}
                        />
                        <StoryDetails {...{ story }} />
                    </div>,
                    document.getElementById("hn-and-chill")
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
