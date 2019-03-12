const container = document.getElementById("container");

class HackerNews extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			stories: [],
			currentStory: -1, 
		}
	 	
	 	this.shouldUpdateStoryScroll = false; 	
		this.handleClick = this.handleClick.bind(this);

		this.getStories(true);
	}

	handleClick(e) {
		let story = $(e.target).closest('.story-info');
		story = story.length == 0 ? null : $(story[0]);

		if(story) {
			let newCurrent = Number(story.attr('id'));
			this.setState({currentStory: newCurrent });	
		}
		
		$('.story-content').scrollTop(0);
		if(this.state.currentStory == -1) {
			this.storiesScrollTop = Number($('main').scrollTop());
			this.shouldUpdateStoryScroll = true;
		}
	}

	getStories(firstTime) {
		$.get("https://hacker-news.firebaseio.com/v0/topstories.json", null, (data) => {
			let stories = data.slice(0,30).map((id, index) => {
				return $.get("https://hacker-news.firebaseio.com/v0/item/" + id + ".json", null, (data) => {
					let stories = this.state.stories;
					stories[index] = data;
					this.setState({ stories: stories });
				}, 'json');
			});

			if(firstTime)
				this.setState({ stories: stories });

		}, 'json');
	}

	componentDidMount() { this.getStories(false); }
	componentWillUnmount() { clearInterval(this.interval); }

	componentDidUpdate() {
		if(this.shouldUpdateStoryScroll) {
			$('.stories').scrollTop(this.storiesScrollTop);			// Use a ref here instead of jQuery
			this.shouldUpdateStoryScroll = false;
		}
	}

	getMainContentHeight() {
		let headerHeight = document.getElementById("header");			// Use a ref here instead of jQuery
		if(headerHeight) headerHeight = headerHeight.clientHeight + 1;

		return "calc(100vh - " + headerHeight + "px )";
	}

	render() {
		const storiesStyle = this.state.currentStory == -1 ? { height: "auto", overflowY: "visible" } : { height: this.getMainContentHeight() };
		const mainStyle = this.state.currentStory == -1 ? { overflowY: "scroll", height: this.getMainContentHeight() } : null;
		const storyContentStyle = { height: this.getMainContentHeight() };

		return <div>
			<header id="header">
				<h1>Hacker News</h1><span> (Top Stories)</span>
			</header>
			<main onClick={ this.handleClick } style={ mainStyle }>
				<div className="stories" style={ storiesStyle }>
					{ this.state.stories.map((model, index) =>
						<StoryInfo { ...{
							active: this.state.currentStory == index,
							model: model,
							key: index,
							index: index
						}} />) }
				</div>
				{ this.state.currentStory > -1 && <StoryContent { ...{
					style: storyContentStyle,
					model: this.state.stories[this.state.currentStory]
				}} /> }
			</main>
		</div>
	}
}

class StoryInfo extends React.Component {
	constructor(props) {
  		super(props);

  		this.state = {
			hasContent: (this.props.model && (this.props.model.text || this.props.model.kids)),			// This shouldn't be in state since it is derived from props
  		}
  	}

  	componentWillReceiveProps(nextProps) {
  		this.setState({
  			hasContent: (nextProps.model && (nextProps.model.text || nextProps.model.kids))
  		});
  	}

	render() {
		let classNames = "story-info " + (this.props.active ? "active" : "");
		let commentsURL = "https://news.ycombinator.com/item?id=" + this.props.model.id;
		let title = this.props.model.url ? <a href={ this.props.model.url } target="_blank">
			{ this.props.model.title }
		</a> : this.props.model.title;
 
		return this.props.model.title ? <div className={ classNames } id={ this.props.index } >
			<h3>{ title }</h3>
			<span>
				{ this.props.model.score + " pts | by "
				+  this.props.model.by + " | "
				+ getTimeElapsed(this.props.model.time) + " | "
				+ this.props.model.descendants + " comments" }
			</span>
		</div> : <div className={ classNames } id={ this.props.index }>
			<img className="loading-spinner" src="loading.gif" />
		</div>
	}
}

class StoryContent extends React.Component {
	constructor(props) {
		super(props);

		this.handleClick = this.handleClick.bind(this);
	}

	handleClick(e) { e.stopPropagation(); }

	render() {
		let storyHasContent = this.props.model && (this.props.model.text || this.props.model.kids);
		const storyText = this.props.model && this.props.model.text &&
			<p className="story-text" dangerouslySetInnerHTML={{ __html: this.props.model.text }} />;

		return <div className="story-content" onClick={ this.handleClick } style={ this.props.style }>
			{ storyText }
			<Comments kids={ this.props.model.kids } />
			{ !storyHasContent && <p>This story doesn't have any content or comments.</p> }
		</div>
	}
}

class Comments extends React.Component {
	render() {
		return this.props.kids && this.props.kids.length > 0 && 
			<div className="comments">
				<h2>Comments</h2>
				{ this.props.kids.map((id, index) =>
					<Comment id={id} offset={0} key={index} /> ) }
			</div> || null;
	}
}

class Comment extends React.Component {
	constructor(props) {
		super(props);
		
		this.state = {
			by: "",
			text: "",
			time: "", 
			kids: [], 
			loading: true
		}

		this.request = this.getInfo(this.props.id);
		this.mounted = false;
	}

	componentDidMount() { this.mounted = true; }

	getInfo(id) {
		return $.get("https://hacker-news.firebaseio.com/v0/item/" + id + ".json", null, data => {
			if(this.mounted) {
				this.setState({
					by: data.by, 
					text: data.text, 
					time: getTimeElapsed(data.time), 
					kids: data.kids, 
					loading: false
				});
			}
		}, 'json');
	}

	componentWillReceiveProps(nextProps) {
		if(nextProps.id !== this.props.id) {
			this.setState({
				by: "",
				text: "",
				time: "", 
				kids: [], 
				loading: true
			});	
		}

		if(nextProps !== this.props) {
			this.getInfo(nextProps.id);
		}
	}

	componentWillUnmount() { this.mounted = false; this.request.abort(); }

	render() {
		const subComments = this.state.kids && this.state.kids.map((id, index) => {
			return <Comment id={ id } offset={ 20 } key={ index } />;
		});

		const commentInfo = <div>
			<h4>{ this.state.by } <span>{ this.state.time }</span></h4>
			<div className="comment-body" dangerouslySetInnerHTML={{ __html: this.state.text }} />	
			{ subComments }
		</div>

		return <div className="comment" style={{ marginLeft: this.props.offset }}>
			{ this.state.loading && <img className="loading-spinner" src="loading.gif" /> }
			{ !this.state.loading && this.state.by ? commentInfo : null }
		</div>
	}
}


function getTimeElapsed(time) {
	let date = Date.now()/1000 - time; //seconds elapsed
	
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

ReactDOM.render(<HackerNews />, container);	
