import React, { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { HackerNews } from "./hn-original/HackerNewsOriginal"
import { HackerNewsFish } from "./hn-fish/HackerNewsFish"
import { HNAndChill } from "./hn-and-chill/HNAndChill"
import { getQueryParam } from "./util"

import "./HackerNewsCommon.scss"

const mode = getQueryParam("mode") || "hn"
let hn;
switch (mode) {
    case "chill":
        hn = <HNAndChill />
        break;
    case "fish":
        hn = <HackerNewsFish />
        break;
    case "hn":
    default:
        hn = <HackerNews />
}
const container = document.getElementById("container")
const root = createRoot(container)
root.render(hn)

// root.render(<StrictMode>
//     <HackerNews />
// </StrictMode>);
