import { useState, useEffect } from 'react';

const HN_API_URL = "https://hacker-news.firebaseio.com/v0"
const useHackerNewsApi = (storyType) => {
    const [ stories, setStories ] = useState([]);
    const [ loading, setLoading ] = useState(true);
    const [ error, setError ] = useState(null);

    useEffect(() => {
        const controller = new AbortController();
        const signal = controller.signal;

        const fetchStories = async () => {
            setLoading(true);

            try {
                const url = `${HN_API_URL}/${storyType.toLowerCase()}stories.json`;
                const response = await fetch(url, { signal });
                const storyIds = await response.json();

                const stories = await Promise.all(storyIds.slice(0, 30).map(async (id) => {
                    const storyResponse = await fetch(
                        `${HN_API_URL}/item/${id}.json`,
                        { signal }
                    );
                    return storyResponse.json();
                }));

                setStories(stories);
            } catch (error) {
                if (!(error instanceof DOMException && error.name === "AbortError")) {
                    setError(error);
                }
            } finally { setLoading(false); }
        };

        fetchStories();

        return () => controller.abort();
    }, [ storyType ]);

    return { stories, loading, error };
};

export default useHackerNewsApi;
