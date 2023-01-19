import React from 'react';
// https://date-fns.org/
import { formatDistanceToNow, fromUnixTime } from 'date-fns'

// https://hackernews.api-docs.io/v0/overview/introduction
export const HN_API_URL = "https://hacker-news.firebaseio.com/v0";
export const PAGE_SIZE = 30
export const STORY_TYPES = {
    TOP: "TOP",
    NEW: "NEW",
    BEST: "BEST",
    ASK: "ASK",
    SHOW: "SHOW",
    JOB: "JOB"
}

export function LoadingSpinner() {
	return <img className="loading-spinner" src="loading.gif" />
}

// TODO: the uses of this are ineffecient, re-do it
export function getMainContentHeight() {
	let headerHeight = document.getElementById("header");
	if(headerHeight) headerHeight = headerHeight.clientHeight + 2;

	return "calc(100vh - " + headerHeight + "px )";
}

export function getTimeElapsed(time) {
	return formatDistanceToNow(fromUnixTime(time));
}