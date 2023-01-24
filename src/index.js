import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { Stories } from "./Stories"
import { StoryContent } from "./StoryContent"
import {
	getMainContentHeight,
	HN_API_URL,
	STORY_TYPES,
	PAGE_SIZE,
	getQueryParam,
	setQueryParam
} from "./util"

import "./style.scss"

const getInitialStoryType = () => {
	return STORY_TYPES[getQueryParam("storyType").toUpperCase()]
		|| STORY_TYPES.TOP
}
const getInitialStoryIdsByType = () => {
	const storyIdsByType = {};
	Object.values(STORY_TYPES).forEach(storyType => {
		storyIdsByType[storyType] = [];
	})
	return storyIdsByType;
}

const getInitialStoriesByType = () => {
	const storiesByType = {};
	Object.values(STORY_TYPES).forEach(storyType => {
		storiesByType[storyType] = {};
	})
	return storiesByType;
}

function HackerNews() {
	const [ loadingStories, setLoadingStories ] = useState(false);
	const [ storyType, setStoryType ] = useState(getInitialStoryType());
	const [ storyIdsByType, setStoryIdsByType ] = useState(getInitialStoryIdsByType());
	const [ storiesByType, setStoriesByType] = useState(getInitialStoriesByType());
	const [ currentStory, setCurrentStory ] = useState(null);

	const fetchStoryIds = () => {
		setLoadingStories(true);
		const url = HN_API_URL + "/"
			+ storyType.toLowerCase()
			+  "stories.json";
		return fetch(url).then(response => response.json());
	}

	const fetchStoryContent = storyIds => {
		return storyIds.map(id =>
			fetch(HN_API_URL + "/item/" + id + ".json")
				.then(response => response.json())
		)
	}

	const fetchStories = () => {
		setLoadingStories(true);

		// TODO: modify this so the story ids don't have to be fetched
		// more than once
		fetchStoryIds().then(data => {
			// TODO: make offset a parameter to fetchStories
			const offset = storyIdsByType[storyType].length;
			const newStoryIds = data.slice(offset, offset + PAGE_SIZE);

			setStoryIdsByType(storyIdsByType => ({
				...storyIdsByType,
				[storyType]: storyIdsByType[storyType].concat(newStoryIds)
			}));

			Promise.all(fetchStoryContent(newStoryIds)).then(storyObjects => {
				const newStories = {};

				storyObjects.forEach(story => {
					if(story) { newStories[story.id] = story; }
				})
				setStoriesByType(prevStoriesByType => ({
					...prevStoriesByType,
					[storyType]: {
						...prevStoriesByType[storyType],
						...newStories
					}
				}));
				setLoadingStories(false);
			});
		});
	}

	const updateStorySelection = newCurrentStory => {
		setCurrentStory((newCurrentStory === currentStory) ? null : newCurrentStory);
	}

	useEffect(() => {
		// TODO: consider checking for story content also
		if(storyIdsByType[storyType].length == 0) {
			fetchStories();
		}
	}, [ storyType ]);

	return <div id="HNFE">
		<Header { ...{
			currentStoryType: storyType,
			setCurrentStoryType: newStoryType => {
				setStoryType(newStoryType)
				setCurrentStory(null)
				setQueryParam("storyType", newStoryType.toLowerCase())
			}
		}} />
		<main style={ currentStory == null ? { height: getMainContentHeight() } : {} }>
			<Stories { ...{
				updateStorySelection,
				storyIds: storyIdsByType[storyType],
				stories: storiesByType[storyType],
				currentStory,
				loading: loadingStories,
				fetchStories,
			}} />
			<StoryContent { ...{
				...storiesByType[storyType][currentStory],
				currentStory,
			}} />
		</main>
	</div>
}

function Header(props) {
    return <header id="header">
        <h1>Hacker News</h1>
        { Object.keys(STORY_TYPES).map(storyType => <span { ...{
            key: storyType,
            className: storyType == props.currentStoryType ? "active" : "",
            onClick: () => props.setCurrentStoryType(storyType)
        }}>
            { storyType
				.split("")
				.map((c, i) => i > 0 ? c.toLowerCase() : c )
				.join("") }
        </span>) }
    </header>
}

const container = document.getElementById("container");
const root = createRoot(container);
root.render(<HackerNews />);

