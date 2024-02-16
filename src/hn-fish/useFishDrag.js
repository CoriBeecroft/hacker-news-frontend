import { useEffect, useRef, useCallback, useState } from "react";
import throttle from "lodash/throttle";
import { getPositionAtTime, pauseFish, unpauseFish,
    shiftFishAnimationOrigin } from "./fishUtil";

const DRAG_THRESHOLD = 10
function useFishDrag(fishAnimationData, fishDispatch) {
    const [ isDragging, setIsDragging ] = useState(false);
    const fish = useRef(null)
    const wasDragged = useRef(false)
    const initialPosition = useRef({ x: null, y: null })
    const mouseOffset = useRef({ x: null, y: null })
    const animationFrame = useRef(null)

    const getWasDragged = useCallback(() => wasDragged.current, [])
    const startDrag = useCallback((f, draggable, e) => {
        wasDragged.current = false;
        if(draggable) {
            fish.current = fishAnimationData.current[f.id];
            initialPosition.current = { x: e.pageX, y: e.pageY }
        }
    }, [])
    const containerStyle = isDragging ? { touchAction: "none" } : {}

    useEffect(() => {
        document.addEventListener("pointermove", handlePointerMove)
        document.addEventListener("pointerup", handlePointerUp, { capture: true })

        return () => {
            document.removeEventListener("pointermove", handlePointerMove);
            document.removeEventListener("pointerup", handlePointerUp, true);
            cancelAnimationFrame(animationFrame.current);
        }
    }, [ isDragging ])

    function handlePointerMove(e) {
        e.preventDefault();
        if(!fish.current) { return; }

        const position = { x: e.pageX, y: e.pageY }
        if(!isDragging && calculateDistance(initialPosition.current, position) > DRAG_THRESHOLD) {
            initializeDrag(position)
        } else if(isDragging) {
            animationFrame.current = updateDraggedFish(fish.current, position, mouseOffset.current);
        }
    }

    function handlePointerUp(e) {
        if(!isDragging) { fish.current = null; }
        else {
            e.stopPropagation();
            finishDrag({ x: e.pageX, y: e.pageY })
        }
    }

    function initializeDrag(position) {
        const time = performance.now();
        const [ fishX, fishY ] = getPositionAtTime(fish.current, time)
        mouseOffset.current = {
            x: fishX - position.x,
            y: fishY - position.y
        }
        initialPosition.current = position

        fishDispatch({ type: "UPDATE_FISH", id: fish.current.id, update: { dragging: true }})
        pauseFish(fish.current, time)

        setIsDragging(true)
        animationFrame.current = updateDraggedFish(fish.current, position, mouseOffset.current)
    }

    function finishDrag(position) {
        fishDispatch({ type: "MOVE_FISH_TO_TOP", id: fish.current.id })
        fishDispatch({ type: "UPDATE_FISH", id: fish.current.id, update: { dragging: false }})
        shiftFishAnimationOrigin(
            fish.current,
            position.x - initialPosition.current.x,
            position.y - initialPosition.current.y
        )
        unpauseFish(fish.current)

        fish.current = null;
        wasDragged.current = true
        setIsDragging(false)
        cancelAnimationFrame(animationFrame.current);
    }

    return { getWasDragged, startDrag, containerStyle }
}

export default useFishDrag;

function calculateDistance(p1, p2) {
    return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2))
}

const updateDraggedFish = throttle((fish, position, offset) => {
    const xPosition = position.x + offset.x;
    const yPosition = position.y + offset.y;

    return requestAnimationFrame(() => {
        if(fish) {
            fish.ref.current.style.translate = `${xPosition}px ${yPosition}px`
        }
    })
})