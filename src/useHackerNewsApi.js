import { useState, useEffect, useRef } from 'react';

const HN_API_URL = "https://hacker-news.firebaseio.com/v0"
const PAGE_SIZE = 30;
const useHackerNewsApi = (storyType) => {
    const [ stories, setStories ] = useState([]);
    const [ loading, setLoading ] = useState(true);
    const [ error, setError ] = useState(null);
    const [ offset, setOffset ] = useState(0);
    const controllerRef = useRef(null);
    // For debugging error handling, delete soon
    // const [ isFirstAttempt, setIsFirstAttempt] = useState(true)

    const fetchStories = async () => {
        setLoading(true);

        controllerRef.current = new AbortController();
        const signal = controllerRef.current.signal
        try {
            const url = `${HN_API_URL}/${storyType.toLowerCase()}stories.json`;
            const response = await fetch(url, { signal });
            const storyIds = await response.json();

            if(!response.ok) {
                throw new Error("Error fetching stories")
            }

            const stories = await Promise.all(storyIds.slice(offset, PAGE_SIZE).map(async (id) => {
                const storyResponse = await fetch(
                    `${HN_API_URL}/item/${id}.json`,
                    { signal }
                );
                return storyResponse.json();
            }));

            // For debugging error handling, delete soon
            // if(isFirstAttempt) {
            //     setIsFirstAttempt(false)
            //     throw new Error();
            // }

            setStories(stories);
        } catch (error) {
            setError(error);
        } finally { setLoading(false); }
    };

    useEffect(() => {
        fetchStories()
        return () => controllerRef.current.abort();
    }, [ storyType ]);

    const fetchAgain = () => {
        setError(null)
        fetchStories()
    }

    return { stories, loading, error, fetchAgain };
};

export default useHackerNewsApi;
