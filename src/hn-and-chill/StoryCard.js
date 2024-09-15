import React, { useState, useRef, useEffect } from "react"
import { createPortal } from "react-dom"
import { debounce } from "lodash"
import CollapsedStoryCard from "./CollapsedStoryCard"
import ExpandedStoryCard from "./ExpandedStoryCard"
import FullyExpandedStoryCard from "./FullyExpandedStoryCard"

import "./StoryCard.scss"

// States
export const COLLAPSED = "COLLAPSED",
    EXPANDED = "EXPANDED",
    FULLY_EXPANDED = "FULLY_EXPANDED"

export default function StoryCard({
    index,
    story,
    modalOpenCallback,
    modalCloseCallback,
    dimensions,
    active,
    setActive,
    id,
}) {
    const [state, setState] = useState(COLLAPSED)
    const storyCardRef = useRef()
    const storyCardPositionRef = useRef({ top: 0, left: 0 })

    const getStoryCardPosition = () => {
        if (!storyCardRef.current) return

        const { left, top } = storyCardRef.current.getBoundingClientRect()
        storyCardPositionRef.current.left = left
        storyCardPositionRef.current.top = top
    }

    const expandCard = debounce(() => {
        if (state === COLLAPSED) {
            getStoryCardPosition()
            setState(EXPANDED)
        }
    }, 500)

    useEffect(() => {
        if (!active && state != COLLAPSED) {
            setState(COLLAPSED)
        }
    }, [active])

    useEffect(() => {
        if (state !== COLLAPSED) {
            setActive(id)
        }
    }, [state])

    return (
        <>
            <CollapsedStoryCard
                {...{
                    story,
                    index,
                    state,
                    setState,
                    storyCardRef,
                    storyCardPositionRef,
                    expandCard,
                    dimensions,
                }}
            />
            {state === EXPANDED &&
                createPortal(
                    <ExpandedStoryCard
                        {...{
                            story,
                            index,
                            setState,
                            storyCardPositionRef,
                            expandCard,
                            dimensions,
                        }}
                    />,
                    document.getElementById("hn-and-chill") // TODO: do this the right way
                )}
            {state === FULLY_EXPANDED &&
                createPortal(
                    <FullyExpandedStoryCard
                        {...{
                            story,
                            index,
                            setState,
                            modalOpenCallback,
                            modalCloseCallback,
                        }}
                    />,
                    document.getElementById("hn-and-chill") // TODO: do this the right way
                )}
        </>
    )
}
