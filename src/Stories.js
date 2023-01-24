import React, { useEffect, useRef } from 'react';
import { getMainContentHeight, getTimeElapsed } from "./util"

export function Stories(props) {
	const ref = useRef(null);
	useEffect(() => {
		if(ref.current) { ref.current.scrollTop = 0 }
	}, [ props.storyType ])

	return <div { ...{
		ref,
        className: "stories",
        style: { height: getMainContentHeight() },
		onScroll: props.loading ? () => {} : (e) => {
			const element = e.target
			const height = element.getBoundingClientRect().height;
			const nearBottom = element.scrollTop + height + 50 >= element.scrollHeight;

			if(nearBottom) { props.fetchNextStories() }
		}
    }}>
		{ props.storyIds.map((storyId, index) => <StorySummary { ...{
            key: storyId,
			index,
            storyInfo: props.stories[storyId],
            active: props.currentStory == storyId,
			loading: props.loading && !props.stories[storyId],
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
