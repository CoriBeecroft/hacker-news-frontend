const reactContainer = document.getElementById("react");


class StoryContent extends React.Component
{
	constructor(props)
	{
		super();
		this.state = 
		{
			currentStory: 
			{
				url: "http://coribeecroft.com", 
				id: 15132816
			}		
		}
	}

	render()
	{
		return (<div className="story-content">
			<Article url={this.state.currentStory.url}/>
			<Comments url={"http://coribeecroft.com"} />
		</div>);
	}
}

class HackerNews extends React.Component
{
	constructor(props)
	{
		super();

		this.state = 
		{
			stories: []
		}

		$.get("https://hacker-news.firebaseio.com/v0/topstories.json", null, (data) => 
		{
			this.setState(() => 
			{
				return {
					stories: data.slice(0, 30).map((id) => 
					{
						return <StoryInfo storyid={id} key={id} />;
					})
				}
			}); 
		}, 'json')
	}

	render()
	{
		return (<div>
			<Header />
			<main>
				<div>{this.state.stories}</div>
				<StoryContent />
			</main>
			<Footer />
		</div>);
	}
}

class StoryInfo extends React.Component 
{
	constructor(props)
	{
  		super();

  		this.id = props.storyid; 
		this.state = 
		{
	    	title: "", 
	    	author: "", 
	    	time: "",
	    	points: 0, 
	    	url: ""
	  	};
	  	
		this.handleClick = () => 
		{
    		this.setState((prevState) => 
    		{
     			return { clickCounter: prevState.clickCounter + 1 };
    		});
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
			return (
				<div className="story-info">
					<a href={this.state.url} target="_blank"><h3>{this.state.title}</h3></a>
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
		<a href="https://news.ycombinator.com/"><h1>Hacker News<span>(Top Stories)</span></h1></a>
	</header>);
}

function Footer(props)
{
	return (<footer>
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
	return <iframe src={props.url}></iframe>;
}









