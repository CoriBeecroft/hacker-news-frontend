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
			var stories = data.slice(0, 6).map((id) => 
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
		return (<div>
			<header>
				<a href="https://news.ycombinator.com/"><h1>Hacker News</h1></a><span> (Top Stories)</span>
			</header>

			<main>
				<div onClick={this.handleClick}>{this.state.stories.map((model, index) => 
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
		var classNames = "story-info " + (this.props.model.active ? "active" : "");
		var commentsURL = "https://news.ycombinator.com/item?id=" + this.props.model.id;
 
		return (<div className={classNames} id={this.props.index} data-url={this.props.model.url} onClick={this.handleViewAskClick}>
					<h3>{this.props.model.title}</h3>
					<span>{this.props.model.score}  |  {this.props.model.by}  |  {new Date(this.props.model.time).toString()}<br /></span>
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
		return (<div className="story-content">
			<p>{this.props.model && this.props.model.text}</p>
			<Comments />
		</div>);
	}
}

class Comments extends React.Component
{
	render()
	{
		return (<div>
			<h2>Comments</h2>
			<img src="comments.png" />
		</div>);
	}
}

ReactDOM.render(<HackerNews />, container);	

