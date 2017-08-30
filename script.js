const reactContainer = document.getElementById("react");

class Story extends React.Component 
{
	constructor(props)
	{
  		super();

  		this.id = props.storyid; 
		this.state = {
	    	title: "", 
	    	author: "", 
	    	time: "",
	    	points: 0, 
	    	url: "", 

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
				<div style={{border: "2px solid grey", paddingBottom: "10px", margin: "3px", textAlign: "center"}}>
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
	return (<header style={{width: "100%", textAlign: "center"}}>
		<a href="https://news.ycombinator.com/"><h1>Hacker News<span>(Top Stories)</span></h1></a>
	</header>);
}

function Footer(props)
{
	return (<footer style={{height: "50px", textAlign: "center"}}>
		This page was made by <a href="http://coribeecroft.com">Cori Beecroft</a>  using the Hacker News <a href="https://github.com/HackerNews/API">API</a>
	</footer>);
}

function Article(props)
{
	return <iframe src={props.url} width="800" height="600"></iframe>
}

$.get("https://hacker-news.firebaseio.com/v0/topstories.json", null, (data) => 
{
	var stories = data.slice(0, 30).map((id) => 
	{
		return <Story storyid={id} key={id} />;
	});

	ReactDOM.render(<div><Header /><Article url="http://coribeecroft.com" /><div style={{width: "300px"}}>{stories}</div><Footer /></div>, container);
}, 'json')









