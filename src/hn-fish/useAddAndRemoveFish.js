import { useEffect, useRef } from "react";
import { generateFish, initializeFish, FISH_ADDITION_INTERVAL,
    targetXPositionReached } from "./fishUtil";

export function useAddAndRemoveFish(stories, fish, setFish) {
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
            const oldestAddedNonfishStory = storyData.current.addedStories.find(s => !fish.some(f => s.id === f.id));
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

        if(storyData.current.storiesToAdd.length > 0) {
            const story = storyData.current.storiesToAdd.shift()
            storyData.current.addedStories.push(story)
            const fishToAdd = generateFish(story)
            setFish(oldFish => oldFish.filter(f => !targetXPositionReached(f, performance.now())).concat([ fishToAdd ]))
        } else if(!!fish.find(f => targetXPositionReached(f, performance.now()))) {
            setFish(oldFish => oldFish.filter(f => !targetXPositionReached(f, performance.now())))
        }
    }

    useTimeoutInterval(
        addOrRemoveFish,
        FISH_ADDITION_INTERVAL,
        [ fish ]
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

        timeout.current = setTimeout(
            () => {
                callback();
                lastTimeoutTime.current = Date.now();
                timeout.current = null;
            },
            getTimeoutTime()
        )
    
        return () => {
            clearTimeout(timeout.current);
            timeout.current = null;
        }
    }, dependencies)
}