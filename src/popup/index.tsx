import * as React from "react";
import * as ReactDOM from "react-dom";
import { PopUp } from "./Popup";
import { initializeIcons } from '@fluentui/react/lib/Icons';

const iconUrl = chrome.runtime.getURL("fonts/fabric-icons-a13498cf.woff").replace("fabric-icons-a13498cf.woff", "");
initializeIcons(iconUrl);

chrome.tabs.query({ active: true, currentWindow: true }, tab => {
    ReactDOM.render(<PopUp />, document.getElementById("popup"));
});