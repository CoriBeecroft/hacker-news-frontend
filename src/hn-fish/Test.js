import React, { useEffect, useState, useRef } from "react";
import { getRandomInt} from "../util";
import { uniqueId } from "lodash"
import printeff from "../../../printeff/dist/main.bundle.js"

import "./Test.scss";


const FISH_ADDITION_INTERVAL = 8000;
const TIME_TO_TRAVERSE_SCREEN = 30000;
export function Test() {
    const [ fish, setFish ] = useState([]);
    const prevTimeRef = useRef();
    const animationFrameRef = useRef();
    const lastTimeoutTime = useRef(null);
    const timeout = useRef(null)

    const fps = useRef([]);
    const frames = useRef(0);


    useEffect(() => {
        printeff("frames", frames.current);
        printeff("fps", fps.current);
        setInterval(() => {
            fps.current.push(frames.current);
            if(fps.current.length > 100) {
                fps.current.shift();
            }
            printeff("frames", frames.current);
            frames.current = 0;
            printeff("fps", fps.current);
        }, 1000)
    }, [])

    function getRotation(f, newXPosition, newYPosition, time) {
        const prevXPosition = getXPositionAtTime(f, prevTimeRef.current)
        const prevYPosition = getYPositionAtTime(f, prevTimeRef.current)
        const xSpeed = newXPosition - prevXPosition
        const ySpeed = newYPosition - prevYPosition
        const rotation = Math.atan(ySpeed/xSpeed);
// const rotation = Math.floor(10000*Math.atan(ySpeed/xSpeed))/10000;
        // console.log("rotation", rotation)
        // return (time - f.xStartTime) * 0.00005 % (2*Math.PI)//
        return /* (180/Math.PI)* */rotation;
        // return 0; 
    }

    function targetXPositionReached(f) {
        if(f.active) { return false; }

        const xPosition = getXPositionAtTime(f, prevTimeRef.current)
        return (f.xDirection < 0 && xPosition < f.targetXPosition) ||
            (f.xDirection > 0 && xPosition > f.targetXPosition)
    }

    function initializeFish(f) {
        const time = prevTimeRef.current;//performance.now()
        const fishElement = f.ref.current;
        const initialXPosition = f.xDirection > 0 ?
            -1 * fishElement.getBoundingClientRect().width :
            window.innerWidth + fishElement.getBoundingClientRect().width * f.i;
        const targetXPosition = f.xDirection > 0 ?
            window.innerWidth:
            -1 * fishElement.getBoundingClientRect().width;
        const initialYPosition = getRandomInt(
            0,
            window.innerHeight - fishElement.getBoundingClientRect().height
        )

        fishElement.style.translate = `${ initialXPosition }px ${ initialYPosition }px`

        setFish(oldFish => oldFish.map(of => of.id === f.id ? {
                ...f,
                targetXPosition,
                xStartTime: time, yStartTime: time,
                initialXPosition, initialYPosition,
                initialized: true,
            } : of)
        )
    }

    function getXPositionAtTime(f, time) {
        const progress = (time - f.xStartTime)/(TIME_TO_TRAVERSE_SCREEN + f.i * 6000)
        const position = f.initialXPosition + (f.targetXPosition - f.initialXPosition) * progress;
        // if(getRandomInt(0, 10) === 0) {
        //     console.log(position);
        // }
        return position;
    }

    function getYPositionAtTime(f, time) {
        // const progress = (time - f.xStartTime)/TIME_TO_TRAVERSE_SCREEN
        // const position = f.initialYPosition + (window.innerHeight - f.initialYPosition) * progress;
        // // if(getRandomInt(0, 10) === 0) {
        // //     console.log(position);
        // // }
        // return 50;//position;
        const timeElapsed = time - f.yStartTime
        // if(getRandomInt(0, 10) === 0) {
            // console.log(time, f.yStartTime);
            // console.log(timeElapsed, f.amplitude * Math.sin(timeElapsed*0.0005 + f.phaseShift) + f.initialYPosition)
        // }
        return f.amplitude * Math.sin(timeElapsed*0.0005 + f.phaseShift) + f.initialYPosition
    }

    function updateFishPosition(f, time) {
        if(f.active) { return; }

        const newXPosition = getXPositionAtTime(f, time);
        const newYPosition = getYPositionAtTime(f, time);
        const newRotation = getRotation(f, newXPosition, newYPosition, time);

        // if(time > prevTimeRef.current) {
            // console.log("only ascending", time)
            f.ref.current.style.translate = `${ newXPosition }px ${ newYPosition }px`
            // f.ref.current.style.rotate = `${ newRotation }rad`
        // }
        
    }

    const frame = time => {
        // console.log(time);

        frames.current++;
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
        console.log("fish changed");
        if(animationFrameRef.current) {
            // console.log("canceling animation frame...");
            cancelAnimationFrame(animationFrameRef.current);
        }
        animationFrameRef.current = requestAnimationFrame(frame);

        return () => cancelAnimationFrame(animationFrameRef.current);
    }, [ fish ])

    function updateFishCollection(i) {
        const fishToAdd = generateFish(i)
        setFish(oldFish => oldFish.filter(f => !targetXPositionReached(f)).concat([ fishToAdd ]))

        lastTimeoutTime.current = Date.now();
        // clearTimeout(timeout.current)
        // timeout.current = setTimeout(updateFishCollection, FISH_ADDITION_INTERVAL)
    }

    function getTimeoutTime() {
        return lastTimeoutTime.current == null ? FISH_ADDITION_INTERVAL
            : FISH_ADDITION_INTERVAL - (Date.now() - lastTimeoutTime.current)
    }
    useEffect(() => {
        for(let i = 0; i<30; i++) {
            updateFishCollection(i);
        }
    }, [])
    useEffect(() => {
        // if(timeout.current) { clearTimeout(timeout.current) }
        // // updateFishCollection()
        // timeout.current = setTimeout(
        //     updateFishCollection,
        //     getTimeoutTime()
        // )

        fish.forEach(f => {
            if(f.ref && f.ref.current && !f.xStartTime) {
                initializeFish(f);
            }
        })

        return () => clearTimeout(timeout.current)
    }, [ fish ])

    function generateFish(i) {
        return {
            id: uniqueId(),
            i: i,
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

	return <div id="HNFE">
        { fish.map(f => <Fish { ...{
            key: f.id,
            ...f,
            registerRef: registerFishRef,
        }} /> )}
	</div>
}


function Fish(props) {
    const ref = useRef();
    const fishTailHeight = useRef(0);
    const className = [
        "fish-tank",
        ...(props.active ? ["active"] : []),
        ...(props.initialized ? [] : ["invisible"])
    ].join(" ")

    useEffect(() => props.registerRef(ref, props.id), [])
    useEffect(() => {
        if(ref.current) {
            fishTailHeight.current = ref.current.getBoundingClientRect().height * .75;
        }
    }, [ ref.current ])


    return <div { ...{
        ref,
        className,
    }}>
        <div className={ [ "fish", (props.active ? "active" : "") ].join(" ") }>
            <div style={{ width: 300, height: 200, backgroundColor: props.color, borderRadius: "100%" }}>I am a fish!</div>
            <div className={ `fish-tail ${props.color} ${props.active ? "active" : "" }` } style={{
                borderRightWidth: fishTailHeight.current/2,
                borderTopWidth: fishTailHeight.current/2,
                borderBottomWidth: fishTailHeight.current/2,
                marginLeft: fishTailHeight.current/2*-0.25,
                animationDelay: props.animationDelay + "ms",
            }} />
        </div>
        
    </div>
}

