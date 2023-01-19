import React from 'react';
import {
	getMainContentHeight,
	getTimeElapsed,
	LoadingSpinner
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
            updateStorySelection: () => props.updateStorySelection(storyId)
		}} />) }
	</div>
}

function StorySummary(props) {
	return <div { ...{
        className: "story-info " + (props.active ? "active" : ""),
		onClick: props.updateStorySelection,
	}}>
		{ props.title && <>
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
		{ !props.title && <LoadingSpinner /> }
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
