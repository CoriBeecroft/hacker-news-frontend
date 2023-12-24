import React, { useState, useEffect, useRef } from 'react';
// https://www.npmjs.com/package/react-animate-height
import AnimateHeight from 'react-animate-height';
import {
	getTimeElapsed,
	HN_API_URL,
	LoadingSpinner
} from "../util"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronUp, faChevronDown } from '@fortawesome/free-solid-svg-icons'

import './Comment.scss';

export function Comment(props) {
    const [ by, setBy ] = useState("");
    const [ text, setText ] = useState("");
    const [ time, setTime ] = useState("");
    const [ kids, setKids ] = useState([]);
    const [ loading, setLoading ] = useState(false);
    const [ collapsed, setCollapsed ] = useState(false);

    // setup AbortController
    const controller = useRef(new AbortController());
    // signal to pass to fetch
    const signal = useRef(controller.current.signal);

    const getInfo = id => {
		setLoading(true)

        fetch(HN_API_URL + "/item/" + id + ".json", {
            method: "get",
            signal: signal.current
        }).then(response => response.json())
        .then(commentData => {
            setBy(commentData.by)
            setText(commentData.text)
            setTime(getTimeElapsed(commentData.time))
            setKids(commentData.kids || [])
            setLoading(false)
        }).catch(error => {
            setLoading(false)

            if(error instanceof DOMException && error.name === "AbortError") {
                console.log("Comment fetch cancelled.");
            } else { console.error(error); }
        });
	}

    const toggleCollapsed = () => setCollapsed(!collapsed)

    useEffect(() => {
        getInfo(props.id);
        return () => controller.current.abort()
    }, [])

    return <div className="comment" style={{ marginLeft: props.offset }}>
        { !loading && by && text !== "[dead]" && <div>
            <CommentHeader { ...{ by, time, collapsed, toggleCollapsed }} />
            <AnimateHeight
                duration={ 300 }
                height={ collapsed ? 0 : "auto" }
            >
                <div className="comment-body" dangerouslySetInnerHTML={{  __html: text }} />
                { kids.map((id, index) =>
                    <Comment { ...{ id, offset: 15, key: index }} />) }
            </AnimateHeight>
        </div> }
        { loading && <LoadingSpinner /> }
    </div>
}

function CommentHeader(props) {
	return <h4 className="comment-header">
		<span>{ props.by }</span>
		<span className="timestamp">{ props.time }</span>
		<span onClick={ props.toggleCollapsed }>
            <FontAwesomeIcon { ...{
                className: "arrow",
                icon: props.collapsed ? faChevronUp : faChevronDown
            }} />
		</span>
	</h4>
}