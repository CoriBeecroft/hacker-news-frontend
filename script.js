const reactContainer = document.getElementById("react");

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
	  	
		this.handleClick = this.handleClick.bind(this);
		this.getStories();
	}

	handleClick()
	{
		var stories = this.state.stories;
		var newCurrent = -1;

		for(var i=0; i<stories.length; i++)
		{
			if(stories[i].active && this.state.currentStory !== i)
			{
				newCurrent = i;
			}
			else if(stories[i].active)
			{
				stories[i].active = false;
			}
		}

		this.setState({ stories: stories, currentStory: newCurrent });
	}

	getStories()
	{
		$.get("https://hacker-news.firebaseio.com/v0/topstories.json", null, (data) => 
		{
			// var stories = [15236043, 15241153, 15239660, 15237198].map((id) => 
			var stories = data.slice(0,6).map((id, index) => 
			{
				return $.get("https://hacker-news.firebaseio.com/v0/item/" + id + ".json", null, (data) => 
				{
					var stories = this.state.stories;
					stories[index] = data;
					this.setState({stories: stories});
				}, 'json');
			});

			this.setState({stories: stories});

		}, 'json');
	}

	componentDidMount()
	{
		setInterval(() =>
		{
			this.getStories();
		}, 600000);
	}

	render()
	{
		//console.log("HackerNews Rendering");
		
		return (<div>
			<header>
				<h1>Hacker News</h1><span> (Top Stories)</span>
			</header>

			<main onClick={this.handleClick}>

					{this.state.stories.map((model, index) => 
					{
						return <StoryInfo model={model} key={index} index={index} />;
					})}
				{this.state.currentStory > -1 && <StoryContent model={this.state.stories[this.state.currentStory]} styleInfo={{gridColumnStart: 2, gridRowStart: this.state.currentStory + 1, gridRowEnd: "span " + (this.state.stories.length + 1)}} />}
			</main>

			<footer>
				This page was made by <a href="http://coribeecroft.com">Cori Beecroft</a>  using the Hacker News <a href="https://github.com/HackerNews/API">API</a>
			</footer>
		</div>);
	}
}

class StoryInfo extends React.Component 
{
	constructor(props)
	{
  		super(props);

  		this.state = {
  			clickable: (this.props.model && (this.props.model.text || this.props.model.kids))
  		}

  		this.handleViewAskClick = () =>
	  	{
	  		if(this.state.clickable)
	  			this.props.model.active = true;					//Cori, need to change this, shouldn't be modifying props
	  	}
  	}

  	componentWillReceiveProps(nextProps)
  	{
  		this.setState({
  			clickable: (nextProps.model && (nextProps.model.text || nextProps.model.kids))
  		});
  	}

	render() 
	{
		//console.log("StoryInfo Rendering");
		var classNames = "story-info " + (this.props.model.active ? "active" : "") + (this.state.clickable ? " clickable" : "");
		var commentsURL = "https://news.ycombinator.com/item?id=" + this.props.model.id;
 
		return this.props.model.title ? (<div className={classNames} id={this.props.index} data-url={this.props.model.url} onClick={this.handleViewAskClick}>
					<h3><a href={this.props.model.url} target="_blank">{this.props.model.title}</a></h3>
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
		
		return storyHasContent ? (<div style={this.props.styleInfo} onClick={this.handleClick}><div className="story-content">
			{storyText}
			<Comments kids={this.props.model.kids} />
		</div></div>)
		: null;
	}
}

class Comments extends React.Component
{
	render()
	{
		//console.log("Comments Rendering");
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