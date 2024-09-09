// Assumes alpha values are <= 1
function getInterpolatedColor(color1, color2, progress, type) {
    const differenceValues = []

    for (let i = 0; i < color1.length; i++) {
        differenceValues.push(color2[i] - color1[i])
    }

    if (type === "hsla") {
        return `hsla(
            ${color1[0] + progress * differenceValues[0]},
            ${color1[1] + progress * differenceValues[1]}%,
            ${color1[2] + progress * differenceValues[2]}%,
            ${color1[3] + progress * differenceValues[3]}
        )`
    } else if (type === "rgba") {
        return `rgba(
            ${(color1[0] + progress * differenceValues[0]) % 255},
            ${(color1[1] + progress * differenceValues[1]) % 255},
            ${(color1[2] + progress * differenceValues[2]) % 255},
            ${color1[3] + progress * differenceValues[3]}
        )`
    } else {
        console.error("Invalid color type: ", type)
    }
}

function generateTimeGradient(time, large) {
    const color1 = [0, 96, 47],
        color2 = [0, 96, 0]
    const colorType = "hsla"
    const mappedTime =
        // easeOutQuadratic(
        Math.min((new Date().getTime() / 1000 - time) / (60 * 60 * 24 * 7), 1)
    // )

    return large
        ? `linear-gradient(
            184deg,
            ${getInterpolatedColor(
                [...color1, 0.4],
                [...color2, 0.4],
                mappedTime,
                colorType
            )},
            ${getInterpolatedColor(
                [...color1, 0.2],
                [...color2, 0.2],
                mappedTime,
                colorType
            )},
            rgba(0, 0, 0, 0) 25%
        )`
        : `linear-gradient(
                184deg,
                ${getInterpolatedColor(
                    [...color1, 0.4],
                    [...color2, 0.4],
                    mappedTime,
                    colorType
                )},
                ${getInterpolatedColor(
                    [...color1, 0.2],
                    [...color2, 0.2],
                    mappedTime,
                    colorType
                )},
                rgba(0, 0, 0, 0) 25%
            )`
}

// TODO: memoize the calls to this
export const createGradientBackground = ({
    score = 0,
    time,
    descendants = 0,
    large = false,
}) => {
    const mappedScore = (score / 500) * 180 + 75
    const mappedDescendants = descendants % 255
    const finalStop = large ? 0.6 * 80 : 80
    const initialOpacity = large ? 0.25 : 0.5

    return {
        backgroundImage: `radial-gradient(
            ellipse at -20% 100%,
            rgba(0, 0, ${mappedScore}, ${initialOpacity}),
            transparent ${finalStop}%
        ),
        ${generateTimeGradient(time, large)},
        radial-gradient(
            ellipse at 120% 100%,
            rgba(${mappedDescendants}, 0, ${mappedDescendants}, ${initialOpacity}
        ),
            transparent ${finalStop}%
        )`,
        backgroundColor: large ? "#222" : "#333", //hsl(198deg, 90.9%, 23.56%)
    }
}

export const calculateCardDimensionStyle = (
    expanded = false,
    storyCardPositionRef
) => {
    const collapsedStyle = {
        width: 22,
        minWidth: 250,
        maxWidth: 350,
        height: 11,
        minHeight: 137,
        maxHeight: 192,
    }

    const expandedStyle = {
        width: collapsedStyle.width * 1.3,
        minWidth: collapsedStyle.minWidth * 1.3,
        maxWidth: collapsedStyle.maxWidth * 1.3,
        height: collapsedStyle.height * 2,
        minHeight: collapsedStyle.minHeight * 2,
        maxHeight: collapsedStyle.maxHeight * 2,
    }

    if (expanded) {
        return {
            translateX: `calc(
                ${window.scrollX + storyCardPositionRef.current.left}px -
                ${expandedStyle.width / 2}vw +
                ${collapsedStyle.width / 2}vw
            )`,
            translateY: `calc(
                ${window.scrollY + storyCardPositionRef.current.top}px -
                ${expandedStyle.height / 2}vw +
                ${collapsedStyle.height / 2}vw
            )`,
            width: expandedStyle.width + "vw",
            minWidth: expandedStyle.minWidth + "px",
            maxWidth: expandedStyle.maxWidth + "px",
            height: expandedStyle.height + "vw",
            minHeight: expandedStyle.minHeight + "px",
            minWidth: expandedStyle.minWidth + "px",
        }
    } else {
        return {
            width: collapsedStyle.width + "vw",
            minWidth: collapsedStyle.minWidth + "px",
            maxWidth: collapsedStyle.maxWidth + "px",
            height: collapsedStyle.height + "vw",
            minHeight: collapsedStyle.minHeight + "px",
            maxHeight: collapsedStyle.maxHeight + "px",
        }
    }
}

export const animate = (target, keyframes, options) => {
    const animation = target.animate(keyframes, options)
    return new Promise(resolve => {
        animation.onfinish = () => {
            target.style.transform = keyframes[1].transform
            resolve()
        }
    })
}

// Easing functions
function easeOutQuadratic(x) {
    return 1 - Math.pow(1 - x, 2)
}
function easeInCubic(x) {
    return x * x * x
}
