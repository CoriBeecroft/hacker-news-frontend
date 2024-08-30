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
