const container = document.getElementById("container");

class HackerNews extends React.Component
{
	constructor(props)
	{
		super(props);

		this.state = 
		{
			stories: [],
			currentStory: -1, 
		}
	 	
	 	this.shouldUpdateStoryScroll = false; 	
		this.handleClick = this.handleClick.bind(this);

		this.getStories(true);
	}

	handleClick(e)
	{
		var story = $($(e.target).closest('.story-info')[0]);
		var newCurrent = Number(story.attr('id'));

		this.setState({currentStory: newCurrent });
		
		//Cori, there is probably a more React-y way of doing this, come back to it. 
		$('.story-content').scrollTop(0);
		if(this.state.currentStory == -1)
		{
			this.storiesScrollTop = Number($('main').scrollTop());
			this.shouldUpdateStoryScroll = true;
		}
	}

	getStories(firstTime)
	{
		//console.log("Getting stories... ");
		$.get("https://hacker-news.firebaseio.com/v0/topstories.json", null, (data) => 
		{
			//var stories = [15236043, 15241153, 15239660, 15237198].map((id, index) => 
			var stories = data.slice(0,30).map((id, index) => 
			{
				return $.get("https://hacker-news.firebaseio.com/v0/item/" + id + ".json", null, (data) => 
				{
					var stories = this.state.stories;
					stories[index] = data;
					this.setState({stories: stories});
				}, 'json');
			});

			if(firstTime)
				this.setState({stories: stories});

		}, 'json');
	}

	componentDidMount()
	{
		//this.interval = setInterval(() =>
	//	{
			this.getStories(false);
	//	}, 600000);
	}

	componentWillUnmount()
	{
		clearInterval(this.interval);
	}

	componentDidUpdate()
	{
		if(this.shouldUpdateStoryScroll)
		{
			$('.stories').scrollTop(this.storiesScrollTop);
			this.shouldUpdateStoryScroll = false;
		}
	}

	render()
	{
		const storiesStyle = this.state.currentStory == -1 ? {height: "auto", overflow: "visible"} : null;
		const mainStyle = this.state.currentStory == -1 ?{overflow: "scroll", height: "93vh"} : null;

		return (<div>
			<header>
				<h1>Hacker News</h1><span> (Top Stories)</span>
			</header>

			<main onClick={this.handleClick} style={mainStyle}>
				<div className="stories" style={storiesStyle}>
					{this.state.stories.map((model, index) => 
					{
						return <StoryInfo active={this.state.currentStory == index} model={model} key={index} index={index} />;
					})}
				</div>
				{this.state.currentStory > -1 && <StoryContent model={this.state.stories[this.state.currentStory]} />}
			</main>
		</div>);
	}
}

class StoryInfo extends React.Component 
{
	constructor(props)
	{
  		super(props);

  		this.state = {
  			hasContent: (this.props.model && (this.props.model.text || this.props.model.kids)),
  		}
  	}

  	componentWillReceiveProps(nextProps)
  	{
  		this.setState({
  			hasContent: (nextProps.model && (nextProps.model.text || nextProps.model.kids))
  		});
  	}

	render() 
	{
		var classNames = "story-info " + (this.props.active ? "active" : "");
		var commentsURL = "https://news.ycombinator.com/item?id=" + this.props.model.id;
		var title = this.props.model.url ? <a href={this.props.model.url} target="_blank">{this.props.model.title}</a> : this.props.model.title;
 
		return this.props.model.title ? (<div className={classNames} id={this.props.index} >
					<h3>{title}</h3>
					<span>{this.props.model.score} points | by {this.props.model.by} | {getTimeElapsed(this.props.model.time)} <br /></span>
				</div>) :
				(<div className={classNames} id={this.props.index}>
					<img className="loading-spinner" src="loading.gif" />
				</div>);
	}
}

class StoryContent extends React.Component
{
	constructor(props)
	{
		super(props);

		this.handleClick = this.handleClick.bind(this);
	}

	handleClick(e)
	{
		e.stopPropagation();
	}

	render()
	{
		var storyHasContent = this.props.model && (this.props.model.text || this.props.model.kids);
		const storyText = this.props.model && this.props.model.text && <p className="story-text" dangerouslySetInnerHTML={{__html: this.props.model.text}} />;
		
		return (<div className="story-content" onClick={this.handleClick}>
			{storyText}
			<Comments kids={this.props.model.kids} />
			{!storyHasContent && <p>This story doesn't have any content or comments.</p>}
		</div>);
	}
}

class Comments extends React.Component
{
	render()
	{
		return this.props.kids && this.props.kids.length > 0 && 
			<div className="comments">
				<h2>Comments</h2>
				{this.props.kids.map((id, index) =>
				{
					return <Comment id={id} offset={0} key={index} />;
				})}
			</div> || null;
	}
}

class Comment extends React.Component
{
	constructor(props)
	{
		super(props);
		
		this.state = 
		{
			by: "",
			text: "",
			time: "", 
			kids: [], 
			loading: true
		}

		this.request = this.getInfo(this.props.id);
		this.mounted = false;
	}

	componentDidMount()
	{
		this.mounted = true;
	}

	getInfo(id)
	{
		return $.get("https://hacker-news.firebaseio.com/v0/item/" + id + ".json", null, (data) => 
		{
			if(this.mounted)
			{	this.setState(
				{
					by: data.by, 
					text: data.text, 
					time: getTimeElapsed(data.time), 
					kids: data.kids, 
					loading: false
				});
			}
		}, 'json');
	}

	componentWillReceiveProps(nextProps)
	{
		if(nextProps !== this.props)
		{
			this.getInfo(nextProps.id);
		}
	}

	componentWillUnmount()
	{
		this.mounted = false;
		this.request.abort();
	}

	render()
	{
		const subComments = this.state.kids && this.state.kids.map((id, index) => 
		{
			return <Comment id={id} offset={20} key={index} />;
		});

		const commentInfo = (
			<div>
				<h4>
					{this.state.by} <span>{this.state.time}</span>
				</h4>
				<div className="comment-body" dangerouslySetInnerHTML={{__html: this.state.text}} />	
				{subComments}
			</div>);

		return (
			<div className="comment" style={{marginLeft: this.props.offset}}>
				{this.state.loading ? <img className="loading-spinner" src="loading.gif" /> :
				this.state.by ? commentInfo : null}		
			</div>
		);
	}
}


function getTimeElapsed(time)
{
	var date = Date.now()/1000 - time; //seconds elapsed
	
	if(date/60 > 1)
	{
		date = date/60;
		if(date/60 > 1)
		{
			date = date/60;
			if(date/24 > 1)
			{
				date = date/24;
				date = Math.floor(date)
				return date + (date == 1 ? " day ago" : " days ago");	
			}
			else
			{
				date = Math.floor(date)
				return date + (date == 1 ? " hour ago" : " hours ago");	
			}
		}
		else
		{
			date = Math.floor(date)
			return date + (date == 1 ? " minute ago" : " minutes ago");	
		}
	}
	else
	{
		date = Math.floor(date)
		return date + (date == 1 ? "second ago" : " seconds ago");
	}
}

ReactDOM.render(<HackerNews />, container);	