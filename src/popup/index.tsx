import * as React from "react";
import * as ReactDOM from "react-dom";
import { App } from "./App";
import { initializeIcons } from '@fluentui/react/lib/Icons';

initializeIcons();

chrome.tabs.query({ active: true, currentWindow: true }, tab => {
    ReactDOM.render(<App />, document.getElementById("popup"));
});