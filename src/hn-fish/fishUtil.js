import { getRandomInt, getRandomSign } from "../util";

export const FISH_ADDITION_INTERVAL = 6000;
export const TIME_TO_TRAVERSE_SCREEN = 36000;

let lastFishColor = null;
function chooseFishColor() {
    const fishColors = [ "orange", "purple", "blue", "yellow", "red", "green" ]
        .filter(f => f !== lastFishColor)
    const color = fishColors[getRandomInt(0, fishColors.length)]

    lastFishColor = color;
    return color
}
export function generateFish(storyInfo) {
    const speedModifier = (100 - getRandomInt(1, 20))/100
    return {
        id: storyInfo.id,   // TODO: consider making this a different id
        storyInfo,
        color: chooseFishColor(),
        active: false,
        speedModifier,
        animationDuration: 1200 * speedModifier,
        targetXPosition: null,
        animationDelay: -1*getRandomInt(0, 1201),
        xDirection: -1, //getRandomSign(),
        amplitude: getRandomInt(20, 60),
        phase: getRandomInt(1, 6)/4,
        phaseShift: getRandomInt(0, 360)*Math.PI/180,
        // animationDelay: 0,
        // xDirection: -1,
        // amplitude: 100,
        // phase: 1,
        // phaseShift: 0,
    }
}

export function initializeFish(f) {
    const time = performance.now()
    const fishElement = f.ref.current;
    const maxFishWidth = Math.sqrt(Math.pow(f.width, 2) + Math.pow(f.height, 2));
    const getInitialXPosition = () => f.xDirection > 0 ?
        -1 * f.width : window.innerWidth;
    // Fish width changes when fish are rotated so maxFishWidth is
    // necessary here to ensure fish aren't removed from the DOM
    // before they are all the way off the screen.
    const targetXPosition = f.xDirection > 0 ?
        window.innerWidth : -1 * maxFishWidth;
    const yBaseline = getRandomInt(0, 101)/100
    // const yBaseline = 0.5

    // fishElement.style.transform = `translate(${ initialXPosition }px, ${ yBaseline }px)`
    fishElement.style.translate = `${ getInitialXPosition() }px 
        ${ yBaseline * (window.innerHeight - f.height) }px`

    return {
        ...f,
        targetXPosition,
        xStartTime: time, yStartTime: time,
        getInitialXPosition, yBaseline,
    };
}

export function getXPositionAtTime(f, time) {
    const progress = (time - f.xStartTime)/(TIME_TO_TRAVERSE_SCREEN*f.speedModifier)
    const position = f.getInitialXPosition() + (f.targetXPosition - f.getInitialXPosition()) * progress;

    return position;
}

export function getYPositionAtTime(f, time) {
    const progress = (time - f.yStartTime)/(f.speedModifier*TIME_TO_TRAVERSE_SCREEN)
    const theta = progress * 2 * Math.PI;
    return f.amplitude * Math.sin(theta*f.phase + f.phaseShift) + getYBaselineInPx(f)
    // some prototype mods for small screens
    // return f.amplitude/1.5 * Math.sin(theta*f.phase/2 + f.phaseShift) + getYBaselineInPx(f)
}

function getRotation(f, newXPosition, newYPosition, prevTime) {
    const prevXPosition = getXPositionAtTime(f, prevTime)
    const prevYPosition = getYPositionAtTime(f, prevTime)
    const xSpeed = newXPosition - prevXPosition
    const ySpeed = newYPosition - prevYPosition

    return Math.atan(ySpeed/xSpeed);
}

export function updateFishPosition(f, time, prevTime) {
    if(f.active || f.paused) { return; }

    const newXPosition = getXPositionAtTime(f, time);
    const newYPosition = getYPositionAtTime(f, time);
    const newRotation = getRotation(f, newXPosition, newYPosition, prevTime);

    // f.ref.current.style.transform = `translate(${ newXPosition }px, ${ newYPosition }px)
        // rotate(${ newRotation }rad)`
    f.ref.current.style.translate = `${ newXPosition }px ${ newYPosition }px`;
    f.ref.current.style.rotate = `${ newRotation }rad`
}

export function getXVelocity(f) {
    const distanceToTravel = window.innerWidth + f.width;
    return distanceToTravel/(f.speedModifier*TIME_TO_TRAVERSE_SCREEN);
}

export function targetXPositionReached(f, prevTime) {
    if(f.active || f.paused) { return false; }

    const xPosition = getXPositionAtTime(f, prevTime)
    return (f.xDirection < 0 && xPosition < f.targetXPosition) ||
        (f.xDirection > 0 && xPosition > f.targetXPosition)
}

export function getYBaselineInPx(f) {
    return f.yBaseline * (window.innerHeight - f.height)
}

export function yPxToBaseline(f, px) {
    return px/(window.innerHeight - f.height)
}
