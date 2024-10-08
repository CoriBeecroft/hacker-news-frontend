import React, { useState, useRef, useLayoutEffect, useEffect } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
    faChevronLeft,
    faChevronRight,
} from "@fortawesome/free-solid-svg-icons"
import "./Carousel.scss"

export default function Carousel({ title, items, itemRenderer }) {
    const [xTranslation, setXTranslation] = useState(0)
    const [index, setIndex] = useState(0)
    const [offset, setOffset] = useState(0)
    const [numFullItemsVisible, setNumFullItemsVisible] = useState(0)
    const [itemWidthPlusMargin, setItemWidthPlusMargin] = useState(0)
    const itemContainerRef = useRef()

    const calculateItemWidthPlusMargin = () => {
        if (items.length === 0) return

        const { width } = itemContainerRef.current
            .getElementsByClassName("story-card")[0]
            .getBoundingClientRect()

        // It should be safe to assume margin-left and margin-right will be in px as
        // long as margin isn't set to 'none' or 'contents'.
        // https://developer.mozilla.org/en-US/docs/Web/API/Window/getComputedStyle#notes
        // https://developer.mozilla.org/en-US/docs/Web/CSS/used_value
        // https://drafts.csswg.org/cssom/#resolved-values
        const computedStyle = getComputedStyle(
            itemContainerRef.current.getElementsByClassName("story-card")[0]
        )
        const marginLeft = Number(
            computedStyle["margin-left"].replace("px", "")
        )
        const marginRight = Number(
            computedStyle["margin-right"].replace("px", "")
        )

        setItemWidthPlusMargin(width + marginLeft + marginRight)
    }
    useLayoutEffect(calculateItemWidthPlusMargin, [items])

    function calculateOffsetAndVisibleItems() {
        const numFullItemsVisible = Math.floor(
            window.innerWidth / itemWidthPlusMargin
        )
        setOffset(
            (window.innerWidth - numFullItemsVisible * itemWidthPlusMargin) / 2
        )
        setNumFullItemsVisible(numFullItemsVisible)
    }

    useEffect(() => {
        window.addEventListener("resize", calculateItemWidthPlusMargin)
        return () =>
            window.removeEventListener("resize", calculateItemWidthPlusMargin)
    }, [items])

    return (
        <div className="carousel">
            <h2>{title}</h2>
            <div className="viewport">
                <ProgressIndicator
                    {...{ numItems: items.length, index, numFullItemsVisible }}
                />
                <CarouselButton
                    {...{
                        direction: "LEFT",
                        setXTranslation,
                        itemWidthPlusMargin,
                        index,
                        setIndex,
                        offset,
                        numFullItemsVisible,
                        calculateOffsetAndVisibleItems,
                        numItems: items.length,
                    }}
                />
                <div
                    ref={itemContainerRef}
                    className="item-container"
                    style={{
                        transform: `translate(${xTranslation}px, 0px)`,
                        width: itemWidthPlusMargin * items.length,
                    }}
                >
                    {items.map(itemRenderer)}
                </div>
                <CarouselButton
                    {...{
                        direction: "RIGHT",
                        setXTranslation,
                        itemWidthPlusMargin,
                        index,
                        setIndex,
                        offset,
                        numFullItemsVisible,
                        calculateOffsetAndVisibleItems,
                        numItems: items.length,
                    }}
                />
            </div>
        </div>
    )
}

function ProgressIndicator({ numItems, index, numFullItemsVisible }) {
    const frameIndex = Math.ceil(index / numFullItemsVisible)
    const window =
        (100 * numFullItemsVisible) /
        (Math.ceil(numItems / numFullItemsVisible) * numFullItemsVisible)

    return (
        <div className="progress-indicator">
            <div
                style={{
                    width: window + "%",
                    transform: `translateX(${100 * frameIndex}%)`,
                }}
            />
        </div>
    )
}

function CarouselButton({
    direction,
    setXTranslation,
    itemWidthPlusMargin,
    index,
    setIndex,
    offset,
    numFullItemsVisible,
    calculateOffsetAndVisibleItems,
    numItems,
}) {
    const ref = useRef()
    const directionModifier = direction == "LEFT" ? 1 : -1

    const calculateTranslation = () =>
        setXTranslation(-1 * index * itemWidthPlusMargin + offset)

    useEffect(calculateTranslation, [offset, index])

    useLayoutEffect(calculateOffsetAndVisibleItems, [itemWidthPlusMargin])

    useEffect(() => {
        window.addEventListener("resize", calculateOffsetAndVisibleItems)
        return () =>
            window.removeEventListener("resize", calculateOffsetAndVisibleItems)
    }, [itemWidthPlusMargin])
    return (
        <button
            {...{
                ref,
                className: direction.toLowerCase(),
                onClick: () =>
                    setIndex(i =>
                        Math.max(
                            Math.min(
                                i +
                                    -1 *
                                        directionModifier *
                                        Math.max(
                                            Math.floor(numFullItemsVisible),
                                            1
                                        ),
                                numItems - numFullItemsVisible
                            ),
                            0
                        )
                    ),
            }}
        >
            <FontAwesomeIcon
                {...{
                    className: "arrow",
                    icon: direction === "LEFT" ? faChevronLeft : faChevronRight,
                }}
            />
            {/* {direction === "LEFT" ? "<" : ">"} */}
        </button>
    )
}
