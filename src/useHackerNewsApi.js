import { useState, useEffect, useRef } from "react"

const HN_API_URL = "https://hacker-news.firebaseio.com/v0"
const PAGE_SIZE = 30
const useHackerNewsApi = storyType => {
    const [stories, setStories] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [offset, setOffset] = useState(0)
    const controllerRef = useRef(null)
    // For debugging error handling, delete soon
    // const [ isFirstAttempt, setIsFirstAttempt] = useState(true)

    const fetchStories = async () => {
        setLoading(true)

        controllerRef.current = new AbortController()
        const signal = controllerRef.current.signal
        try {
            const url = `${HN_API_URL}/${storyType.toLowerCase()}stories.json`
            const response = await fetch(url, { signal })
            const storyIds = await response.json()

            if (!response.ok) {
                throw new Error("Error fetching stories")
            }

            const stories = await Promise.all(
                storyIds.slice(offset, PAGE_SIZE).map(async id => {
                    const storyResponse = await fetch(
                        `${HN_API_URL}/item/${id}.json`,
                        { signal }
                    )
                    return storyResponse.json()
                })
            )

            // For debugging error handling, delete soon
            // if(isFirstAttempt) {
            //     setIsFirstAttempt(false)
            //     throw new Error();
            // }

            // TODO: This filtering step is a bit of a hack. Apparently sometimes the
            // HN api returns null for requests to valid story ids. This seems to be a
            // bug in the HN api. I identified the id of a story that was coming back null
            // and found the same story id on the original hn site (confirmed same id
            // from the URL). The story shows up on the site but the request for the
            // item through the API returns null. Not quite sure what the right solution
            // is here but it should probably be something better than this, haha.
            setStories(stories.filter(story => story != null))
        } catch (error) {
            setError(error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchStories()
        return () => controllerRef.current.abort()
    }, [storyType])

    const fetchAgain = () => {
        setError(null)
        fetchStories()
    }

    return { stories, loading, error, fetchAgain }
}

export default useHackerNewsApi
