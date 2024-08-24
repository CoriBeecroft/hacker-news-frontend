import React, { useState, useRef, useLayoutEffect, useEffect } from "react"
import "./Carousel.scss"

export default function Carousel({ title, items, itemRenderer }) {
    const [xTranslation, setXTranslation] = useState(2.8)
    const [itemWidth, setItemWidth] = useState(0)
    const itemContainerRef = useRef()

    const calculateItemWidth = () => {
        if (items.length === 0) return

        const { width } = itemContainerRef.current
            .getElementsByClassName("story-card")[0]
            .getBoundingClientRect()

        setItemWidth(width)
    }
    useLayoutEffect(calculateItemWidth, [items])

    useEffect(() => {
        window.addEventListener("resize", calculateItemWidth)
    }, [items])

    return (
        <div className="carousel">
            <h2>{title}</h2>
            <div className="viewport">
                <CarouselButton {...{ direction: "LEFT", setXTranslation }} />
                <div
                    ref={itemContainerRef}
                    className="item-container"
                    style={{
                        transform: `translate(${xTranslation}vw, 0px)`,
                        width: `calc(${itemWidth * items.length}px + ${
                            items.length * 2 * 0.8
                        }vw)`,
                    }}
                >
                    {items.map(itemRenderer)}
                </div>
                <CarouselButton {...{ direction: "RIGHT", setXTranslation }} />
            </div>
        </div>
    )
}

function CarouselButton({ direction, setXTranslation }) {
    const directionModifier = direction == "LEFT" ? 1 : -1
    return (
        <button
            {...{
                className: direction.toLowerCase(),
                onClick: () =>
                    setXTranslation(
                        psl => psl + directionModifier * (22 * 2 + 2.8 + 0.4)
                    ),
            }}
        >
            {direction === "LEFT" ? "<" : ">"}
        </button>
    )
}
