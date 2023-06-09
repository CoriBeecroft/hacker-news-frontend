import React from 'react';
import { getTimeElapsed } from "../util"

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
			<h3>
				<StoryTitle { ...{
					url: props.storyInfo.url,
					title: props.storyInfo.title,
					index: props.index
				}} />
			</h3>
			<span>
				{ props.storyInfo.score + " pts"
				+ " | by " +  props.storyInfo.by
				+ " | " + getTimeElapsed(props.storyInfo.time)
				+ (props.storyInfo.type === "job" ? ""
					: " | " + (props.storyInfo.descendants ?? 0) + " comments") }
			</span>
		</> }
	</div>
}

function StoryTitle(props) {
	const indexAndTitle = `${props.index + 1}. ${props.title}`;
 	return !props.url ? indexAndTitle :
		<a { ...{
			onClick: e => e.stopPropagation(),
			href: props.url,
			target: "_blank"
		}}>{ indexAndTitle }</a>
}
