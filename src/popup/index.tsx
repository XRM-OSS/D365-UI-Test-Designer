import * as React from "react";
import * as ReactDOM from "react-dom";
import { PopUp } from "./Popup";
import { initializeIcons } from '@fluentui/react/lib/Icons';

initializeIcons();

chrome.tabs.query({ active: true, currentWindow: true }, tab => {
    ReactDOM.render(<PopUp />, document.getElementById("popup"));
});