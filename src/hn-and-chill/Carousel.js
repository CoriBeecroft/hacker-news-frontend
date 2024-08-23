import React, { useState } from "react"
import "./Carousel.scss"

export default function Carousel({ title, items, itemRenderer }) {
    const [xTranslation, setXTranslation] = useState(2.8)
    return (
        <div className="carousel">
            <h2>{title}</h2>
            <div className="viewport">
                <CarouselButton {...{ direction: "LEFT", setXTranslation }} />
                <div
                    className="item-container"
                    style={{ transform: `translate(${xTranslation}vw, 0px)` }}
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
