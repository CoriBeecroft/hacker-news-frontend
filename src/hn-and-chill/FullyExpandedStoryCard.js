import React, { useRef, useEffect, useLayoutEffect, useCallback } from "react"
import { StorySummary } from "../components/StorySummary"
import { StoryContent } from "../components/StoryContent"
import { createGradientBackground, animate } from "./util"
import { COLLAPSED } from "./StoryCard"

import "./FullyExpandedStoryCard.scss"

export default function FullyExpandedStoryCard({
    story,
    index,
    setState,
    modalOpenCallback = () => {},
    modalCloseCallback = () => {},
}) {
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

    useEffect(() => {
        modalOpenCallback()
        return modalCloseCallback
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
