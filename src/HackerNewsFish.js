import React, { useEffect, useState, useRef } from "react";
import { HN_API_URL } from "./util";
import { StorySummary } from "./StorySummary";

import "./HackerNewsFish.scss";

function getRandomInt(lowerBoundInclusive, upperBound) {
    return Math.floor(Math.random() * upperBound + lowerBoundInclusive)
}
function getRandomSign() {
    return getRandomInt(0, 2) === 0 ? -1 : 1
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
        Promise.all(storyIds.slice(0, 50).map(id =>
			fetch(HN_API_URL + "/item/" + id + ".json")
				.then(response => response.json())
		)).then(stories => {
            storyQueue.current = storyQueue.current
                .concat(stories
                    .map((s, i) => ({ ...s, index: i }))
                )
        })
        // TODO: return cleanup function
    }, [ storyIds ])

    function getRotation(f, newXPosition, newYPosition) {
        const prevXPosition = getXPositionAtTime(f, prevTimeRef.current)
        const prevYPosition = getYPositionAtTime(f, prevTimeRef.current)
        const xSpeed = newXPosition - prevXPosition
        const ySpeed = newYPosition - prevYPosition

        return Math.atan(ySpeed/xSpeed)
    }

    function targetXPositionReached(f) {
        const xPosition = getXPositionAtTime(f, prevTimeRef.current)

        return (f.xDirection < 0 && xPosition < f.targetXPosition) ||
            (f.xDirection > 0 && xPosition > f.targetXPosition)
    }

    function initializeFish(f, time) {
        const fishElement = f.ref.current;
        const initialXPosition = f.xDirection > 0 ?
            -1 * fishElement.getBoundingClientRect().width :
            window.innerWidth;
        const targetXPosition = f.xDirection > 0 ?
            window.innerWidth:
            -1 * fishElement.getBoundingClientRect().width;
        const initialYPosition = getRandomInt(
            0,
            window.innerHeight - fishElement.getBoundingClientRect().height
        )

        fishElement.style.transform = `translate(${ initialXPosition }px, ${ initialYPosition }px)`

        setFish(oldFish => oldFish.map(of => of.id === f.id ? {
                ...f,
                targetXPosition,
                xStartTime: time, yStartTime: time,
                initialXPosition, initialYPosition,
            } : of)
        )
    }

    function getXPositionAtTime(f, time) {
        const progress = (time - f.xStartTime)/30000
        const position = f.initialXPosition + (f.targetXPosition - f.initialXPosition) * progress;

        return position;
    }

    function getYPositionAtTime(f, time) {
        const timeElapsed = time - f.yStartTime

        return f.amplitude * Math.sin(timeElapsed*0.0005 + f.phaseShift) + f.initialYPosition
    }

    function updateFishPosition(f, time) {
        const newXPosition = getXPositionAtTime(f, time);
        const newYPosition = getYPositionAtTime(f, time);
        const newRotation = getRotation(f, newXPosition, newYPosition);

        f.ref.current.style.transform = `
            translate(${ newXPosition }px, ${ newYPosition }px)
            rotate(${ newRotation }rad)`
    }

    const frame = time => {
        if(time != prevTimeRef.current) {
            fish.forEach(f => {
                if(f.ref && f.ref.current && !f.xStartTime) {
                    initializeFish(f, time);
                } else if(f.ref && f.ref.current) {
                    updateFishPosition(f, time);
                }
            })
        }
        prevTimeRef.current = time;
        animationFrameRef.current = requestAnimationFrame(frame);
    };

    useEffect(() => {
        if(animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
        }
        animationFrameRef.current = requestAnimationFrame(frame);

        return () => cancelAnimationFrame(animationFrameRef.current);
    }, [ fish ])

    useEffect(() => {
        const timeout = setTimeout(() => {
            if(storyQueue.current.length > 0) {
                const fishToAdd = generateFish(storyQueue.current.shift())
                setFish(oldFish => oldFish.filter(f => !targetXPositionReached(f)).concat([ fishToAdd ]))
            } else if(fish.length > 0) {
                setFish(oldFish => oldFish.filter(f => !targetXPositionReached(f)))
            }
        // }, 3000)
        }, 6000)
        return () => clearTimeout(timeout)
    }, [ fish ])

    function generateFish(storyInfo) {
        return {
            id: storyInfo.id,   // TODO: consider making this a different id
            targetXPosition: null,
            xDirection: getRandomSign(),
            amplitude: getRandomInt(10, 30),
            phaseShift: getRandomInt(0, 50),
            frequency: getRandomInt(3, 7)/10000,
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

    return <div ref={ ref } className="fish">
        <StorySummary { ...{
            loading: false,
            active: false,
            index: props.storyInfo.index,
            storyInfo: props.storyInfo
        }}/>
    </div>
}
