import React, { useEffect, useState, useRef } from "react"
import { getRandomInt, STORY_TYPES } from "../util"
import useHackerNewsApi from "../useHackerNewsApi"
import Carousel from "./Carousel"
import StoryCard from "./StoryCard"
import StoryPreview from "./StoryPreview"

import "./HNAndChill.scss"

export default function HNAndChill() {
    const [modalIsOpen, setModalIsOpen] = useState(false)
    const [previewStory, setPreviewStory] = useState(null)
    const [scrollPosition, setScrollPosition] = useState(0)
    const [dimensions, setDimensions] = useState({
        width: window.innerWidth,
        height: window.innerHeight,
    })
    const [activeCardId, setActiveCardId] = useState(null)
    const topStories = useHackerNewsApi(STORY_TYPES.TOP).stories
    const newStories = useHackerNewsApi(STORY_TYPES.NEW).stories
    const bestStories = useHackerNewsApi(STORY_TYPES.BEST).stories

    const savedScrollY = useRef(0)

    useEffect(() => {
        const updateDimensions = () =>
            setDimensions({
                width: window.innerWidth,
                height: window.innerHeight,
            })
        window.addEventListener("resize", updateDimensions)
        return () => window.removeEventListener("resize", updateDimensions)
    }, [])

    const content = [
        {
            key: STORY_TYPES.TOP,
            title: "Top 30 Stories on Hacker News Right Now",
            stories: topStories.map((story, index) => {
                return {
                    ...story,
                    // This is just for debugging the time-based visualization.
                    // I'm just leaving it in for now 'cause I'm not done messing
                    // with the visualization.
                    // time:
                    //     new Date().getTime() / 1000 -
                    //     (index / 30) * 60 * 60 * 24 * 7,
                }
            }),
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

    useEffect(() => {
        const updateScrollPosition = () => setScrollPosition(window.scrollY)
        document.addEventListener("scroll", updateScrollPosition)

        return () =>
            document.removeEventListener("scroll", updateScrollPosition)
    }, [])

    useEffect(() => {
        if (topStories.length === 0) {
            return
        }

        const filteredTopStories = topStories.filter(
            story => story.descendants > 0
        )
        setPreviewStory(
            filteredTopStories[getRandomInt(0, filteredTopStories.length)]
        )
    }, [topStories])

    useEffect(() => {
        if (modalIsOpen) {
            document.getElementById("main").scrollTop = savedScrollY.current
        } else {
            window.scroll({ top: savedScrollY.current })
        }
    }, [modalIsOpen])

    return (
        <div id="hn-and-chill">
            <header
                className={
                    scrollPosition === 0 && !modalIsOpen
                        ? "preview-showing" // TODO: rename this class
                        : ""
                }
            >
                <h1>HN and Chill</h1>
            </header>

            <main id="main" className={modalIsOpen ? "modal-open" : ""}>
                <StoryPreview story={previewStory} />
                <div className="carousel-container">
                    {content.map(item => (
                        <StoryCarousel
                            {...{
                                ...item,
                                activeCardId,
                                setActiveCardId,
                                dimensions,
                                modalOpenCallback: () => {
                                    savedScrollY.current = window.scrollY
                                    setModalIsOpen(true)
                                },
                                modalCloseCallback: () => setModalIsOpen(false),
                            }}
                        />
                    ))}
                </div>
            </main>
        </div>
    )
}

function StoryCarousel({
    title,
    stories,
    modalOpenCallback,
    modalCloseCallback,
    dimensions,
    activeCardId,
    setActiveCardId,
}) {
    const carouselId = title.toLowerCase().split(" ").join("-")
    return (
        <Carousel
            {...{
                title,
                items: stories,
                itemRenderer: (story, i) => (
                    <StoryCard
                        {...{
                            story,
                            key: story.id,
                            index: i,
                            modalOpenCallback,
                            modalCloseCallback,
                            dimensions,
                            id: carouselId + "-" + story.id,
                            active:
                                activeCardId === carouselId + "-" + story.id,
                            setActive: setActiveCardId,
                        }}
                    />
                ),
            }}
        />
    )
}
