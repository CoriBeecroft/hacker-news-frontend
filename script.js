const reactContainer = document.getElementById("react");

class HackerNews extends React.Component
{
	constructor(props)
	{
		super();
		this.props = props;

		this.state = 
		{
			currentStory: -1, 
		}
	  	
		this.handleClick = (e, f) => 
		{
			var stories = this.props.stories;
			var newCurrent = this.state.currentStory; 
			for(var i=0; i<stories.length; i++)
			{
				if(stories[i].active && this.state.currentStory !== i)
				{
					newCurrent = i;
				}
				else if(stories.active)
				{
					stories.active = false;
				}
			}

			this.setState(() => {
    			return {
    				currentStory: newCurrent
    			}
    		});
		};
	}



	shouldComponentUpdate()
	{
		//console.log("shouldComponentUpdate");
		return true;
	}

	componentWillUpdate(nextProps)
	{
		//console.log("componentWillUpdate");

	}

	componentDidMount()
	{
		setInterval(()=>
		{
			// console.log("Element 0 is active: " + this.props.stories[0].active);
			// console.log("State.currentStory: " + this.state.currentStory);

		}, 1000);
	}

	render()
	{
		//console.log("render");
		return (<div>
			<header>
				<a href="https://news.ycombinator.com/"><h1>Hacker News</h1></a><span> (Top Stories)</span>
			</header>

			<main>
				<div onClick={this.handleClick}>{this.props.stories.map((model, index) => 
					{
						if(this.state.currentStory == index)
						{
							model.active = true;
							return <StoryInfo model={model} key={index} index={index} />;
						}
						else
						{
							model.active = false;
							return <StoryInfo model={model} key={index} index={index} />;
						}
					})}
				</div>

				{<StoryContent model={this.props.stories[0]}/>}
			</main>
			<footer>
				<hr /> This page was made by <a href="http://coribeecroft.com">Cori Beecroft</a>  using the Hacker News <a href="https://github.com/HackerNews/API">API</a>
			</footer>
		</div>);
	}

	componentDidUpdate(nextProps)
	{
		//console.log("componentDidUpdate");
	}
}

class StoryInfo extends React.Component 
{
	constructor(props)
	{
  		super();

  		this.props = props;
  		this.model = props.model;

  		this.handleViewAskClick = () =>
	  	{
	  		this.props.model.active = true;
	  	}
  	}

	render() 
	{
		var classNames = "story-info " + (this.props.model.active ? "active" : "");
		var commentsURL = "https://news.ycombinator.com/item?id=" + this.model.id;
 
		return (<div className={classNames} id={this.props.index} data-url={this.model.url} onClick={this.handleViewAskClick}>
					<h3>{this.model.title}</h3>
					<span>{this.model.score}  |  {this.model.by}  |  {new Date(this.model.time).toString()}<br /></span>
					{this.model.url && <button><a href={this.model.url} target="_blank">View Story</a></button>}
					{this.model.text && <button>View Story</button>}
					<button><a href={commentsURL} target="_blank">Comments<br /></a></button>
				</div>);
	}
}

class StoryContent extends React.Component
{
	render()
	{
		return (<div className="story-content">
			<p>{this.props.model.text}</p>
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

$.get("https://hacker-news.firebaseio.com/v0/topstories.json", null, (data) => 
{
	var stories = data.slice(0, 30).map((id) => 
	{
		return $.get("https://hacker-news.firebaseio.com/v0/item/" + id + ".json", null, (data) => {}, 'json');
	});
	Promise.all(stories).then(function(results) 
	{
		ReactDOM.render(<HackerNews stories={results} />, container);		
	});
}, 'json');




