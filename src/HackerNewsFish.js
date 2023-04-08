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
        Promise.all(storyIds.slice(0, 10).map(id =>
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

    function generateTargetYPosition(fishElement, initialYPosition) {
        return Math.min(
            Math.max(
                (initialYPosition + getRandomSign()*(getRandomInt(99, 200) + 1)), 0
            ),
            window.innerHeight - fishElement.getBoundingClientRect().height
        )
    }

    function preventOverRotation(f, newRotation) {
        return f.rotationDirection === -1 ?
            Math.max(newRotation, f.targetRotation) :
            Math.min(newRotation, f.targetRotation)
    }

    function easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    function shortAngleDist(a0,a1) {
        var max = Math.PI*2;
        var da = (a1 - a0) % max;
        return 2*da % max - da;
    }

    function getRotationAtTime(f, time) {
        const totalTimeToAnimate = shortAngleDist(f.initialRotation, f.targetRotation)/(f.rotationDirection*f.rotationSpeed)
        const timeElapsed = time - f.yStartTime
        const animationProgress = totalTimeToAnimate == 0 ? 1 : Math.min(1, timeElapsed/totalTimeToAnimate);
        const newRotation = f.initialRotation + easeInOutCubic(animationProgress)*shortAngleDist(f.initialRotation, f.targetRotation)

        // TODO: handle this properly
        // if(Number.isNaN(newRotation)) {
        //     console.log(f.initialRotation, f.rotationDirection, f.rotationSpeed, timeElapsed);
        // }

        return preventOverRotation(f, newRotation);
    }

    function targetYPositionReached(f, newYPosition) {
        return (f.yDirection < 0 && newYPosition < f.targetYPosition) ||
            (f.yDirection > 0 && newYPosition > f.targetYPosition)
    }

    function targetXPositionReached(f) {
        const xPosition = f.initialXPosition + f.xDirection*f.xSpeed*(prevTimeRef.current - f.xStartTime);
        return (f.xDirection < 0 && xPosition < f.targetXPosition) ||
            (f.xDirection > 0 && xPosition > f.targetXPosition)
    }

    function calculateTargetRotation(f, yDirection) {
        return Math.atan(f.ySpeed/f.xSpeed)/6 * yDirection*-1
    }
    function initializeFish(f, time) {
        const fishElement = f.ref.current;
        const initialXPosition = f.xDirection < 0 ? window.innerWidth : -1*fishElement.getBoundingClientRect().width;
        const initialYPosition = getRandomInt(0, (window.innerHeight - fishElement.getBoundingClientRect().height))
        fishElement.style.transform = `translate(${ initialXPosition }px, ${ initialYPosition }px)`

        const targetYPosition = generateTargetYPosition(fishElement, initialYPosition)
        const yDirection = (targetYPosition - initialYPosition)/Math.abs(targetYPosition - initialYPosition)
        const initialRotation = 0;
        const targetRotation = calculateTargetRotation(f, yDirection);
        const rotationDirection = (targetRotation - initialRotation)/Math.abs((targetRotation - initialRotation));
        setFish(oldFish => oldFish.map(of => of.id === f.id ? {
                ...f,
                targetXPosition: f.xDirection < 0 ? -1*fishElement.getBoundingClientRect().width : window.innerWidth,
                targetYPosition,
                xStartTime: time,
                yStartTime: time,
                yDirection,
                initialXPosition,
                initialYPosition, 
                initialRotation,
                targetRotation,
                rotationDirection,
            } : of)
        )
    }

    function updateFishPosition(f, time) {
        const newXPosition = f.initialXPosition + f.xDirection*f.xSpeed*(time - f.xStartTime)
        const newYPosition = f.initialYPosition + f.yDirection*f.ySpeed*(time - f.yStartTime)
        const newRotation = getRotationAtTime(f, time);
        f.ref.current.style.transform = `
            translate(${ newXPosition }px, ${ newYPosition }px)
            rotate(${ newRotation }rad)`

        if(targetXPositionReached(f)) {
            setFish(oldFish => oldFish.filter(of => f.id !== of.id))
        } else if(targetYPositionReached(f, newYPosition)) {
            setFish(oldFish => oldFish.map(of => {
                if(of.id !== f.id) { return of; }

                const initialYPosition = newYPosition;
                const targetYPosition = generateTargetYPosition(f.ref.current, initialYPosition);
                const yDirection = (targetYPosition - initialYPosition) /
                    Math.abs(targetYPosition - initialYPosition)
                const targetRotation = calculateTargetRotation(f, yDirection);
                const initialRotation = newRotation;

                return {
                    ...of,
                    initialYPosition,
                    targetYPosition,
                    yDirection,
                    yStartTime: time,
                    initialRotation,
                    rotationDirection: targetRotation === initialRotation ?
                        f.rotationDirection
                        : (targetRotation - initialRotation) /
                            Math.abs(targetRotation - initialRotation),
                    targetRotation
                }
            }))
        }
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
        const interval = setInterval(() => {
            if(storyQueue.current.length > 0) {
                const fishToAdd = generateFish(storyQueue.current.shift())
                setFish(oldFish => oldFish.concat([ fishToAdd ]))
            }
        }, 4000)
        // }, 6000)
        return () => clearInterval(interval)
    }, [])

    function generateFish(storyInfo) {
        return {
            id: storyInfo.id,   // TODO: consider making this a different id
            targetXPosition: null, targetYPosition: null,
            xDirection: -1/* getRandomSign() */, xSpeed: getRandomInt(2, 5)/100,
            yDirection: getRandomSign(), ySpeed: getRandomInt(2, 5)/100,
            rotationSpeed: Math.PI/(3000),
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
