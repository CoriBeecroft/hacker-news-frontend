const reactContainer = document.getElementById("react");

class HackerNews extends React.Component
{
	constructor(props)
	{
		super();

		this.state = 
		{
			stories: [],
			currentStory: -1, 
			currentStoryUrl: "",
		}
	  	
		this.handleClick = (e, f) => 
		{
    		var id = $(e.target).data('id');
    		var url = $(e.target).data('url');

    		// this.setState((prevState) => 
    		// {
     	// 		return { 
     	// 			currentStory: this.state.stories.findIndex((element) =>
		    // 		{
		    // 			return element == id;
		    // 		}), 
		    // 		currentStoryUrl: url, 
     	// 		};
    		// });
		};

		$.get("https://hacker-news.firebaseio.com/v0/topstories.json", null, (data) => 
		{
			this.setState(() => 
			{
				return {
					stories: data.slice(0, 30)
				}
			}); 
		}, 'json')
	}

	render()
	{
		return (<div>
			<Header />
			<main>
				<div onClick={this.handleClick}>{this.state.stories.map((id, index) => 
					{
						if(index == this.state.currentStory)
						{
							return <StoryInfo active={true} storyid={id} key={id} />;	
						}
						else
						{
							return <StoryInfo active={false} storyid={id} key={id} />;	
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

  		this.id = props.storyid; 
  		this.active = props.active;
		this.state = 
		{
	    	title: "", 
	    	author: "", 
	    	time: "",
	    	points: 0, 
	    	url: ""
	  	};

		this.getStory();
  	}
  
	getStory()
	{
		return $.get("https://hacker-news.firebaseio.com/v0/item/" + this.id + ".json", null, (data) => 
		{
			this.setState((prevState) =>
			{
				return {
					title: data.title,
					author: data.by,
					time: data.time, 
					points: data.score, 
					url: data.url
				};
			});
		}, 'json');
	}
  
	render() 
	{
		if (this.state.title) 
		{
			var classNames = "story-info " + (this.active ? "active" : "");
			var commentsURL = "https://news.ycombinator.com/item?id=" + this.id;

			return (
				<div className={classNames} data-id={this.id} data-url={this.state.url}>
					<a href={this.state.url} target="_blank"><h3>{this.state.title}</h3></a>
					<a href={commentsURL} target="_blank">Comments<br /></a>
					<span> by: {this.state.author}<br /></span>
					<span>Time: {this.state.time}<br /></span>
					<span>Points: {this.state.points}<br /></span>
				</div>
			);
		}
		else
		{
			return null;
		}
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

ReactDOM.render(<HackerNews />, container);

function Comments(props)
{
	return (<div>
		<h2>Comments</h2>
		<img src="comments.png" />
	</div>)
}









