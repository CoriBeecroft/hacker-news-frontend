const container = document.getElementById("container");
const HN_API_URL = "https://hacker-news.firebaseio.com/v0";

class HackerNews extends React.Component {
	constructor(props) {
		super(props);

		this.state = { stories: [], currentStory: -1 }
		this.selectStory = this.selectStory.bind(this);
		this.storyContentRef = React.createRef();

		this.getStories();
	}

	selectStory(newStoryIndex) {
		this.setState({ currentStory: newStoryIndex });
		
		if(this.storyContentRef.current) {
            this.storyContentRef.current.scrollTop = 0;
        }
	}

	getStories() {
		$.get(HN_API_URL + "/topstories.json", null, (data) => {
			let stories = data.slice(0, 30).map((id, index) => {
				return $.get(HN_API_URL + "/item/" + id + ".json", null, (data) => {
					let stories = this.state.stories;
                    stories[index] = data;
					this.setState({ stories: stories });
				}, 'json');
			});

            this.setState({ stories: stories });

		}, 'json');
	}

	render() {
		return <div id="HNFE">
			<Header />
			<main className={ this.state.currentStory == -1 ? "" : "showing-story-details" } style={ this.state.currentStory == -1 ? { height: getMainContentHeight() } : {} }>
				<Stories { ...{
					selectStory: this.selectStory,
					stories: this.state.stories,
					currentStory: this.state.currentStory,
				}} />
				{ this.state.currentStory > -1 &&
					<StoryContent { ...{
                        ...this.state.stories[this.state.currentStory],
                        ref: this.storyContentRef
                    }} /> }
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
	const style = props.currentStory == -1 ?
		{ height: "auto", overflowY: "visible" } :
		{ height: getMainContentHeight() };

	return <div className="stories" style={ style }>
		{ props.stories.map((story, index) => <StorySummary { ...{
			selectStory: e => { props.selectStory(index) },
			active: props.currentStory == index,
			key: index,
			index: index,
			...story,
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

const StoryContent = React.forwardRef((props, ref) => {
	const hasContent = props.text || props.kids;

	return <div ref={ ref } className="story-content"
			style={{ height: getMainContentHeight() }}>
		{ props.text && <p className="story-text"
				dangerouslySetInnerHTML={{ __html: props.text }} /> }
		{ props.kids && <CommentSection comments={ props.kids } /> }
		{ !hasContent && <p>This story doesn't have any content or comments.</p> }
	</div>
})

function CommentSection(props) {
	return <section className="comments">
		<h2>Comments</h2>
		{ props.comments.map((id, index) =>
			<Comment id={ id } offset={ 0 } key={ index } /> ) }
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

		this.request;

		this.toggleCollapsed = this.toggleCollapsed.bind(this);
	}

	componentDidMount() { this.request = this.getInfo(this.props.id); }

	getInfo(id) {
		this.setState({	loading: true, });

		return $.get(HN_API_URL + "/item/" + id + ".json", null, data => {
			this.setState({
				by: data.by, 
				text: data.text, 
				time: getTimeElapsed(data.time), 
				kids: data.kids || [], 
				loading: false,
			});
		}, 'json');
	}

	componentWillUnmount() { this.request.abort(); }
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

const root = ReactDOM.createRoot(container);
root.render(<HackerNews />);

// Helper functions
function getMainContentHeight() {		// Cori, the uses of this are ineffecient, re-do it
	let headerHeight = document.getElementById("header");
	if(headerHeight) headerHeight = headerHeight.clientHeight + 2;

	return "calc(100vh - " + headerHeight + "px )";
}


