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
        if(initialYPosition === 0) {
            return initialYPosition + (getRandomInt(100, 150) + 1)
        }
        if(initialYPosition === window.innerHeight - fishElement.getBoundingClientRect().height) {
            return initialYPosition - (getRandomInt(100, 150) + 1)
        }

        return Math.min(
            Math.max(
                (initialYPosition + getRandomSign()*(getRandomInt(100, 150) + 1)), 0
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
    function easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
    }

    function shortAngleDist(a0,a1) {
        var max = Math.PI*2;
        var da = (a1 - a0) % max;
        return 2*da % max - da;
    }

    // TODO: rename this function or make it actually based on time
    function getRotationAtTime(f, time, newXPosition, newYPosition) {
        const prevXPosition = f.initialXPosition + f.xDirection*f.xSpeed*(prevTimeRef.current - f.xStartTime) 
        const prevYPosition = getPositionAtTime(f.initialYPosition, f.targetYPosition, f.yDirection, f.ySpeed, prevTimeRef.current, f.yStartTime)//f.initialYPosition + f.yDirection*f.ySpeed*(prevTimeRef.current - f.yStartTime)
        const xSpeed = newXPosition - prevXPosition
        const ySpeed = newYPosition - prevYPosition

        return Math.atan(ySpeed/xSpeed)
    }

    function targetYPositionReached(f, newYPosition) {
        return (f.yDirection < 0 && newYPosition <= f.targetYPosition) ||
            (f.yDirection > 0 && newYPosition >= f.targetYPosition)
    }

    function targetXPositionReached(f) {
        const xPosition = f.initialXPosition + f.xDirection*f.xSpeed*(prevTimeRef.current - f.xStartTime);
        return (f.xDirection < 0 && xPosition < f.targetXPosition) ||
            (f.xDirection > 0 && xPosition > f.targetXPosition)
    }

    function initializeFish(f, time) {
        const fishElement = f.ref.current;
        const initialXPosition = f.xDirection < 0 ? window.innerWidth : -1*fishElement.getBoundingClientRect().width;
        const initialYPosition = getRandomInt(0, (window.innerHeight - fishElement.getBoundingClientRect().height))
        fishElement.style.transform = `translate(${ initialXPosition }px, ${ initialYPosition }px)`

        const targetYPosition = generateTargetYPosition(fishElement, initialYPosition)
        const yDirection = (targetYPosition - initialYPosition)/Math.abs(targetYPosition - initialYPosition)
        setFish(oldFish => oldFish.map(of => of.id === f.id ? {
                ...f,
                targetXPosition: f.xDirection < 0 ? -1*fishElement.getBoundingClientRect().width : window.innerWidth,
                targetYPosition,
                xStartTime: time,
                yStartTime: time,
                yDirection,
                initialXPosition,
                initialYPosition, 
            } : of)
        )
    }

    function getPositionAtTime(initialPosition, targetPosition, direction, speed, time, startTime) {
        const progress = Math.min(
            (time - startTime)/((targetPosition - initialPosition)/(speed * direction)),
            1
        );

        // lerp = A + (B-A)t
        const position = initialPosition + (targetPosition - initialPosition) * easeInOutCubic(progress)

        return position;
    }

    function updateFishPosition(f, time) {
        const newXPosition = f.initialXPosition + f.xDirection*f.xSpeed*(time - f.xStartTime)
        const newYPosition = getPositionAtTime(f.initialYPosition, f.targetYPosition, f.yDirection, f.ySpeed, time, f.yStartTime)//f.initialYPosition + f.yDirection*f.ySpeed*(time - f.yStartTime)
        const newRotation = getRotationAtTime(f, time, newXPosition, newYPosition);

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

                return {
                    ...of,
                    initialYPosition,
                    targetYPosition,
                    yDirection,
                    yStartTime: time,
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
        }, 3000)
        // }, 6000)
        return () => clearInterval(interval)
    }, [])

    function generateFish(storyInfo) {
        return {
            id: storyInfo.id,   // TODO: consider making this a different id
            targetXPosition: null, targetYPosition: null,
            xDirection: getRandomSign(), xSpeed: getRandomInt(2, 5)/100,
            yDirection: getRandomSign(), ySpeed: getRandomInt(6, 6)/500,
            // rotationSpeed: Math.PI/(800),
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
