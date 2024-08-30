import React, { useEffect, useState } from "react"
import { getRandomInt, STORY_TYPES } from "../util"
import useHackerNewsApi from "../useHackerNewsApi"
import Carousel from "./Carousel"
import { StoryCard } from "./StoryCard"
import { StorySummary } from "../components/StorySummary"
import { Comment } from "../components/Comment"
import { createGradientBackground } from "./util"
import "./HNAndChill.scss"

export function HNAndChill() {
    const topStories = useHackerNewsApi(STORY_TYPES.TOP).stories
    const newStories = useHackerNewsApi(STORY_TYPES.NEW).stories
    const bestStories = useHackerNewsApi(STORY_TYPES.BEST).stories
    const [previewStory, setPreviewStory] = useState(null)
    const [scrollPosition, setScrollPosition] = useState(0)

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

    useEffect(() => {
        document.addEventListener("scroll", e => {
            setScrollPosition(window.scrollY)
        })
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

    return (
        <div id="hn-and-chill">
            <header className={scrollPosition === 0 ? "preview-showing" : ""}>
                <h1>HN and Chill</h1>
            </header>

            <main>
                <StoryPreview story={previewStory} />
                <div className="carousel-container">
                    {content.map(item => (
                        <StoryCarousel {...item} />
                    ))}
                </div>
            </main>
        </div>
    )
}

function StoryPreview({ story }) {
    const [commentId, setCommentId] = useState(null)

    useEffect(() => {
        if (!(story && story.kids && story.kids.length > 0)) {
            return
        }
        setCommentId(story.kids[getRandomInt(0, story.kids.length - 1)])
        setInterval(() => {
            setCommentId(story.kids[getRandomInt(0, story.kids.length - 1)])
        }, 10000)
    }, [story])

    return (
        <div
            className="story-preview"
            style={story && createGradientBackground(story)}
        >
            <div className="gradient-overlay" />
            <div className="comment-container">
                {commentId && (
                    <Comment
                        {...{
                            id: commentId,
                            offset: 0,
                            renderChildren: false,
                        }}
                    />
                )}
            </div>
            {story && (
                <StorySummary
                    {...{
                        storyInfo: story,
                        excludeNumber: true,
                    }}
                />
            )}
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
