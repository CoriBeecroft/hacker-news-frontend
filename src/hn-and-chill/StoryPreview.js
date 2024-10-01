import React, { useEffect, useRef, useState } from "react"
import { getRandomInt } from "../util"
import { animate } from "./util"
import { StorySummary } from "../components/StorySummary"
import { Comment } from "../components/Comment"
import { createGradientBackground } from "./util"

import "./StoryPreview.scss"

export default function StoryPreview({ story }) {
    const [commentId, setCommentId] = useState(null)

    // useEffect(() => {
    //     if (!(story && story.kids && story.kids.length > 0)) {
    //         return
    //     }
    //     setCommentId(story.kids[getRandomInt(0, story.kids.length - 1)])
    //     console.log(story.kids)
    //     setInterval(() => {
    //         setCommentId(story.kids[getRandomInt(0, story.kids.length - 1)])
    //     }, 10000)
    // }, [story])

    return (
        <div
            className="story-preview"
            style={
                story && {
                    ...createGradientBackground(story, true),
                    backgroundColor: "#111",
                }
            }
        >
            <div className="content">
                {story && (
                    <StorySummary
                        {...{
                            storyInfo: story,
                            excludeNumber: true,
                        }}
                    />
                )}
                <div className="comment-container">
                    <PreviewComment />
                    {/* {commentId && (
                    <Comment
                        {...{
                            id: commentId,
                            offset: 0,
                            renderChildren: false,
                        }}
                    />
                )} */}
                </div>
            </div>
            <div className="gradient-overlay" />
        </div>
    )
}

function PreviewComment() {
    const [animate, setAnimate] = useState(false)
    const [people, setPeople] = useState([
        {
            id: 0,
            zLayer: 0,
            side: "right",
        },
        {
            id: 1,
            zLayer: 1,
            side: "left",
        },
        {
            id: 2,
            zLayer: 1.5,
            side: "right",
        },
        {
            id: 3,
            zLayer: 2,
            side: "left",
        },
        {
            id: 4,
            zLayer: 2.5,
            side: "right",
        },
        {
            id: 5,
            zLayer: 3,
            side: "left",
        },
        {
            id: 6,
            zLayer: 3.5,
            side: "right",
        },
        {
            id: 7,
            zLayer: 4,
            side: "left",
        },
    ])

    const styles = {
        left: {
            top: "100%",
            left: "0%",
        },
        right: {
            top: "100%",
            left: "100%",
        },
        zLayer: {
            0: { opacity: 1, zIndex: 4 },
            1: { opacity: 1, zIndex: 3 },
            2: { opacity: 0.35, zIndex: 2 },
            3: { opacity: 0.08, zIndex: 1 },
            4: { opacity: 0, zIndex: 0 },
        },
    }

    const scales = [
        1,
        1,
        0.83,
        0.83 * 0.55,
        0.83 * 0.55 * 0.83,
        0.83 * 0.55 * 0.83 * 0.55,
        0.83 * 0.55 * 0.83 * 0.55 * 0.83,
        0.83 * 0.55 * 0.83 * 0.55 * 0.83,
    ]
    const translations = {
        left: {
            x: 0,
            y: -100,
            zLayer: {
                0: { x: -50, y: 100 },
                1: { x: 0, y: 0 },
                2: { x: 10, y: 10 },
                3: { x: 20, y: 17 },
                4: { x: 20, y: 17 },
            },
        },
        right: {
            x: -100,
            y: -100,
            zLayer: {
                0: { x: 50, y: 100 },
                1: { x: 0, y: 0 },
                2: { x: -10, y: 10 },
                3: { x: -20, y: 17 },
                4: { x: -20, y: 17 },
            },
        },
    }

    return (
        <div
            onClick={() => {
                setPeople(prevPeople => {
                    let newPeople = prevPeople.map((person, i) => {
                        return {
                            ...person,
                            zLayer:
                                (person.zLayer -
                                    (person.zLayer === 1 || person.zLayer == 0
                                        ? 1
                                        : 0.5) +
                                    5) %
                                5,
                        }
                    })
                    newPeople = [
                        ...newPeople.filter((p, i) => i !== 0),
                        ...newPeople.filter((p, i) => i === 0),
                    ]
                    return newPeople
                })
            }}
        >
            {people.map((person, i) => {
                return (
                    <CommentAndStickFigure
                        {...{
                            key: person.id,
                            featured: i <= 1,
                            text: i <= 1 ? "test oddling" : "",
                            flipText: person.side === "right",
                            style: {
                                ...(person.zLayer === 4
                                    ? { border: "1px solid red" }
                                    : {}),
                                ...styles[person.side],
                                ...styles.zLayer[Math.floor(person.zLayer)],
                                transform: `translate(
                                    ${
                                        translations[person.side].x +
                                        translations[person.side].zLayer[
                                            Math.floor(person.zLayer)
                                        ].x
                                    }%,
                                    ${
                                        translations[person.side].y +
                                        translations[person.side].zLayer[
                                            Math.floor(person.zLayer)
                                        ].y
                                    }%
                                ) scale(
                                    ${
                                        (person.side === "left" ? 1 : -1) *
                                        scales[i]
                                    },
                                    ${scales[i]}
                                )`,
                            },
                        }}
                    />
                )
            })}
        </div>
    )
}

