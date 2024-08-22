import React, { useEffect, useState, useRef, useReducer } from "react"
import { STORY_TYPES } from "../util"
import useHackerNewsApi from "../useHackerNewsApi"
import { StorySummary } from "../components/StorySummary"

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
                        stories: topStories,
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

function Carousel({ title, stories }) {
    const [scrollLeft, setScrollLeft] = useState(2.8)
    const storiesRef = useRef()
    return (
        <div className="carousel">
            <h2>{title}</h2>
            <div className="carousel-viewport">
                <button
                    className="left"
                    style={{ top: 0, left: 0 }}
                    onClick={() =>
                        setScrollLeft(psl => psl + 22 * 2 + 2.8 + 0.4)
                    }
                >
                    {"<"}
                </button>
                <div
                    ref={storiesRef}
                    className="story-container"
                    style={{ transform: `translate(${scrollLeft}vw, 0px)` }}
                >
                    {stories.map((story, i) => (
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
                    ))}
                </div>
                <button
                    className="right"
                    style={{ top: 0, right: 0 }}
                    onClick={() =>
                        setScrollLeft(psl => psl - 22 * 2 - 2.8 - 0.4)
                    }
                >
                    {">"}
                </button>
            </div>
        </div>
    )
}
