import { useEffect, useRef } from "react";
import { updateFishPosition } from "./fishUtil";
// import printeff from "../../../printeff/dist/main.bundle.js"

export function useFishAnimation(fishesAnimationData) {
    const animationFrameRef = useRef();
    const prevTimeRef = useRef();

    // const fps = useRef([]);
    // const frames = useRef(0);

    const frame = time => {
        // frames.current++;
        if(time != prevTimeRef.current) {
            Object.values(fishesAnimationData.current).forEach(f => {
                if(f.ref && f.ref.current) {
                    updateFishPosition(f, time, prevTimeRef.current);
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
    }, [])
}
