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
                        title: "Top Stories on Hacker News",
                        stories: topStories,
                    }}
                />
                <Carousel
                    {...{
                        title: "New Releases",
                        stories: newStories,
                    }}
                />
                <Carousel
                    {...{
                        title: "Classics",
                        stories: bestStories,
                    }}
                />
            </main>
        </>
    )
}

function Carousel({ title, stories }) {
    const [scrollLeft, setScrollLeft] = useState(0)
    const storiesRef = useRef()
    return (
        <div className="carousel">
            <h2>{title}</h2>
            <div className="carousel-viewport">
                <button
                    style={{ top: 0, left: 0 }}
                    onClick={() =>
                        setScrollLeft(psl => psl + window.innerWidth / 2)
                    }
                >
                    {"<"}
                </button>
                <div
                    ref={storiesRef}
                    className="story-container"
                    style={{ transform: `translate(${scrollLeft}px, 0px)` }}
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
                    style={{ top: 0, right: 0 }}
                    onClick={() =>
                        setScrollLeft(psl => psl - window.innerWidth / 2)
                    }
                >
                    {">"}
                </button>
            </div>
        </div>
    )
}
