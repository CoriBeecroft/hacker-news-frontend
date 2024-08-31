export const createGradientBackground = ({
    score = 0,
    time,
    descendants = 0,
    large = false,
}) => {
    const mappedTime =
        255 - ((new Date().getTime() / 1000 - time) / (60 * 60 * 24 * 3)) * 255
    const mappedScore = (score / 500) * 180 + 75
    const mappedDescendants = descendants % 255
    return large
        ? {
              backgroundImage: `radial-gradient(
                    ellipse at -20% 100%,
                    rgba(0, 0, ${mappedScore}, 0.25),
                    transparent ${0.6 * 80}%
                ),
                linear-gradient(
                    184deg,
                    rgba(${mappedTime}, 6, 15, 0.4),
                    rgba(${mappedTime}, 6, 15, 0.2) ${1 * 10}%,
                    rgba(0, 0, 0, 0) ${1 * 25}%
                ),
                radial-gradient(
                    ellipse at 120% 100%,
                    rgba(${mappedDescendants}, 0, ${mappedDescendants}, 0.25
                ),
                    transparent ${0.6 * 80}%
                )`,
          }
        : {
              backgroundImage: `radial-gradient(
                    ellipse at -20% 100%,
                    rgba(0, 0, ${mappedScore}, 0.25),
                    transparent 80%
                ),
                linear-gradient(
                    184deg,
                    rgba(${mappedTime}, 6, 15, 0.4),
                    rgba(${mappedTime}, 6, 15, 0.2) 10%,
                    rgba(0, 0, 0, 0) 25%
                ),
                radial-gradient(
                    ellipse at 120% 100%,
                    rgba(${mappedDescendants}, 0, ${mappedDescendants}, 0.25
                ),
                    transparent 80%
                )`,
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
