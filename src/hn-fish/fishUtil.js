import { throttle } from "lodash";
import { getRandomInt, getRandomSign } from "../util";


// Guessing 275 here is an approximation for fish width (fish body is set to 250px
// and tail width is based on body height)
// 285 is probably also based on fish width
// There might be a more precise way of doing this but this might just be good enough. 
// In either case, these number should probably at least be stored as constants or
// something so it's more obvious what they represent... or maybe it's obvious and
// I'm just too tired rn. 
export let timeToTraverseScreen = Math.max((getOceanWidth() + 275)/0.04, 10000);
const fishSpeed = (getOceanWidth() + 275)/timeToTraverseScreen
export let fishAdditionInterval = 285/fishSpeed //6000;
let periodModifier = getOceanWidth()/1440
// console.log(periodModifier, fishAdditionInterval, timeToTraverseScreen, fishSpeed)

const updateAnimationParameters = throttle(() => {
    timeToTraverseScreen = Math.max((getOceanWidth() + 275)/0.04, 10000);
    fishAdditionInterval = 285/fishSpeed //6000;
    periodModifier = getOceanWidth()/1440
    // console.log(periodModifier, fishAdditionInterval, timeToTraverseScreen, fishSpeed)
})
window.addEventListener("resize", updateAnimationParameters)

export const HEADER_HEIGHT = 35;

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
        renderingData: {
            id: storyInfo.id,   // TODO: consider making this a different id
            storyInfo,
            color: chooseFishColor(),
            selected: false,
            animationDuration: 1200 * speedModifier,
            animationDelay: -1*getRandomInt(0, 1201),
        },
        animationData: {
            id: storyInfo.id,   // TODO: consider making this a different id
            speedModifier,
            targetXPosition: null,
            xDirection: -1, //getRandomSign(),
            amplitude: getRandomInt(20, 60),
            phase: getRandomInt(1, 6)/4,
            phaseShift: getRandomInt(0, 360)*Math.PI/180,
            index: storyInfo.index,
            initialized: false,
            // for debugging
            // xDirection: -1,
            // amplitude: 100,//getOceanHeight()/2,
            // phase: 1,
            // phaseShift: 0,
        }
    }
}

export function initializeFish(f) {
    const time = performance.now()
    const fishElement = f.ref.current;
    const maxFishWidth = Math.sqrt(Math.pow(f.width, 2) + Math.pow(f.height, 2));
    const getInitialXPosition = () => f.xDirection > 0 ?
        -1 * f.width : getOceanWidth();
    // Fish width changes when fish are rotated so maxFishWidth is
    // necessary here to ensure fish aren't removed from the DOM
    // before they are all the way off the screen.
    const targetXPosition = f.xDirection > 0 ?
        getOceanWidth() : -1 * maxFishWidth;
    const yBaseline = getRandomInt(0, 101)/100

    // fishElement.style.transform = `translate(${ initialXPosition }px, ${ yBaseline }px)`
    fishElement.style.translate = `${ getInitialXPosition() }px 
        ${ yBaseline * (getOceanHeight() - f.height) }px`

    return {
        ...f,
        targetXPosition,
        xStartTime: time, yStartTime: time,
        getInitialXPosition, yBaseline,
        initialized: true,
    };
}

export function getPositionAtTime(f, time) {
    return [ getXPositionAtTime(f, time), getYPositionAtTime(f, time) ]
}

export function getXPositionAtTime(f, time) {
    const progress = (time - f.xStartTime)/(timeToTraverseScreen*f.speedModifier)
    const position = f.getInitialXPosition() + (f.targetXPosition - f.getInitialXPosition()) * progress;

    return position;
}

export function getYPositionAtTime(f, time) {
    const theta = getThetaAtTime(f, time)
    return fishSine(f, theta)
}

// TODO: better name for this
function getThetaAtTime(fish, time) {
    const progress = (time - fish.yStartTime)/(fish.speedModifier*timeToTraverseScreen)
    const theta = progress * 2 * Math.PI
    return theta
}

function fishSine(f, theta) {
    return -1 * f.amplitude * Math.sin(theta*f.phase*periodModifier + f.phaseShift) + getYBaselineInPx(f)
    // some prototype mods for small screens
    // return f.amplitude/1.5 * Math.sin(theta*f.phase/2 + f.phaseShift) + getYBaselineInPx(f)
}

function getRotation(f, newXPosition, newYPosition, prevTime, time) {
    const [ prevXPosition, prevYPosition ] = getPositionAtTime(f, prevTime)
    const deltaTime = time - prevTime
    const xSpeed = (newXPosition - prevXPosition)/deltaTime
    const ySpeed = (newYPosition - prevYPosition)/deltaTime

    return Math.atan(ySpeed/xSpeed);
}

export function updateFishPosition(f, time, prevTime) {
    if(f.paused) { return; }

    const [ newXPosition, newYPosition ] = getPositionAtTime(f, time);
    const newRotation = getRotation(f, newXPosition, newYPosition, prevTime, time);

    f.ref.current.style.translate = `${ newXPosition }px ${ newYPosition }px`;
    f.ref.current.style.rotate = `${ newRotation }rad`
}

export function getXVelocity(f) {
    const distanceToTravel = Math.abs(f.getInitialXPosition() - f.targetXPosition);
    return distanceToTravel/(f.speedModifier*timeToTraverseScreen);
}

export function targetXPositionReached(f, prevTime) {
    if( f.paused || !f.initialized) { return false; }

    const xPosition = getXPositionAtTime(f, prevTime)
    return (f.xDirection < 0 && xPosition < f.targetXPosition) ||
        (f.xDirection > 0 && xPosition > f.targetXPosition)
}

export function getYBaselineInPx(f) {
    return f.yBaseline * (getOceanHeight() - f.height)
}

export function yPxToBaseline(f, px) {
    return px/(getOceanHeight() - f.height)
}

export function pauseFish(fish, time=performance.now()) {
    fish.paused = true;
    fish.pauseStartTime = time;
}
export function unpauseFish(fish, time=performance.now()) {
    const pauseTime = time - fish.pauseStartTime;
    fish.xStartTime += pauseTime
    fish.yStartTime += pauseTime

    fish.paused = false
    fish.pauseStartTime = null
}

export function shiftFishAnimationOrigin(fish, dx, dy) {
    fish.xStartTime += dx/getXVelocity(fish)
    fish.yBaseline = yPxToBaseline(
        fish,
        getYBaselineInPx(fish) + dy
    )
}

export function setFishPhase(fish, targetPhase, time=performance.now()) {
    const currentPhasePositionRad = getThetaAtTime(fish, time)
    const phaseDeltaRad = targetPhase - currentPhasePositionRad
    fish.phaseShift = (fish.phaseShift + phaseDeltaRad)*fish.phase%(2*Math.PI)
}

function getOceanWidth() {
    return window.innerWidth
}
function getOceanHeight() {
    return window.innerHeight - HEADER_HEIGHT;
}
