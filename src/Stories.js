import React from 'react';
import {
	getMainContentHeight,
	getTimeElapsed,
} from "./util"

export function Stories(props) {
	return <div { ...{
        className: "stories",
        style: { height: getMainContentHeight() }
    }}>
		{ props.storyIds.map(storyId => <StorySummary { ...{
            key: storyId,
            ...props.stories[storyId],
            active: props.currentStory == storyId,
			loading: props.loading,
            updateStorySelection: () => props.updateStorySelection(storyId)
		}} />) }
	</div>
}

function StorySummary(props) {
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
				<StoryTitle { ...{ url: props.url, title: props.title }} />
			</h3>
			<span>
				{ props.score + " pts"
				+ " | by " +  props.by
				+ " | " + getTimeElapsed(props.time)
				+ (props.type !== "job" ? " | " + (props.descendants ?? 0) + " comments" : "") }
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
