import React, { useEffect, useState, useRef, useReducer } from "react"
import { STORY_TYPES } from "../util"
import useHackerNewsApi from "../useHackerNewsApi"
import { StorySummary } from "../components/StorySummary"
import Carousel from "./Carousel"

import "./HNAndChill.scss"

export function HackerNews() {
    const topStories = useHackerNewsApi(STORY_TYPES.TOP).stories
    const newStories = useHackerNewsApi(STORY_TYPES.NEW).stories
    const bestStories = useHackerNewsApi(STORY_TYPES.BEST).stories

    return (
        <>
            <header>
                <h1>HN and Chill</h1>
            </header>
            <main>
                <Carousel
                    {...{
                        title: "Top 30 Stories on Hacker News Right Now",
                        stories: topStories,
                    }}
                />
                <Carousel
                    {...{
                        title: "New Releases",
                        stories: newStories,
                        stories: newStories,
                    }}
                />
                <Carousel
                    {...{
                        title: "Classics",
                        stories: topStories,
                        stories: bestStories,
                    }}
                />
            </main>
        </>
    )
}
