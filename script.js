const reactContainer = document.getElementById("react");

class Story extends React.Component 
{
	constructor(props)
	{
  		super();

		this.state = {
	    	title: "I am a title!!!", 
	    	author: "Beefarm", 
	    	time: new Date().toString(),
	    	points: 0, 
	    	url: "http://coribeecroft.com", 

	  	};
	  	this.id = props.storyid; 
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
				console.log(typeof data.url);
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

	componentDidMount() 
	{
		
	}
  
	render() 
	{
		if (this.state.title) 
		{	console.log("this.url: " + this.url);
			return (
				<div>
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

$.get("https://hacker-news.firebaseio.com/v0/topstories.json", null, (data) => 
{
	var stories = data.slice(0, 30).map((id) => 
	{
		return <Story storyid={id} key={id} />;
	});
	console.log(stories.length);
	ReactDOM.render(<div>{stories}</div>, reactContainer);
}, 'json')