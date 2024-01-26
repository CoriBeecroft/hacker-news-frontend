import { useEffect, useRef } from "react";
import { generateFish, FISH_ADDITION_INTERVAL, targetXPositionReached } from "./fishUtil";


export function useAddAndRemoveFish(stories, fishAnimationData, fishDispatch) {
    const storyData = useRef({ storiesToAdd: [], addedStories: [] });

    useEffect(() => {
        if(!stories) { return; }

        storyData.current.storiesToAdd = storyData.current.storiesToAdd
            .concat(stories.map((s, i) => ({ ...s, index: i })))
        addOrRemoveFish();
    }, [ stories ])

    function updateStoriesToAdd() {
        if(storyData.current.storiesToAdd.length === 0
                || storyData.current.addedStories.length > 5) {
            // Move the oldest story that isn't a fish from addedStories to storiesToAdd
            // identify oldest story that isn't a fish
            const fishOnScreen = Object.values(fishAnimationData.current).map(f => f.id)
            const oldestAddedNonfishStory = storyData.current.addedStories.find(s => !fishOnScreen.some(id => s.id === id));
            if(oldestAddedNonfishStory) {
                // add oldest fish that isn't a story to storiesToAdd
                storyData.current.storiesToAdd.push(oldestAddedNonfishStory)
                // remove oldest fish that isn't a story from addedStories
                storyData.current.addedStories = storyData.current.addedStories.filter(s => s !== oldestAddedNonfishStory)
            }

            // Debugging logs
            // console.log("storiesToAdd", storyData.current.storiesToAdd.map(s => s.index));
            // console.log("addedStories", storyData.current.addedStories.map(s => s.index));
        }
    }

    function addOrRemoveFish() {
        updateStoriesToAdd()

        let fishToAdd = []
        if(storyData.current.storiesToAdd.length > 0) {
            const story = storyData.current.storiesToAdd.shift()
            storyData.current.addedStories.push(story)
            const { renderingData, animationData } = generateFish(story)

            fishToAdd.push(renderingData)
            // fishDispatch({ type: "ADD_FISH", newFish: renderingData })
            fishAnimationData.current[animationData.id] = animationData;
        }

        const offScreenFishIds = Object.values(fishAnimationData.current)
            .filter(f => targetXPositionReached(f, performance.now()))
            .map(f => f.id)
        offScreenFishIds.forEach(id => {
            delete fishAnimationData.current[id]
        })

        fishDispatch({
            type: "ADD_AND_REMOVE_FISH",
            fishIdsToRemove: offScreenFishIds,
            fishToAdd
        })
    }

    useTimeoutInterval(
        addOrRemoveFish,
        FISH_ADDITION_INTERVAL,
        []
    )
}

function useTimeoutInterval(callback, delay, dependencies=[]) {
    const lastTimeoutTime = useRef(null);
    const timeout = useRef(null)

    function getTimeoutTime() {
        return lastTimeoutTime.current == null ? delay
            : delay - (Date.now() - lastTimeoutTime.current)
    }

    useEffect(() => {
        if(timeout.current) { clearTimeout(timeout.current) }
        // let interval = setInterval(callback, delay)
        const timeoutCallback = () => {
            callback();
            lastTimeoutTime.current = Date.now();
            timeout.current = setTimeout(timeoutCallback, getTimeoutTime());
        }

        timeout.current = setTimeout(
            timeoutCallback,
            getTimeoutTime()
        )
    
        return () => {
            // clearInterval(interval)
            // interval = null;
            clearTimeout(timeout.current);
            timeout.current = null;
        }
    }, dependencies)
}