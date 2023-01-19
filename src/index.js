import React from 'react';
import { createRoot } from 'react-dom/client';
import { formatDistanceToNow, fromUnixTime } from 'date-fns' 	// https://date-fns.org/

import "./style.scss"

// https://hackernews.api-docs.io/v0/overview/introduction
const HN_API_URL = "https://hacker-news.firebaseio.com/v0";
const PAGE_SIZE = 30
const STORY_TYPES = {
    TOP: "TOP",
    NEW: "NEW",
    BEST: "BEST",
    ASK: "ASK",
    SHOW: "SHOW",
    JOB: "JOB"
}

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

function Stories(props) {
	return <div { ...{
        className: "stories",
        style: { height: getMainContentHeight() }
    }}>
		{ props.storyIds.map((storyId) => <StorySummary { ...{
            key: storyId,
            ...props.stories[storyId],
            active: props.currentStory == storyId,
            updateStorySelection: () => props.updateStorySelection(storyId)
		}} />) }
	</div>
}

function StorySummary(props) {
	const classNames = "story-info " + (props.active ? "active" : "");

	return <div { ...{
        className: classNames,
		onClick: props.updateStorySelection,
	}}>
		{ props.title && <>
			<h3><StoryTitle url={ props.url } title={ props.title } /></h3>
			<span>
				{ props.score + " pts | by "
				+  props.by + " | "
				+ getTimeElapsed(props.time) + " | "
				+ props.descendants + " comments" }
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

function StoryContent(props) {
    const hasContent = props.text || props.kids;

	return <div { ...{
        className: [
            "story-content",
            (props.currentStory != null ? "" : "display-none" )
        ].join(" "),
        style: { height: getMainContentHeight() }
    }}>
        { props.currentStory != null && <>
            { props.text && <p { ...{
                className: "story-text",
                dangerouslySetInnerHTML: { __html: props.text }
            }} /> }
            { props.kids && <CommentSection comments={ props.kids } /> }
            { !hasContent && <p>This story doesn't have any content or comments.</p> }
        </> }
	</div>
}

function CommentSection(props) {
	return <section className="comments">
		<h2>Comments</h2>
		{ props.comments.map(id =>
			<Comment { ...{ key: id, id, offset: 0 }} /> )}
	</section>
}

class Comment extends React.Component {
	constructor(props) {
		super(props);
		
		this.state = {
			by: "",
			text: "",
			time: "",
			kids: [],
			loading: false,
			collapsed: false,
        }

        // setup AbortController
        this.controller = new AbortController();
        // signal to pass to fetch
        this.signal = this.controller.signal;

		this.toggleCollapsed = this.toggleCollapsed.bind(this);
	}

	componentDidMount() { this.getInfo(this.props.id); }

	getInfo(id) {
		this.setState({	loading: true, });

        fetch(HN_API_URL + "/item/" + id + ".json", {
            method: "get",
            signal: this.signal
        }).then(response => response.json())
        .then(commentData => {
            this.setState({
                by: commentData.by,
                text: commentData.text,
                time: getTimeElapsed(commentData.time),
                kids: commentData.kids || [],
                loading: false,
            });
        });
	}

	componentWillUnmount() { this.controller.abort(); }
	toggleCollapsed() { this.setState(ps => ({ collapsed: !ps.collapsed })); }

	render() {
		return <div className="comment" style={{ marginLeft: this.props.offset }}>
			{ !this.state.loading && this.state.by && <div>
				<CommentHeader { ...{
					by: this.state.by,
					time: this.state.time,
					collapsed: this.state.collapsed,
					toggleCollapsed: this.toggleCollapsed,
				}} />
				{ !this.state.collapsed && <>
					<div className="comment-body"
						dangerouslySetInnerHTML={{  __html: this.state.text }} />
					{ this.state.kids.map((id, index) =>
						<Comment id={ id } offset={ 40 } key={ index } />) }
                </> }
			</div> }
			{ this.state.loading && <LoadingSpinner /> }
		</div>
	}
}

function CommentHeader(props) {
	const arrowDirection = props.collapsed ? "up" : "down";

	return <h4 className="comment-header">
		<span>{ props.by }</span>
		<span className="timestamp">{ props.time }</span>
		<span onClick={ props.toggleCollapsed }>
			<i className={ "arrow fas fa-chevron-" + arrowDirection }></i>
		</span>
	</h4>
}

function LoadingSpinner() {
	return <img className="loading-spinner" src="loading.gif" />
}

function getTimeElapsed(time) {
	return formatDistanceToNow(fromUnixTime(time));
}

// Helper functions
// TODO: the uses of this are ineffecient, re-do it
function getMainContentHeight() {
	let headerHeight = document.getElementById("header");
	if(headerHeight) headerHeight = headerHeight.clientHeight + 2;

	return "calc(100vh - " + headerHeight + "px )";
}

const container = document.getElementById("container");
const root = createRoot(container);
root.render(<HackerNews />);

