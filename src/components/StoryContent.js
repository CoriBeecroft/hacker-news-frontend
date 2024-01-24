import React, { useEffect, useRef } from 'react';
import { Comment } from "./Comment"
import { getMainContentHeight } from "../util"

import "./StoryContent.scss"

export function StoryContent(props) {
	const ref = useRef(null);
    const hasContent = props.text || props.kids;

	useEffect(
		() => { ref.current.scrollTop = 0 },
		[ props.currentStory ]
	)

	return <div { ...{
		ref,
        className: [
            "story-content",
            (props.currentStory != null ? "" : "display-none" ),
            props.className || "",
        ].join(" "),
        style: { height: getMainContentHeight() },
        ...(props.onClick ? { onClick: props.onClick } : {})
    }}>
        { props.currentStory != null && <>
            { props.text && <p { ...{
                className: "story-text",
                dangerouslySetInnerHTML: { __html: props.text }
            }} /> }
            { props.kids && <CommentSection comments={ props.kids } /> }
            { !hasContent && <p className="no-comments">This story doesn't have any content or comments.</p> }
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

