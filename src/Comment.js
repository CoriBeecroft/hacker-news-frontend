import React from 'react';
import {
	getTimeElapsed,
	HN_API_URL,
	LoadingSpinner
} from "./util"

export class Comment extends React.Component {
	constructor(props) {
		super(props);
		
		this.state = {
			by: "",
			text: "",
			time: "",
			kids: [],
			loading: false,
			collapsed: false,
        }

        // setup AbortController
        this.controller = new AbortController();
        // signal to pass to fetch
        this.signal = this.controller.signal;

		this.toggleCollapsed = this.toggleCollapsed.bind(this);
	}

	componentDidMount() { this.getInfo(this.props.id); }

	getInfo(id) {
		this.setState({	loading: true, });

        fetch(HN_API_URL + "/item/" + id + ".json", {
            method: "get",
            signal: this.signal
        }).then(response => response.json())
        .then(commentData => {
            this.setState({
                by: commentData.by,
                text: commentData.text,
                time: getTimeElapsed(commentData.time),
                kids: commentData.kids || [],
                loading: false,
            });
        });
	}

	componentWillUnmount() { this.controller.abort(); }
	toggleCollapsed() { this.setState(ps => ({ collapsed: !ps.collapsed })); }

	render() {
		return <div className="comment" style={{ marginLeft: this.props.offset }}>
			{ !this.state.loading && this.state.by && <div>
				<CommentHeader { ...{
					by: this.state.by,
					time: this.state.time,
					collapsed: this.state.collapsed,
					toggleCollapsed: this.toggleCollapsed,
				}} />
				{ !this.state.collapsed && <>
					<div className="comment-body"
						dangerouslySetInnerHTML={{  __html: this.state.text }} />
					{ this.state.kids.map((id, index) =>
						<Comment id={ id } offset={ 40 } key={ index } />) }
                </> }
			</div> }
			{ this.state.loading && <LoadingSpinner /> }
		</div>
	}
}

function CommentHeader(props) {
	const arrowDirection = props.collapsed ? "up" : "down";

	return <h4 className="comment-header">
		<span>{ props.by }</span>
		<span className="timestamp">{ props.time }</span>
		<span onClick={ props.toggleCollapsed }>
			<i className={ "arrow fas fa-chevron-" + arrowDirection }></i>
		</span>
	</h4>
}