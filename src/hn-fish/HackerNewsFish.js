import React, { useEffect, useState, useRef } from "react";
import { HN_API_URL, getRandomInt, getRandomSign } from "../util";
import { StorySummary } from "../components/StorySummary";
import { StoryContent } from "../components/StoryContent";

import "./HackerNewsFish.scss";


const FISH_ADDITION_INTERVAL = 8000;
const TIME_TO_TRAVERSE_SCREEN = 36000;
export function HackerNews() {
    const [ storyIds, setStoryIds ] = useState([]);
    const [ fish, setFish ] = useState([]);
    const [ showFishLog, setShowFishLog ] = useState(false);
    const storyData = useRef({ storiesToAdd: [], addedStories: [] });
    const prevTimeRef = useRef();
    const animationFrameRef = useRef();
    const lastTimeoutTime = useRef(null);
    const timeout = useRef(null)


    useEffect(() => {
        document.addEventListener('keypress', e => {
            if(e.key === '`') { setShowFishLog(prev => !prev) }
        })
    }, [])

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
            storyData.current.storiesToAdd = storyData.current.storiesToAdd
                .concat(stories
                    .map((s, i) => ({ ...s, index: i }))
                )
            updateFishCollection();
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
        if(f.active) { return false; }

        const xPosition = getXPositionAtTime(f, prevTimeRef.current)
        return (f.xDirection < 0 && xPosition < f.targetXPosition) ||
            (f.xDirection > 0 && xPosition > f.targetXPosition)
    }

    function initializeFish(f) {
        const time = performance.now()
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
        const progress = (time - f.xStartTime)/TIME_TO_TRAVERSE_SCREEN
        const position = f.initialXPosition + (f.targetXPosition - f.initialXPosition) * progress;

        return position;
    }

    function getYPositionAtTime(f, time) {
        const timeElapsed = time - f.yStartTime

        return f.amplitude * Math.sin(timeElapsed*0.0005 + f.phaseShift) + f.initialYPosition
    }

    function updateFishPosition(f, time) {
        if(f.active) { return; }

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
                if(f.ref && f.ref.current) {
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

    function updateStoriesToAdd() {
        if(storyData.current.storiesToAdd.length === 0
                || storyData.current.addedStories.length > 20) {
            // Move all the stories that aren't fish from addedStories to storiesToAdd
            // const addedStoriesThatAreNotFish = storyData.current.addedStories.filter(s => !fish.some(f => s.id === f.id));
            // const addedStoriesThatAreFish = storyData.current.addedStories.filter(s => fish.some(f => s.id === f.id))
            // storyData.current.storiesToAdd = storyData.current.storiesToAdd.concat(addedStoriesThatAreNotFish.reverse())
            // storyData.current.addedStories = addedStoriesThatAreFish

            // Move the oldest story that isn't a fish from addedStories to storiesToAdd
            storyData.current.addedStories.reverse()
            const oldestAddedNonfishStory = storyData.current.addedStories.find(s => !fish.some(f => s.id === f.id));
            if(oldestAddedNonfishStory) {
                const addedStoriesMinusOldestNonfish = storyData.current.addedStories.filter(s => s !== oldestAddedNonfishStory)
                storyData.current.storiesToAdd.push(oldestAddedNonfishStory)
                storyData.current.addedStories = addedStoriesMinusOldestNonfish
            }
            storyData.current.addedStories.reverse()

            // Debugging logs
            // console.log("storiesToAdd", storyData.current.storiesToAdd.map(s => s.index));
            // console.log("addedStories", storyData.current.addedStories.map(s => s.index));
        }
    }

    function updateFishCollection() {
        updateStoriesToAdd();

        if(storyData.current.storiesToAdd.length > 0) {
            const story = storyData.current.storiesToAdd.shift()
            // Use this option to add stories in random order
            // const story = storyData.current.storiesToAdd.splice(getRandomInt(0, storiesToAdd.length), 1)[0];
            storyData.current.addedStories.unshift(story)
            const fishToAdd = generateFish(story)
            setFish(oldFish => oldFish.filter(f => !targetXPositionReached(f)).concat([ fishToAdd ]))
        } else if(!!fish.find(targetXPositionReached)) {
            setFish(oldFish => oldFish.filter(f => !targetXPositionReached(f)))
        }

        lastTimeoutTime.current = Date.now();
        clearTimeout(timeout.current)
        timeout.current = setTimeout(updateFishCollection, FISH_ADDITION_INTERVAL)
    }

    function getTimeoutTime() {
        return lastTimeoutTime.current == null ? FISH_ADDITION_INTERVAL
            : FISH_ADDITION_INTERVAL - (Date.now() - lastTimeoutTime.current)
    }

    useEffect(() => {
        if(timeout.current) { clearTimeout(timeout.current) }

        timeout.current = setTimeout(
            updateFishCollection,
            getTimeoutTime()
        )

        fish.forEach(f => {
            if(f.ref && f.ref.current && !f.xStartTime) {
                initializeFish(f);
            }
        })

        return () => clearTimeout(timeout.current)
    }, [ fish ])

    function generateFish(storyInfo) {
        return {
            id: storyInfo.id,   // TODO: consider making this a different id
            storyInfo,
            active: false,
            color: [ "orange", "purple", "blue", "yellow", "red" ][getRandomInt(0, 5)],
            animationDelay: getRandomInt(0, 1501),
            targetXPosition: null,
            xDirection: -1, //getRandomSign(),
            amplitude: getRandomInt(10, 30),
            phaseShift: getRandomInt(0, 50),
            frequency: getRandomInt(3, 7)/10000,
            initialized: false,
        }
    }

    function registerFishRef(ref, id) {
        setFish(oldFish => oldFish.map(f => f.id === id ? { ...f, ref } : f))
    }

    function updateActiveFish(targetFishId) {
        setFish(oldFish => oldFish.map(f => {
            const newFish = { ...f }
            if(f.active) {
                const now = performance.now();
                newFish.xStartTime = f.xStartTime + (now - f.pauseStartTime);
                newFish.yStartTime = f.yStartTime + (now - f.pauseStartTime);
                newFish.active = false;
                // Note: It's not ideal to have the transition cleared out at this point
                // since that means the fish jumps from the top left of the screen to close
                // to where it was before it was activated. Leaving the transition on smooths
                // out the movement but it creates a weird bug where the fish isn't clickable
                // for a while after it is deactivated. This is probably because the transition
                // and my animation loop are competing for setting the transform property which
                // seems to putting the location of the fish in some indeterminate state or
                // something. It would be good to fix this at some point but right now it's
                // looking like a huge rabbit hole for a very small thing so I'm just going to
                // live with it for now and come back to it later.
                f.ref.current.style.transition = ``
            } else if(!f.active && f.id === targetFishId) {
                newFish.pauseStartTime = performance.now();
                newFish.active = true;
                f.ref.current.style.transition = `transform 500ms`
                f.ref.current.style.transform = `translate(0px, 0px) rotate(0rad)`
            }
            return newFish;
        }))
    }

	return <div id="HNFE">
        { fish.map(f => <Fish { ...{
            key: f.id,
            ...f,
            registerRef: registerFishRef,
            updateActiveFish: updateActiveFish
        }} /> )}
        <FishLog { ...{
            showFishLog,
            fish,
            addedStories: storyData.current.addedStories
        }}/>
	</div>
}

function FishLog(props) {
    const ref = useRef()
    let style = {};
    if(!props.showFishLog) {
        style = { transform: `translate(${ window.innerWidth }px, 0px)` }
    } else if(ref.current) {
        const xPosition = window.innerWidth - ref.current.getBoundingClientRect().width;
        style = { transform: `translate(${ xPosition }px, 0px)` }
    }

    return <div ref={ ref } className="fish-log" style={ style }>
        { props.addedStories.map(s => <FishLogItem key={ s.id } { ...s } />) }
    </div>
}

function FishLogItem(props) {
    return <div className="fish-log-item">
        { `${ props.index + 1 }. ${ props.title }` }
    </div>
}

function Fish(props) {
    const [ animatingFish, setAnimatingFish ] = useState(false);
    const ref = useRef();
    const fishTailHeight = useRef(0);
    const showStoryContent = props.active && !animatingFish
    const className = [
        "fish-tank",
        (props.active ? "active" : ""),
    ].join(" ")

    useEffect(() => props.registerRef(ref, props.id), [])
    useEffect(() => {
        fishTailHeight.current = ref.current.getBoundingClientRect().height * .8;
    }, [ ref.current ])

    return <div { ...{
        ref,
        className,
        onTransitionEnd: e => {
            if(e.propertyName === "transform") {
                setAnimatingFish(false)
            }
        }
    }}>
        <div className={ [ "fish", (props.active ? "active" : "") ].join(" ") }>
            <StorySummary { ...{
                className: props.color,
                loading: false,
                active: props.active,
                onClick: () => {
                    props.updateActiveFish(props.id)
                    setAnimatingFish(true)
                },
                index: props.storyInfo.index,
                storyInfo: props.storyInfo,
            }}/>
            <div className={ `fish-tail ${props.color} ${props.active ? "active" : "" }` } style={{
                borderRightWidth: fishTailHeight.current/2*1.15,
                borderTopWidth: fishTailHeight.current/2,
                borderBottomWidth: fishTailHeight.current/2,
                animationDelay: props.animationDelay + "ms",
            }} />
        </div>
        { props.active && <StoryContent { ...{
            currentStory: props.id,
            ...props.storyInfo,
            className: [ props.color, showStoryContent ? "" : "invisible" ].join(" ")
        }} /> }
    </div>
}
