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
    storyCardPositionRef,
    dimensions
) => {
    const collapsedStyle = getCollapsedStyle(dimensions)

    const expandedStyle = {
        width: collapsedStyle.width * 1.3,
        height: collapsedStyle.height * 2,
    }

    if (expanded) {
        let xPositionModifier = 0.5
        let expandedWidthInPx = expandedStyle.width * (dimensions.width / 100)
        const collapsedWidthInPx =
            collapsedStyle.width * (dimensions.width / 100)
        const middlePositionXTranslation =
            storyCardPositionRef.current.left -
            xPositionModifier * expandedWidthInPx +
            xPositionModifier * collapsedWidthInPx
        const arrowButtonWidth = Math.max((4 * dimensions.width) / 100, 40)

        if (
            middlePositionXTranslation + expandedWidthInPx >=
            dimensions.width - arrowButtonWidth
        ) {
            // If middle positioned expanded card will overlap the right arrow button,
            // position right edge of expanded card with right edge of collapsed card.
            xPositionModifier = 1
        } else if (middlePositionXTranslation <= arrowButtonWidth) {
            // If middle positioned expanded card will overlap the left arrow button,
            // position left edge of expanded card with left edge of collapsed card.
            xPositionModifier = 0
        }

        // If the expanded card is large enough to overlap with the arrow buttons,
        // make it smaller. (This will only happen on small screens where the width
        // of the expanded card is close to the width of the screen.)
        if (expandedWidthInPx > dimensions.width - 2 * arrowButtonWidth) {
            expandedWidthInPx = dimensions.width - 2 * arrowButtonWidth
            expandedStyle.width = expandedWidthInPx / (dimensions.width / 100)
            expandedStyle.height = expandedStyle.width / 1.3
            xPositionModifier = 0.5
        }

        return {
            translateX: `calc(
                ${window.scrollX + storyCardPositionRef.current.left}px -
                ${xPositionModifier * expandedStyle.width}vw +
                ${xPositionModifier * collapsedStyle.width}vw
            )`,
            translateY: `calc(
                ${window.scrollY + storyCardPositionRef.current.top}px -
                ${expandedStyle.height / 2}vw +
                ${collapsedStyle.height / 2}vw
            )`,
            width: expandedStyle.width + "vw",
            height: expandedStyle.height + "vw",
            scaleToCollapsed: collapsedStyle.width / expandedStyle.width,
        }
    } else {
        return {
            width: collapsedStyle.width + "vw",
            height: collapsedStyle.height + "vw",
            margin: collapsedStyle.margin + "vw",
        }
    }
}

function getCollapsedStyle({ width }) {
    if (width <= 572) {
        return {
            width: 80,
            height: 40,
            margin: 1,
        }
    } else if (width <= 830) {
        return {
            width: 45,
            height: 45 / 2,
            margin: 0.5,
        }
    } else if (width <= 1083) {
        return {
            width: 30,
            height: 15,
            margin: 0.5,
        }
    } else if (width <= 1737) {
        return {
            width: 22,
            height: 11,
            margin: 0.5,
        }
    } else {
        return {
            width: 18.5,
            height: 19 / 2,
            margin: 0.25,
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
