import React, { useEffect, useState, useRef } from "react";
import { HN_API_URL } from "./util"

export function HackerNews() {
    const [ storyIds, setStoryIds ] = useState([]);
    const [ fish, setFish ] = useState([]);
    const fishQueue = useRef([]);

    useEffect(() => {
        const storyType = "TOP"
		const url = HN_API_URL + "/"
			+ storyType.toLowerCase()
			+  "stories.json";
		fetch(url).then(response => response.json())
            .then(res => { setStoryIds(res); });
	}, [])
    useEffect(() => {
        if(storyIds.length == 0) { return; }
        Promise.all(storyIds.slice(0, 10).map(id =>
			fetch(HN_API_URL + "/item/" + id + ".json")
				.then(response => response.json())
		)).then(stories => {
            fishQueue.current = fishQueue.current.concat(stories)
        })
    }, [ storyIds ])


    useEffect(() => {
        // TODO: make this a timeout chain so it's possible to do a
        // variable length interval
        const interval = setInterval(() => {
            if(fishQueue.current.length > 0) {
                const fishToAdd = fishQueue.current.shift();
                setFish(oldFish => oldFish.concat([ fishToAdd ]))
            }
        }, 3000)
        return () => clearInterval(interval)
    }, [])

	return <div id="HNFE">
        { fish.map(f => <div key={ Number(f.id) }>{ f.title }</div> )}
	</div>
}
