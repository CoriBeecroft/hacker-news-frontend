import React from 'react';
import { getTimeElapsed } from "../util"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faComment } from '@fortawesome/free-regular-svg-icons'

import "./StorySummary.scss";

export function StorySummary(props) {
	return <div { ...{
        className: [
			"story-info",
			(props.active ? "active" : ""),
			(props.loading ? "loading" : ""),
			props.className,
		].join(" "),
		onClick: props.onClick,
		style: props.style,
	}}>
		{ props.loading ? <div className="loading-block" /> : <>
			<StoryTitle { ...{
				url: props.storyInfo.url,
				title: props.storyInfo.title,
				index: props.index
			}} />
			<span>
				{ props.storyInfo.score + " pts"
				+ " | by " +  props.storyInfo.by
				+ " | " + getTimeElapsed(props.storyInfo.time).replace("hour", "hr").replace("minute", "min")
				+ (props.storyInfo.type === "job" ? ""
					: " | " + (props.storyInfo.descendants ?? 0)) }
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
