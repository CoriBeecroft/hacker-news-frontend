import React, { useEffect, useState } from "react";
import { Stories } from "./Stories"
import { StoryContent } from "../components/StoryContent"
import {
	getMainContentHeight,
	HN_API_URL,
	STORY_TYPES,
	PAGE_SIZE,
	getQueryParam,
	setQueryParam
} from "../util"

import "./HackerNewsOriginal.scss"

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
const getInitialNumStoriesToRenderByType = () => {
	const numStoriesToRenderByType = {};
	Object.values(STORY_TYPES).forEach(storyType => {
		numStoriesToRenderByType[storyType] = PAGE_SIZE;
	})
	return numStoriesToRenderByType;
}

const getInitialStoriesByType = () => {
	const storiesByType = {};
	Object.values(STORY_TYPES).forEach(storyType => {
		storiesByType[storyType] = {};
	})
	return storiesByType;
}

export function HackerNews() {
	const [ loadingStories, setLoadingStories ] = useState(false);
	const [ storyType, setStoryType ] = useState(getInitialStoryType());
	const [ storyIdsByType, setStoryIdsByType ] = useState(getInitialStoryIdsByType());
	const [ numStoriesToRenderByType, setNumStoriesToRenderByType ] = useState(getInitialNumStoriesToRenderByType());
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
		let storyIds = storyIdsByType[storyType]
		// If all the stories have been loaded, don't attempt to fetch more
		if(storyIds.length > 0 && storyIds.length === numStoriesToRenderByType[storyType]) {
			return;
		}

		setLoadingStories(true);

		// fetch all story ids
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
		setNumStoriesToRenderByType({
			...numStoriesToRenderByType,
			[storyType]: offset + PAGE_SIZE
		})

		// Fetch content for new stories and format it
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
				storyType,
				updateStorySelection,
				storyIds: storyIdsByType[storyType].slice(0, numStoriesToRenderByType[storyType]),
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
