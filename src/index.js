import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { Stories } from "./Stories"
import { StoryContent } from "./StoryContent"
import {
	getMainContentHeight,
	HN_API_URL,
	STORY_TYPES,
	PAGE_SIZE
} from "./util"

import "./style.scss"

function HackerNews() {
	const [ storyType, setStoryType ] = useState(STORY_TYPES.TOP);
	const [ storyIds, setStoryIds ] = useState([]);
	const [ stories, setStories] = useState([]);
	const [ currentStory, setCurrentStory ] = useState(null);

	const fetchStoryIds = () => {
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
		fetchStoryIds().then(data => {
			const storyIds = data.slice(0, PAGE_SIZE);
			Promise.all(fetchStoryContent(storyIds)).then(storyObjects => {
				const stories = {};
				storyObjects.forEach(story => {
					stories[story.id] = story;
				})

				setStories(stories);
			});

			setStoryIds(storyIds);
		});
	}

	const updateStorySelection = newCurrentStory => {
		setCurrentStory((newCurrentStory === currentStory) ? null : newCurrentStory);
	}

	useEffect(fetchStories, [storyType])

	return <div id="HNFE">
		<Header { ...{
			currentStoryType: storyType,
			setCurrentStoryType: newStoryType => {
				setStoryType(newStoryType)
				setStories([])
				setCurrentStory(null)
			}
		}} />
		<main style={ currentStory == null ? { height: getMainContentHeight() } : {} }>
			<Stories { ...{
				updateStorySelection,
				storyIds,
				stories,
				currentStory,
			}} />
			<StoryContent { ...{
				...stories[currentStory],
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

