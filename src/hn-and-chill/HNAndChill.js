import React from "react"
import { STORY_TYPES } from "../util"
import useHackerNewsApi from "../useHackerNewsApi"
import Carousel from "./Carousel"
import { StoryCard } from "./StoryCard"
import "./HNAndChill.scss"

export function HNAndChill() {
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
            stories: newStories,
        },
        {
            key: STORY_TYPES.BEST,
            title: "Classics",
            stories: bestStories,
        },
    ]

    return (
        <div id="hn-and-chill">
            <header>
                <h1>HN and Chill</h1>
            </header>
            <main>
                {content.map(item => (
                    <StoryCarousel {...item} />
                ))}
            </main>
        </div>
    )
}

function StoryCarousel({ title, stories }) {
    return (
        <Carousel
            {...{
                title,
                items: stories,
                itemRenderer: (story, i) => (
                    <StoryCard {...{ story, key: story.id, index: i }} />
                ),
            }}
        />
    )
}
