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
        Promise.all(storyIds.slice(0, 10).map(id =>
			fetch(HN_API_URL + "/item/" + id + ".json")
				.then(response => response.json())
		)).then(stories => {
            storyQueue.current = storyQueue.current.concat(stories)
        })
        // TODO: return cleanup function
    }, [ storyIds ])

    function initializeFish(f, time) {
        const fishElement = f.ref.current;
        const initialXPosition = window.innerWidth;
        const initialYPosition = getRandomInt(0, (window.innerHeight - fishElement.getBoundingClientRect().height))
        fishElement.style.transform = `translate(${ initialXPosition }px, ${ initialYPosition }px)`
        const targetYPosition = Math.min(Math.max((initialYPosition + getRandomInt(0, 100) - 50), 0), window.innerHeight)
        const yVelocity = ((targetYPosition - initialYPosition)/Math.abs(targetYPosition - initialYPosition)) * Math.abs(f.yVelocity)
        setFish(oldFish => oldFish.map(of => of.id === f.id ? {
                ...f,
                targetXPosition: 0,
                targetYPosition,
                xStartTime: time,
                yStartTime: time,
                yVelocity,
                initialXPosition,
                initialYPosition
            } : of)
        )
    }

    useEffect(() => {
        const frame = time => {
            if(time != prevTimeRef.current) {
                fish.forEach(f => {
                    if(f.ref && f.ref.current && !f.xStartTime) {
                        initializeFish(f, time);
                    } else if(f.ref && f.ref.current) {
                        const newXPosition = f.initialXPosition + f.xVelocity*(time - f.xStartTime)
                        const newYPosition = f.initialYPosition + f.yVelocity*(time - f.yStartTime)
                        f.ref.current.style.transform = `translate(${ newXPosition }px, ${ newYPosition }px)`
                        if(newXPosition < f.targetXPosition) {
                            // all done, remove fish from DOM
                        }
                        if((f.yVelocity < 0 && newYPosition < f.targetYPosition) ||
                                (f.yVelocity > 0 && newYPosition > f.targetYPosition)) {
                            setFish(oldFish => oldFish.map(of => {
                                if(of.id !== f.id) { return of; }
                                const initialYPosition = newYPosition;
                                const targetYPosition = Math.min(Math.max((newYPosition + getRandomInt(0, 100) - 50), 0), window.innerHeight);
                                const yVelocity = ((targetYPosition - initialYPosition)/Math.abs(targetYPosition - initialYPosition)) * Math.abs(f.yVelocity)
                                return {
                                    ...of,
                                    initialYPosition,
                                    targetYPosition,
                                    yVelocity,
                                    yStartTime: time
                                }
                            }))
                        }
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
        }, 4000)
        return () => clearInterval(interval)
    }, [])

    function generateFish(storyInfo) {
        return {
            x: null, y: null,
            id: storyInfo.id,   // TODO: consider making this a different id
            targetXPosition: null, targetYPosition: null,
            xVelocity: -0.07, yVelocity: 0.03,
            storyInfo,
        }
    }

    function registerFishRef(ref, id) {
        setFish(oldFish => oldFish.map(f => f.id === id ? { ...f, ref } : f))
    }

	return <div id="HNFE">
        { fish.map(f => <Fish key={ f.id } registerRef={ registerFishRef } { ...f } /> )}
	</div>
}


function Fish(props) {
    const ref = useRef();
    useEffect(() => props.registerRef(ref, props.id), [])

    return <div ref={ ref } className="fish">{ props.storyInfo.title }</div>
}
