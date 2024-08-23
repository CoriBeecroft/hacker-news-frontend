import React from "react"
import { STORY_TYPES } from "../util"
import useHackerNewsApi from "../useHackerNewsApi"
import { StorySummary } from "../components/StorySummary"
import Carousel from "./Carousel"

import "./HNAndChill.scss"

export function HackerNews() {
    const topStories = useHackerNewsApi(STORY_TYPES.TOP).stories
    const newStories = useHackerNewsApi(STORY_TYPES.NEW).stories
    const bestStories = useHackerNewsApi(STORY_TYPES.BEST).stories

    const content = [
        {
            key: STORY_TYPES.TOP,
            title: "Top 30 Stories on Hacker News Right Now",
            stories: topStories,
        },
        {
            key: STORY_TYPES.NEW,
            title: "New Releases",
            // stories: topStories,
            stories: newStories,
        },
        {
            key: STORY_TYPES.BEST,
            title: "Classics",
            // stories: topStories,
            stories: bestStories,
        },
    ]

    return (
        <>
            <header>
                <h1>HN and Chill</h1>
            </header>
            <main>
                {content.map(item => (
                    <StoryCarousel {...item} />
                ))}
            </main>
        </>
    )
}

function StoryCarousel({ title, stories }) {
    return (
        <Carousel
            {...{
                title,
                items: stories,
                itemRenderer: (story, i) => (
                    <div key={story.id} className="story-info-container">
                        <StorySummary
                            {...{
                                storyInfo: story,
                                index: i,
                                compact: true,
                                excludeNumber: true,
                            }}
                        />
                    </div>
                ),
            }}
        />
    )
}
