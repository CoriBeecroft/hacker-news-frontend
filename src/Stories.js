import React, { useEffect, useRef } from 'react';
import { getMainContentHeight } from "./util"
import { StorySummary } from './StorySummary';

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
			onClick: props.loading ? () => {} : () => props.updateStorySelection(storyId),
			loading: props.loading && !props.stories[storyId],
		}} />) }
	</div>
}

