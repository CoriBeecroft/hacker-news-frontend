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
			currentStoryUrl: "",
		}
	  	
		this.handleClick = (e, f) => 
		{
    		var id = $(e.target).data('id');
    		var url = $(e.target).data('url');
		};
	}

	render()
	{
		return (<div>
			<Header />
			<main>
				<div onClick={this.handleClick}>{this.props.stories.map((model, index) => 
					{
						if(index == this.state.currentStory)
						{
							return <StoryInfo active={true} model={model} key={index} />;	
						}
						else
						{
							return <StoryInfo active={false} model={model} key={index} />;	
						}
						
					})}</div>
				{(this.state.currentStory > -1) && <StoryContent url={this.state.currentStoryUrl} />}
			</main>
			<Footer />
		</div>);
	}
}

class StoryContent extends React.Component
{
	constructor(props)
	{
		super();
		this.state = 
		{
			currentStory: 
			{
				url: props.url, 
				id: 15132816
			}		
		}
	}

	render()
	{
		return (<div className="story-content">
			<Article url={this.state.currentStory.url}/>
			<Comments />
		</div>);
	}
}

class StoryInfo extends React.Component 
{
	constructor(props)
	{
  		super();

  		this.props = props;
  		this.model = props.model;
  	}
  
	render() 
	{
		var classNames = "story-info " + (this.props.active ? "active" : "");
		var commentsURL = "https://news.ycombinator.com/item?id=" + this;

		return (
			<div className={classNames} data-id={this.model.id} data-url={this.model.url}>
				<a href={this.model.url} target="_blank"><h3>{this.model.title}</h3></a>
				<a href={commentsURL} target="_blank">Comments<br /></a>
				<span> by: {this.model.author}<br /></span>
				<span>Time: {this.model.time}<br /></span>
				<span>Points: {this.model.score}<br /></span>
			</div>
		);
	}
}

function Header(props)
{
	return (<header>
		<a href="https://news.ycombinator.com/"><h1>Hacker News</h1></a><span> (Top Stories)</span>
	</header>);
}

function Footer(props)
{
	return (<footer>
		<hr />
		This page was made by <a href="http://coribeecroft.com">Cori Beecroft</a>  using the Hacker News <a href="https://github.com/HackerNews/API">API</a>
	</footer>);
}

function Article(props)
{
	return <iframe src={props.url}></iframe>
}

function Comments(props)
{
	return (<div>
		<h2>Comments</h2>
		<img src="comments.png" />
	</div>)
}

$.get("https://hacker-news.firebaseio.com/v0/topstories.json", null, (data) => 
{
	var stories = data.slice(0, 6).map((id) => 
	{
		return $.get("https://hacker-news.firebaseio.com/v0/item/" + id + ".json", null, (data) => {}, 'json');
	});
	Promise.all(stories).then(function(results) 
	{
		ReactDOM.render(<HackerNews stories={results} />, container);		
	});
}, 'json');




