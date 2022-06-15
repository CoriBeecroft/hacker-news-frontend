const HN_API_URL = "https://hacker-news.firebaseio.com/v0";

class HackerNews extends React.Component {
	constructor(props) {
		super(props);

		this.state = { stories: [], currentStory: -1 }
		this.selectStory = this.selectStory.bind(this);

		this.fetchStories();
	}

    // TODO: This function and the parameter need better names
	selectStory(newStoryIndex) {
        const afterStateUpdate = (newStoryIndex == this.state.currentStory) ?
            () => {} : () => this.setState({ currentStory: newStoryIndex });

        // Setting to -1 first to clear out the content of the component.
        // If the "new story index" is the same as the current story, just
        // unselect the story (by setting currentStory to -1).
        this.setState({ currentStory: -1 }, afterStateUpdate);
	}

	fetchStories() {
        fetch(HN_API_URL + "/topstories.json")
            .then(response => response.json())
            .then(data => {
                // TODO: This whole thing needs to be done differently.
                let stories = data.slice(0, 30).map((id, index) => {
                    return fetch(HN_API_URL + "/item/" + id + ".json")
                        .then(response => response.json())
                        .then(story => {
                            const stories = this.state.stories;
                            // TODO: This line is directly modifying state.
                            // Leaving it for right now because a simple change
                            // breaks things but this should be fixed.
                            stories[index] = story;
                            this.setState({ stories: stories });
                        });
                });

                this.setState({ stories: stories });
            });
	}

	render() {
		return <div id="HNFE">
			<Header />
			<main style={ this.state.currentStory == -1 ? { height: getMainContentHeight() } : {} }>
				<Stories { ...{
					selectStory: this.selectStory,
					stories: this.state.stories,
					currentStory: this.state.currentStory,
				}} />
                <StoryContent { ...{
                    ...this.state.stories[this.state.currentStory],
                    ref: this.storyContentRef,
                    currentStory: this.state.currentStory,
                }} />
			</main>
		</div>
	}
}

function Header() {
    return <header id="header">
        <h1>Hacker News</h1>
        <span> (Top Stories)</span>
    </header>
}


function Stories(props) {
	return <div { ...{
        className: "stories",
        style: { height: getMainContentHeight() }
    }}>
		{ props.stories.map((story, index) => <StorySummary { ...{
            key: index,
			index: index,
            ...story,
            active: props.currentStory == index,
            selectStory: () => props.selectStory(index)
		}} />) }
	</div>
}

function StorySummary(props) {
	const classNames = "story-info " + (props.active ? "active" : "");

	return <div { ...{
        id: props.index,
        className: classNames,
		onClick: props.selectStory,
	}}>
		{ props.title && <React.Fragment>
			<h3><StoryTitle url={ props.url } title={ props.title } /></h3>
			<span>
				{ props.score + " pts | by "
				+  props.by + " | "
				+ getTimeElapsed(props.time) + " | "
				+ props.descendants + " comments" }
			</span>
		</React.Fragment> }
		{ !props.title && <LoadingSpinner /> }
	</div>
}

function StoryTitle(props) {
 	return props.url ? <a href={ props.url } target="_blank">
		{ props.title }
	</a> : props.title
}

function StoryContent(props) {
    const hasContent = props.text || props.kids;

	return <div { ...{
        className: [
            "story-content",
            (props.currentStory > -1 ? "" : "display-none" )
        ].join(" "),
        style: { height: getMainContentHeight() }
    }}>
        { props.currentStory > -1 && <React.Fragment>
            { props.text && <p { ...{
                className: "story-text",
                dangerouslySetInnerHTML: { __html: props.text }
            }} /> }
            { props.kids && <CommentSection comments={ props.kids } /> }
            { !hasContent && <p>This story doesn't have any content or comments.</p> }
        </React.Fragment> }
	</div>
}

function CommentSection(props) {
	return <section className="comments">
		<h2>Comments</h2>
		{ props.comments.map(id =>
			<Comment key={ id } id={ id } offset={ 0 } /> ) }
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
					collapsed: this.state.collapsed,
					toggleCollapsed: this.toggleCollapsed,
				}} />
				{ !this.state.collapsed && <React.Fragment>
					<div className="comment-body"
						dangerouslySetInnerHTML={{  __html: this.state.text }} />
					{ this.state.kids.map((id, index) =>
						<Comment id={ id } offset={ 20 } key={ index } />) }
					</React.Fragment> }
			</div> }
			{ this.state.loading && <LoadingSpinner /> }
		</div>
	}
}

function CommentHeader(props) {
	const arrowDirection = props.collapsed ? "up" : "down";

	return <h4>
		{ props.by }
		<span> { props.time }</span>
		<span onClick={ props.toggleCollapsed }>
			<i className={ "arrow fas fa-chevron-" + arrowDirection }></i>
		</span>
	</h4>
}

function LoadingSpinner() {
	return <img className="loading-spinner" src="loading.gif" />
}

function getTimeElapsed(time) {
	let date = Date.now()/1000 - time;      // seconds elapsed

	if(date/60 > 1) {
		date = date/60;
		if(date/60 > 1) {
			date = date/60;
			if(date/24 > 1) {
				date = date/24;
				date = Math.floor(date)
				return date + (date == 1 ? " day ago" : " days ago");	
			} else {
				date = Math.floor(date)
				return date + (date == 1 ? " hour ago" : " hours ago");	
			}
		} else {
			date = Math.floor(date)
			return date + (date == 1 ? " minute ago" : " minutes ago");	
		}
	} else {
		date = Math.floor(date)
		return date + (date == 1 ? "second ago" : " seconds ago");
	}
}

// Helper functions
function getMainContentHeight() {		// Cori, the uses of this are ineffecient, re-do it
	let headerHeight = document.getElementById("header");
	if(headerHeight) headerHeight = headerHeight.clientHeight + 2;

	return "calc(100vh - " + headerHeight + "px )";
}

const container = document.getElementById("container");
const root = ReactDOM.createRoot(container);
root.render(<HackerNews />);

