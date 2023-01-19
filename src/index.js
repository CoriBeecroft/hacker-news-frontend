import React from "react";
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

class HackerNews extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
            storyType: STORY_TYPES.TOP,
			storyIds: [],
            stories: [],
            currentStory: null
        }
		this.updateStorySelection = this.updateStorySelection.bind(this);

		this.fetchStories();
	}

	updateStorySelection(newStoryId) {
		const currentStory = (newStoryId === this.state.currentStory)
			? null : newStoryId;
		this.setState({ currentStory })
	}

	fetchStories() {
		this.fetchStoryIds().then(data => {
			const storyIds = data.slice(0, PAGE_SIZE);
			Promise.all(this.fetchStoryContent(storyIds)).then(storyObjects => {
				const stories = {};
				storyObjects.forEach(story => {
					stories[story.id] = story;
				})

				this.setState({ stories });
			});

			this.setState({ storyIds })
		});
	}

	fetchStoryIds() {
		const url = HN_API_URL + "/"
			+ this.state.storyType.toLowerCase()
			+  "stories.json";
		return fetch(url).then(response => response.json());
	}

	fetchStoryContent(storyIds) {
		return storyIds.map(id =>
			fetch(HN_API_URL + "/item/" + id + ".json")
				.then(response => response.json())
		)
	}

	render() {
		return <div id="HNFE">
			<Header { ...{
                currentStoryType: this.state.storyType,
                setCurrentStoryType: newStoryType => {
                    this.setState(
                        { storyType: newStoryType, stories: [], currentStory: null },
                        this.fetchStories
                    );
                }
            }} />
			<main style={ this.state.currentStory == null ? { height: getMainContentHeight() } : {} }>
				<Stories { ...{
					updateStorySelection: this.updateStorySelection,
					storyIds: this.state.storyIds,
					stories: this.state.stories,
					currentStory: this.state.currentStory,
				}} />
                <StoryContent { ...{
                    ...this.state.stories[this.state.currentStory],
                    currentStory: this.state.currentStory,
                }} />
			</main>
		</div>
	}
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

