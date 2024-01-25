import { useEffect, useRef } from "react";
import { generateFish, FISH_ADDITION_INTERVAL } from "./fishUtil";


export function useAddAndRemoveFish(stories, fishState, fishDispatch) {
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
            const oldestAddedNonfishStory = storyData.current.addedStories.find(s => !fishState.ids.some(id => s.id === id));
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
        fishDispatch({ type: "REMOVE_OFFSCREEN_FISH" })

        // console.log("adding or removing fish...")

        if(storyData.current.storiesToAdd.length > 0) {
            // remove fish that have already traversed the screen and add new fish
            const story = storyData.current.storiesToAdd.shift()
            storyData.current.addedStories.push(story)
            const fishToAdd = generateFish(story)
  
            fishDispatch({ type: "ADD_FISH", newFish: fishToAdd })
        }
    }

    useTimeoutInterval(
        addOrRemoveFish,
        FISH_ADDITION_INTERVAL,
        [ fishState.data ]
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