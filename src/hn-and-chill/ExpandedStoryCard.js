import React, { useRef, useLayoutEffect, useCallback } from "react"
import {
    StorySummary,
    SubmissionTime,
    SubmittedBy,
    Score,
    NumComments,
    Domain,
} from "../components/StorySummary"
import { omit } from "lodash"
import {
    createGradientBackground,
    calculateCardDimensionStyle,
    animate,
} from "./util"
import { COLLAPSED, FULLY_EXPANDED } from "./StoryCard"

import "./ExpandedStoryCard.scss"

export default function ExpandedStoryCard({
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
    const easing = "cubic-bezier(0.5, 0, 0.1, 1)"

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
