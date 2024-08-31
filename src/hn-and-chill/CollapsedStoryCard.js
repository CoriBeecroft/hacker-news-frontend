import React from "react"
import { StorySummary } from "../components/StorySummary"
import { createGradientBackground, calculateCardDimensionStyle } from "./util"
import { EXPANDED, FULLY_EXPANDED } from "./StoryCard"

import "./CollapsedStoryCard.scss"

export default function CollapsedStoryCard({
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
