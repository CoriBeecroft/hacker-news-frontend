import React from 'react';
import { getTimeElapsed } from "./util"

import "./StorySummary.scss";

export function StorySummary(props) {
	return <div { ...{
        className: [
			"story-info",
			(props.active ? "active" : ""),
			(props.loading ? "loading" : "")
		].join(" "),
		onClick: props.loading ? () => {} : props.updateStorySelection,
	}}>
		{ props.loading ? <div className="loading-block" /> : <>
			<h3>
				{ (props.index + 1) + ". " }
				<StoryTitle { ...{ url: props.storyInfo.url, title: props.storyInfo.title }} />
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
 	return !props.url ? props.title :
		<a { ...{
			onClick: e => e.stopPropagation(),
			href: props.url,
			target: "_blank"
		}}>{ props.title }</a>
}
