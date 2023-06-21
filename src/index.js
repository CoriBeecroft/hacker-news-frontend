import React from "react";
import { createRoot } from "react-dom/client";
import { HackerNews } from "./hn-original/HackerNewsOriginal"
// import { HackerNews } from "./hn-fish/HackerNewsFish"
// import { Test } from "./hn-fish/Test"

import "./HackerNewsCommon.scss";

const container = document.getElementById("container");
const root = createRoot(container);
root.render(<HackerNews />);
