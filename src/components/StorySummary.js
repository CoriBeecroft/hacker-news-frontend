import React from 'react';
import { getTimeElapsed } from "../util"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faComment } from '@fortawesome/free-regular-svg-icons'

import "./StorySummary.scss";

export function StorySummary({active, loading, style, index, onClick, className, storyInfo}) {
	return <div { ...{
        className: [
			"story-info",
			(active ? "active" : ""),
			(loading ? "loading" : ""),
			className,
		].join(" "),
		onClick: onClick,
		style: style,
	}}>
		{ loading ? <div className="loading-block" /> : <>
			<StoryTitle { ...{
				url: storyInfo.url,
				title: storyInfo.title,
				index: index
			}} />
			<span>
				{ storyInfo.score + " pts"
				+ " | by " +  storyInfo.by
				+ " | " + getTimeElapsed(storyInfo.time).replace("hour", "hr").replace("minute", "min")
				+ (storyInfo.type === "job" ? ""
					: " | " + (storyInfo.descendants ?? 0)) }
				<FontAwesomeIcon icon={ faComment } style={{ marginLeft: 4 }} />

			</span>
		</> }
	</div>
}

function StoryTitle(props) {
	const indexAndTitleText = `${props.index + 1}. ${props.title}`;
	const domain = props.url ? new URL(props.url).hostname : "";
	return <h3>
		{ !props.url ? indexAndTitleText : <>
			<a { ...{
				onClick: e => e.stopPropagation(),
				href: props.url,
				target: "_blank"
			}}>{ indexAndTitleText }</a>
			{ " " }
			<span className="domain">
				({domain})
			</span>
		</> }
	</h3>
}
