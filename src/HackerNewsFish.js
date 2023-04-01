import React, { useEffect, useState, useRef } from "react";
import { HN_API_URL } from "./util"

import "./HackerNewsFish.scss";

function getRandomInt(lowerBoundInclusive, upperBound) {
    return Math.floor(Math.random() * upperBound + lowerBoundInclusive)
}

export function HackerNews() {
    const [ storyIds, setStoryIds ] = useState([]);
    const [ fish, setFish ] = useState([]);
    const storyQueue = useRef([]);
    const prevTimeRef = useRef();
    const animationFrameRef = useRef();

    useEffect(() => {
        const storyType = "TOP"
		const url = HN_API_URL + "/"
			+ storyType.toLowerCase()
			+  "stories.json";
		fetch(url).then(response => response.json())
            .then(res => { setStoryIds(res); });
        // TODO: return cleanup function
	}, [])

    useEffect(() => {
        if(storyIds.length == 0) { return; }
        Promise.all(storyIds.slice(0, 2).map(id =>
			fetch(HN_API_URL + "/item/" + id + ".json")
				.then(response => response.json())
		)).then(stories => {
            storyQueue.current = storyQueue.current.concat(stories)
        })
        // TODO: return cleanup function
    }, [ storyIds ])


    useEffect(() => {
        const frame = time => {
            if(time != prevTimeRef.current) {
                fish.forEach(f => {
                    if(f.ref && f.ref.current && !f.startTime) {
                        const startPosition = window.innerWidth;
                        f.ref.current.style.transform = `translate(${startPosition}px)`
                        setFish(oldFish => oldFish.map(of => of.id === f.id ? {
                                ...f, 
                                targetXPosition: 0,
                                startTime: time,
                                startPosition
                            } : of)
                        )
                    } else if(f.ref && f.ref.current) {
                        f.ref.current.style.transform = `translate(${ f.startPosition + ((f.targetXPosition - f.startPosition) / 5000)*(time-f.startTime) }px)`
                    }
                })
            }

            prevTimeRef.current = time;
            animationFrameRef.current = requestAnimationFrame(frame);
        };

        if(animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
        }
        animationFrameRef.current = requestAnimationFrame(frame);

        return () => cancelAnimationFrame(animationFrameRef.current);
    }, [ fish ])

    useEffect(() => {
        const interval = setInterval(() => {
            if(storyQueue.current.length > 0) {
                const fishToAdd = generateFish(storyQueue.current.shift())
                setFish(oldFish => oldFish.concat([ fishToAdd ]))
            }
        }, 3000)
        return () => clearInterval(interval)
    }, [])

    function generateFish(storyInfo) {
        return {
            x: null, y: null,
            id: storyInfo.id,   // TODO: consider making this a different id
            targetXPosition: null, targetYPosition: null,
            xVelocity: null, yVelocity: null,
            storyInfo,
        }
    }

    function registerFishRef(ref, id) {
        setFish(oldFish => oldFish.map(f => f.id === id ? { ...f, ref } : f))
    }
console.log(fish);
	return <div id="HNFE">
        { fish.map(f => <Fish key={ f.id } registerRef={ registerFishRef } { ...f } /> )}
	</div>
}


function Fish(props) {
    const ref = useRef();
    useEffect(() => props.registerRef(ref, props.id), [])

    return <div ref={ ref } className="fish">{ props.storyInfo.title }</div>
}
