import React, { useState, useRef } from "react"
import { StorySummary } from "../components/StorySummary"

import "./Carousel.scss"

export default function Carousel({ title, stories }) {
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
