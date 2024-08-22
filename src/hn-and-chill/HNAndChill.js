import React, { useEffect, useState, useRef, useReducer } from "react"
import { STORY_TYPES } from "../util"
import useHackerNewsApi from "../useHackerNewsApi"
import { StorySummary } from "../components/StorySummary"

import "./HNAndChill.scss"

export function HackerNews() {
    const { stories, error, fetchAgain } = useHackerNewsApi(STORY_TYPES.TOP)
    const [scrollLeft, setScrollLeft] = useState(0)
    const storiesRef = useRef()

    return (
        <div>
            <h2>Top Stories on Hacker News</h2>
            <div className="carousel">
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
                            <StorySummary {...{ storyInfo: story, index: i }} />
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