const CommentAndStickFigure = ({
    style = {},
    featured = false,
    text = "",
    flipText = false,
}) => {
    const svgRef = useRef(null)
    const pathRef = useRef()
    const [foreignObjectProps, setForeignObjectProps] = useState({
        x: 0,
        y: 0,
        width: 0,
        height: 0,
    })

    useEffect(() => {
        if (pathRef.current && svgRef.current) {
            const bbox = pathRef.current.getBBox()
            console.log(bbox)

            setForeignObjectProps({
                x: bbox.x + bbox.width * 0.1, // 10% padding on each side
                y: bbox.y + bbox.height * 0.1,
                width: bbox.width * 0.8, // 80% of path width
                height: bbox.height * 0.8, // 80% of path height
            })
        }
    }, [pathRef.current])

    return (
        <svg
            {...{
                ref: svgRef,
                className: [
                    "comment-and-stick-figure",
                    featured ? "featured" : "",
                ].join(" "),
                style: { ...style, ...(featured ? { zIndex: 5 } : {}) },
                viewBox: "0 0 744 831",
                fill: "none",
                xmlns: "http://www.w3.org/2000/svg",
            }}
        >
            {/* stick figure */}
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M109.882 450.144C131.262 443.878 144.226 419.833 147.147 397.466C150.755 369.83 132.422 335.997 104.828 332.391C77.2347 328.785 50.8294 356.771 47.2208 384.407C44.0993 408.312 62.2668 438.444 83.7344 448.351L82.6545 459.995L70.0986 464.145C62.2376 466.743 56.3797 473.366 54.7606 481.485L40.1713 554.644C39.0698 560.168 39.1473 565.862 40.3986 571.354L54.5326 633.381C55.3752 637.079 54.0292 637.857 57.0668 639.619L58.8609 645.867L51.4777 699.889L2.60656 794.293C-0.704881 800.689 1.85507 808.579 8.32436 811.914C14.7937 815.249 22.7225 812.767 26.0339 806.37L75.3516 711.103C76.1002 709.657 76.5488 708.135 76.7199 706.606C77.0303 705.785 77.2623 704.922 77.4056 704.023L87.7628 639.076L104.417 695.978L104.438 696.048L101.454 790.993C101.227 798.193 106.941 804.203 114.215 804.416C121.489 804.629 127.57 798.965 127.796 791.765L133.179 707.465L133.983 698.788C133.983 698.788 133.515 687.199 132.216 685.105L117.402 632.037L102.602 596.381C101.666 593.18 100.874 591.988 101.247 587.968L110.727 508.772L133.323 567.049C135.374 572.336 140.615 575.684 146.274 575.322L208.686 571.33C215.907 570.868 221.388 564.631 220.929 557.399C220.47 550.168 214.244 544.68 207.023 545.142L152.587 548.625L130.292 488.932C126.868 479.763 119.95 472.324 111.053 468.244L108.32 466.991L109.882 450.144ZM70.8665 587.112L74.7139 508.473L66.2062 566.66L70.8665 587.112Z"
                fill="#CEC6C3"
            />
            {/* comment fill */}
            <path
                ref={pathRef}
                className="comment-fill"
                fillRule="evenodd"
                clipRule="evenodd"
                d="M209.892 352.609L201.694 377.947C201.453 378.691 202.121 379.411 202.881 379.227L294.86 356.942C295.996 356.729 300.625 355.983 305.806 356.38C307.444 356.506 309.047 356.699 310.642 357.09C325.75 360.797 400.137 386.989 448.282 387.906C451.766 387.973 455.267 387.992 458.784 387.963C590.971 386.879 695.791 319.029 718.628 235.442C721.887 223.514 723.519 211.202 723.366 198.609C722.793 151.665 697.362 108.106 654.097 74.7284C610.808 41.3323 550.255 18.7151 481.824 14.3086C472.715 13.7221 463.472 13.4588 454.118 13.5355C448.109 13.5847 442.149 13.7735 436.245 14.0972C312.362 20.8902 216.058 86.321 194.273 166.056C191.014 177.984 189.382 190.297 189.536 202.89C189.583 206.792 189.802 210.663 190.185 214.499C191.672 229.353 195.646 243.756 201.861 257.518C213.306 282.864 221.432 313.314 212.613 343.344L209.892 352.609Z"
                fill="#CEC6C3"
            />

            {/* comment outline */}
            <path
                className="comment-outline"
                fillRule="evenodd"
                clipRule="evenodd"
                d="M481.185 27.1487C472.134 26.585 462.945 26.3318 453.642 26.4055C447.666 26.4529 441.74 26.6345 435.872 26.9457C311.582 33.5365 219.348 96.739 199.026 168.672C195.993 179.409 194.48 190.463 194.623 201.763C194.667 205.268 194.87 208.744 195.226 212.187C196.604 225.505 200.292 238.479 206.122 250.965C218.411 277.283 228.238 311.079 217.83 345.348L214.979 354.737L213.278 359.821L286.827 342.588L287.167 342.526C287.937 342.386 289.273 342.173 290.996 341.99C300.999 340.928 310.381 343.057 317.88 345.23C320.35 345.946 323.147 346.77 326.225 347.677C339.345 351.545 357.564 356.915 377.312 361.772C401.853 367.807 427.614 372.75 447.781 373.121C451.245 373.185 454.727 373.204 458.224 373.176C591.423 372.12 691.616 310.346 712.84 235.22C715.787 224.787 717.39 209.471 717.243 197.818C716.716 155.991 693.305 116.054 651.163 84.6129C608.981 53.1428 549.298 31.3903 481.185 27.1487ZM453.422 0.539737C463.372 0.460855 473.207 0.731645 482.904 1.33552C555.636 5.86475 620.585 29.1301 667.501 64.1326C714.406 99.1273 743.338 145.892 743.989 197.503C744.158 210.916 742.401 228.729 738.641 242.037C712.863 333.285 597.314 397.941 458.444 399.042C454.703 399.071 450.979 399.052 447.271 398.983C423.884 398.552 395.655 392.973 370.719 386.84C350.29 381.816 331.308 376.219 318.208 372.357C315.215 371.474 312.529 370.682 310.203 370.009C303.671 368.116 298.472 367.218 293.915 367.702C293.218 367.776 292.686 367.853 292.38 367.902L204.089 388.589C179.727 396.298 172.717 392.092 182.924 366.521L189.418 347.11L192.167 338.059C199.912 312.556 193.013 285.741 181.745 261.611C174.784 246.703 170.293 231.011 168.611 214.763C168.178 210.57 167.931 206.341 167.877 202.079C167.704 188.313 169.55 174.86 173.224 161.855C197.739 75.0809 303.719 8.04796 434.407 1.1178C440.691 0.7846 447.031 0.590409 453.422 0.539737Z"
                fill="#CEC6C3"
            />

            <foreignObject {...foreignObjectProps}>
                <div
                    className={["comment-text", flipText ? "flip" : ""].join(
                        " "
                    )}
                    xmlns="http://www.w3.org/1999/xhtml"
                >
                    Lorem ipsum odor amet, consectetuer adipiscing elit.
                    Dictumst et porta posuere varius mus eget consequat bibendum
                    nascetur. Eget suspendisse senectus diam scelerisque aenean
                    in nostra ultricies mattis. Augue magnis suspendisse
                    sociosqu nisi donec. Magna fermentum hac phasellus praesent
                    sagittis turpis orci bibendum. Efficitur enim varius sem ad
                    senectus placerat senectus elit nam.
                </div>
            </foreignObject>
        </svg>
    )
}
