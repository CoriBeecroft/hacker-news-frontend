import React from 'react';
import { Comment } from "./Comment"
import { getMainContentHeight } from "./util"

export function StoryContent(props) {
    const hasContent = props.text || props.kids;

	return <div { ...{
        className: [
            "story-content",
            (props.currentStory != null ? "" : "display-none" )
        ].join(" "),
        style: { height: getMainContentHeight() }
    }}>
        { props.currentStory != null && <>
            { props.text && <p { ...{
                className: "story-text",
                dangerouslySetInnerHTML: { __html: props.text }
            }} /> }
            { props.kids && <CommentSection comments={ props.kids } /> }
            { !hasContent && <p>This story doesn't have any content or comments.</p> }
        </> }
	</div>
}

function CommentSection(props) {
	return <section className="comments">
		<h2>Comments</h2>
		{ props.comments.map(id =>
			<Comment { ...{ key: id, id, offset: 0 }} /> )}
	</section>
}

