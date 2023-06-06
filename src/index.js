import React from "react";
import { createRoot } from "react-dom/client";
import { HackerNews } from "./HackerNewsOriginal"
// import { HackerNews } from "./HackerNewsFish"

import "./HackerNewsCommon.scss";

const container = document.getElementById("container");
const root = createRoot(container);
root.render(<HackerNews />);
