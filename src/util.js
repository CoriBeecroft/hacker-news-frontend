import React from 'react';
// https://date-fns.org/
import { formatDistanceToNowStrict, fromUnixTime } from 'date-fns'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSpinner } from '@fortawesome/free-solid-svg-icons'

// https://hackernews.api-docs.io/v0/overview/introduction
export const HN_API_URL = "https://hacker-news.firebaseio.com/v0";
export const PAGE_SIZE = 20
export const STORY_TYPES = {
    TOP: "TOP",
    NEW: "NEW",
    BEST: "BEST",
    ASK: "ASK",
    SHOW: "SHOW",
    JOB: "JOB"
}

export function LoadingSpinner() {
	return <FontAwesomeIcon className="loading-spinner" icon={faSpinner} size="xl" spin />
	// return <img className="loading-spinner" src="loading.gif" style={{ width: 50 }}/>
}

// TODO: the uses of this are ineffecient, re-do it
export function getMainContentHeight() {
	let headerHeight = document.getElementById("header");
	if(headerHeight) headerHeight = headerHeight.clientHeight + 2;

	return "calc(100vh - " + headerHeight + "px )";
}

export function getTimeElapsed(time) {
	return formatDistanceToNowStrict(fromUnixTime(time)) + " ago";
}

export function getQueryParam(paramName) {
	const urlParams = new URLSearchParams(window.location.search);
	const paramObject = {};

	for (const [key, value] of urlParams) {
		paramObject[key] = value;
	}

	return paramObject[paramName] ?? ""
}

export function setQueryParam(paramName, value) {
	const searchParams = new URLSearchParams(window.location.search)
    searchParams.set(paramName, value);
    const newRelativePathQuery = window.location.pathname + '?'
		+ searchParams.toString();
    history.replaceState(null, '', newRelativePathQuery);
}

export function getRandomInt(lowerBoundInclusive, upperBound) {
    return Math.floor(Math.random() * (upperBound - lowerBoundInclusive) + lowerBoundInclusive)
}

export function getRandomSign() {
    return getRandomInt(0, 2) === 0 ? -1 : 1
}


