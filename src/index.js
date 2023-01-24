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
const getInitialStoryIdsToRenderByType = () => {
	const storyIdsToRenderByType = {};
	Object.values(STORY_TYPES).forEach(storyType => {
		storyIdsToRenderByType[storyType] = PAGE_SIZE;
	})
	return storyIdsToRenderByType;
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
	const [ storyIdsToRenderByType, setStoryIdsToRenderByType ] = useState(getInitialStoryIdsToRenderByType());
	const [ storiesByType, setStoriesByType] = useState(getInitialStoriesByType());
	const [ currentStory, setCurrentStory ] = useState(null);

	async function fetchStoryIds() {
		setLoadingStories(true);
		const url = HN_API_URL + "/"
			+ storyType.toLowerCase()
			+  "stories.json";
		return fetch(url).then(response => response.json());
	}

	async function fetchStories(storyIds) {
		return Promise.all(storyIds.map(id =>
			fetch(HN_API_URL + "/item/" + id + ".json")
				.then(response => response.json())
		))
	}

	async function fetchNextStories() {
		setLoadingStories(true);

		// fetch all story ids
		let storyIds = storyIdsByType[storyType]
		if(storyIds.length == 0) {
			storyIds = await fetchStoryIds();
			setStoryIdsByType(storyIdsByType => ({
				...storyIdsByType,
				[storyType]: storyIds
			}));
		}

		// Figure out which story ids to fetch content for
		const offset = Object.keys(storiesByType[storyType]).length;
		const storyIdsToFetch = storyIds.slice(offset, offset + PAGE_SIZE);
		setStoryIdsToRenderByType({
			...storyIdsToRenderByType,
			[storyType]: offset + PAGE_SIZE
		})

		const newStories = (await fetchStories(storyIdsToFetch))
			.reduce((stories, story) => ({
				...stories,
				[story.id]: story
			}), {})

		setStoriesByType(prevStoriesByType => ({
			...prevStoriesByType,
			[storyType]: {
				...prevStoriesByType[storyType],
				...newStories
			}
		}));

		setLoadingStories(false);
	}

	const updateStorySelection = newCurrentStory => {
		setCurrentStory((newCurrentStory === currentStory) ? null : newCurrentStory);
	}

	useEffect(() => {
		// TODO: consider checking for story content also
		if(storyIdsByType[storyType].length == 0) {
			fetchNextStories();
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
				storyIds: storyIdsByType[storyType].slice(0, storyIdsToRenderByType[storyType]),
				stories: storiesByType[storyType],
				currentStory,
				loading: loadingStories,
				fetchNextStories,
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

