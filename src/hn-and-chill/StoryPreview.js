import React, { useEffect, useState } from "react"
import { getRandomInt } from "../util"
import { StorySummary } from "../components/StorySummary"
import { Comment } from "../components/Comment"
import { createGradientBackground } from "./util"

import "./HNAndChill.scss"

export default function StoryPreview({ story }) {
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
            style={story && createGradientBackground(story, true)}
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
