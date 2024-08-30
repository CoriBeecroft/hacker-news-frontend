import React, { useState, useEffect, useRef } from "react"
// https://www.npmjs.com/package/react-animate-height
import AnimateHeight from "react-animate-height"
import { getTimeElapsed, HN_API_URL, LoadingSpinner } from "../util"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faChevronUp, faChevronDown } from "@fortawesome/free-solid-svg-icons"

import "./Comment.scss"

export function Comment({ id, offset, renderChildren = true }) {
    const [by, setBy] = useState("")
    const [text, setText] = useState("")
    const [time, setTime] = useState("")
    const [kids, setKids] = useState([])
    const [loading, setLoading] = useState(false)
    const [collapsed, setCollapsed] = useState(false)

    const getInfo = (id, signal) => {
        setLoading(true)

        fetch(HN_API_URL + "/item/" + id + ".json", {
            method: "get",
            signal,
        })
            .then(response => response.json())
            .then(commentData => {
                setBy(commentData.by)
                setText(commentData.text)
                setTime(getTimeElapsed(commentData.time))
                setKids(commentData.kids || [])
                setLoading(false)
            })
            .catch(error => {
                setLoading(false)

                if (
                    error instanceof DOMException &&
                    error.name === "AbortError"
                ) {
                    // console.log("Comment fetch cancelled.")
                } else {
                    console.error(error)
                }
            })
    }

    const toggleCollapsed = () => setCollapsed(!collapsed)

    useEffect(() => {
        const controller = new AbortController()
        const signal = controller.signal

        getInfo(id, signal)

        return () => {
            controller.abort()
        }
    }, [id])

    return (
        <div className="comment" style={{ marginLeft: offset }}>
            {!loading && by && text !== "[dead]" && (
                <div>
                    <CommentHeader
                        {...{ by, time, collapsed, toggleCollapsed }}
                    />
                    <AnimateHeight
                        duration={300}
                        height={collapsed ? 0 : "auto"}
                    >
                        <div
                            className="comment-body"
                            dangerouslySetInnerHTML={{ __html: text }}
                        />
                        {renderChildren &&
                            kids.map((id, index) => (
                                <Comment {...{ id, offset: 15, key: index }} />
                            ))}
                    </AnimateHeight>
                </div>
            )}
            {loading && <LoadingSpinner />}
        </div>
    )
}

function CommentHeader({ by, time, collapsed, toggleCollapsed }) {
    return (
        <h4 className="comment-header">
            <span>{by}</span>
            <span className="timestamp">{time}</span>
            <span onClick={toggleCollapsed}>
                <FontAwesomeIcon
                    {...{
                        className: "arrow",
                        icon: collapsed ? faChevronUp : faChevronDown,
                    }}
                />
            </span>
        </h4>
    )
}
