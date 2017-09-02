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
						return <StoryInfo model={model} key={index} index={index} />;	
						
					})}
				</div>
				{<StoryContent model={this.props.stories[0]}/>}
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

  		this.props = props;
  		this.model = props.model;
  	}

  	handleViewAskClick()
  	{
  		console.log("Oh no! You have not yet implemented this button's click handler, now it will explode in 10... 9... 8...");
  	}

	render() 
	{
		var classNames = "story-info " + (this.props.active ? "active" : "");
		var commentsURL = "https://news.ycombinator.com/item?id=" + this.model.id;
 
		return (
			<div className="story" id={this.props.index}>
				<div className={classNames} data-id={this.model.id} data-url={this.model.url}>
					<h3>{this.model.title}</h3>
					<span>{this.model.by}  |  {new Date(this.model.time).toString()}  |  {this.model.score}<br /></span>
					{this.model.url && <button><a href={this.model.url} target="_blank">View Story</a></button>}
					{this.model.text && <button onClick={this.handleViewAskClick}>View Story</button>}
					<button><a href={commentsURL} target="_blank">Comments<br /></a></button>
				</div>
			</div>
		);
	}
}

class StoryContent extends React.Component
{

	render()
	{
		this.props.model.text = `Ik bun Vulgaris Magistralis
En ik ri-j op een mammoet in het rond

Ik kok mien potjen op een werkende vulkaan
Een dinosauris nuum ik een halve haan
Wodan en Donar bunt achterneef'n van mien
Moar die heb ik al eeuwen niet gezien

Ik leaf alleen in de nacht
In 't donker op jacht

Ik bun Vulgaris Magistralis
En ik ri-j op een mammoet in 't rond
Ik bun Vulgaris Magistralis
En op zondag op een mastodon't

Een maffe professor die had van mien geheurd
En kwam op zien Solex noar de Achterhoek gescheurd
Met camera's en lasso's maakt ze jacht op mien
Moar mien hol is nooit ontdekt en gin mens hef mien gezien

Ik bun een woar kampioen
In een echt visioen

Ik bun Vulgaris Magistralis
En ik ri-j op een mammoet in 't rond
Ik bun Vulgaris Magistralis
En op zondag op een mastodon't

Ik sluup deur de bossen van de Achterhoek
Zie wilt mien strikken veur 't witte doek
Bi-j nacht en ontij kom ik uut mien hol
Mies Bouwman en Spielberg wilt mien in de hoofdrol

Moar zie kriegt mien niet
Nee, zie kriegt mien niet
Nee, zie kriegt mien nooit, nooit, nooit!
`;


		return (<div className="story-content">
			<p>{this.props.model.text}</p>
			<Comments />
		</div>);
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

function Comments(props)
{
	return (<div>
		<h2>Comments</h2>
		<img src="comments.png" />
	</div>)
}

$.get("https://hacker-news.firebaseio.com/v0/topstories.json", null, (data) => 
{
	var stories = data.slice(24, 30).map((id) => 
	{
		return $.get("https://hacker-news.firebaseio.com/v0/item/" + id + ".json", null, (data) => {}, 'json');
	});
	Promise.all(stories).then(function(results) 
	{
		ReactDOM.render(<HackerNews stories={results} />, container);		
	});
}, 'json');




