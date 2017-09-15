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
		var newCurrent = this.state.currentStory; 

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
			//[15236043, 15241153, 15239660, 15237198]
			var stories = data.slice(0,6).map((id) => 
			{
				return $.get("https://hacker-news.firebaseio.com/v0/item/" + id + ".json", null, (data) => {}, 'json');
			});

			Promise.all(stories).then((results) =>
			{
				this.setState({stories: results});
			});
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

			<main>
				<div onClick={this.handleClick}>
					{this.state.stories.map((model, index) => 
					{
						return <StoryInfo model={model} key={index} index={index} />;
					})}
				</div>

				{this.state.currentStory > -1 && <StoryContent model={this.state.stories[this.state.currentStory]}/>}
			</main>

			<footer>
				<hr /> This page was made by <a href="http://coribeecroft.com">Cori Beecroft</a>  using the Hacker News <a href="https://github.com/HackerNews/API">API</a>
			</footer>
		</div>);
	}
}

class StoryInfo extends React.Component 
{
	constructor(props)
	{
  		super(props);

  		this.handleViewAskClick = () =>
	  	{
	  		this.props.model.active = true;
	  	}
  	}

	render() 
	{
		//console.log("StoryInfo Rendering");
		var classNames = "story-info " + (this.props.model.active ? "active" : "");
		var commentsURL = "https://news.ycombinator.com/item?id=" + this.props.model.id;
 
		return (<div className={classNames} id={this.props.index} data-url={this.props.model.url} onClick={this.handleViewAskClick}>
					<h3>{this.props.model.title}</h3>
					<span>{this.props.model.score}  |  {this.props.model.by}  |  {getTimeElapsed(this.props.model.time)}<br /></span>
					{this.props.model.url && <button><a href={this.props.model.url} target="_blank">View Story</a></button>}
					{this.props.model.text && <button>View Story</button>}
					<button><a href={commentsURL} target="_blank">Comments<br /></a></button>
				</div>);
	}
}

class StoryContent extends React.Component
{
	render()
	{
		//console.log("StoryContent Rendering")
		return (<div className="story-content">
			{this.props.model && this.props.model.text && <p dangerouslySetInnerHTML={{__html: this.props.model.text}} />}
			<Comments kids={this.props.model.kids} />
		</div>);
	}
}

class Comments extends React.Component
{
	render()
	{
		//console.log("Comments Rendering");
		return (<div>
			<h2>Comments</h2>

			{this.props.kids && this.props.kids.length > 0 && this.props.kids.map((id, index) =>
			{
				return <Comment id={id} offset={0} key={index} />;
			})}
		</div>);
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
			kids: []
		}

		this.data = this.getInfo(this.props.id);
	}

	componentDidMount()
	{
		this.data.then((data) => 
		{
			this.setState(
			{
				by: data.by, 
				text: data.text, 
				time: data.time, 
				kids: data.kids
			});
		});
	}

	getInfo(id)
	{
		return $.get("https://hacker-news.firebaseio.com/v0/item/" + id + ".json", null, (data) => 
		{
			//console.log(this.updater.isMounted);
			this.setState(
			{
				by: data.by, 
				text: data.text, 
				time: getTimeElapsed(data.time), 
				kids: data.kids
			});
		}, 'json');
	}

	componentWillReceiveProps(nextProps)
	{
		this.getInfo(nextProps.id);
	}

	render()
	{
	//	console.log("Comment Rendering");
		return (
			<div className="comment" style={{marginLeft: this.props.offset}}>
				<h4>{this.state.by}</h4>
				<div className="comment-body" dangerouslySetInnerHTML={{__html: this.state.text}} />	
				{this.state.kids && this.state.kids.map((id, index) => 
				{
					return <Comment id={id} offset={20} key={index} />;
				})}	
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
				return Math.floor(date) + " days ago";	
			}
			else
			{
				return Math.floor(date) + " hours ago";	
			}
		}
		else
		{
			return Math.floor(date) + " minutes ago";	
		}
	}
	else
	{
		return Math.floor(date) + " seconds ago";
	}
}

ReactDOM.render(<HackerNews />, container);	