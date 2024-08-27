import React from "react"
import { getTimeElapsed } from "../util"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faComment } from "@fortawesome/free-regular-svg-icons"

import "./StorySummary.scss"

export function StorySummary({
    active,
    loading,
    style,
    index,
    onClick,
    className,
    storyInfo,
    compact = false,
    excludeNumber = false,
}) {
    return (
        <div
            {...{
                className: [
                    "story-summary",
                    active ? "active" : "",
                    loading ? "loading" : "",
                    className,
                ].join(" "),
                onClick: onClick,
                style: style,
            }}
        >
            {loading ? (
                <div className="loading-block" />
            ) : (
                <>
                    <StoryTitle
                        {...{
                            url: storyInfo.url,
                            title: storyInfo.title,
                            index: index,
                            compact,
                            excludeNumber,
                        }}
                    />
                    {!compact && (
                        <span>
                            <Score score={storyInfo.score} />
                            {" | "}
                            <SubmittedBy by={storyInfo.by} />
                            {" | "}
                            <SubmissionTime time={storyInfo.time} />
                            {storyInfo.type === "job" ? "" : " | "}
                            <NumComments
                                {...{
                                    type: storyInfo.type,
                                    descendants: storyInfo.descendants,
                                }}
                            />
                        </span>
                    )}
                </>
            )}
        </div>
    )
}

function StoryTitle({ title, index, excludeNumber, url, compact }) {
    const indexAndTitleText = [
        ...(!excludeNumber ? [`${index + 1}.`] : []),
        title,
    ].join(" ")

    return (
        <h3>
            {!url ? (
                indexAndTitleText
            ) : (
                <>
                    <a
                        {...{
                            onClick: e => e.stopPropagation(),
                            href: url,
                            target: "_blank",
                        }}
                    >
                        {indexAndTitleText}
                    </a>{" "}
                    {!compact && (
                        <span>
                            (<Domain {...{ url }} />)
                        </span>
                    )}
                </>
            )}
        </h3>
    )
}

export const Score = ({ score }) => {
    return <div>{score + " pts"}</div>
}
export const SubmittedBy = ({ by }) => {
    return <div>{"by " + by}</div>
}
export const SubmissionTime = ({ time }) => {
    return <div>{getTimeElapsed(time)}</div>
}
export const NumComments = ({ type, descendants }) => {
    return (
        <div>
            {type !== "job" && (
                <>
                    {descendants ?? 0}
                    <FontAwesomeIcon
                        icon={faComment}
                        style={{ marginLeft: 4 }}
                    />
                </>
            )}
        </div>
    )
}
export const Domain = ({ url }) => {
    const domain = url ? new URL(url).hostname : ""
    return <div className="domain">{domain}</div>
}
