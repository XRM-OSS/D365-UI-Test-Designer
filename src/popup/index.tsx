import * as React from "react";
import * as ReactDOM from "react-dom";
import { PopUp } from "./popup";

chrome.tabs.query({ active: true, currentWindow: true }, tab => {
    ReactDOM.render(<PopUp />, document.getElementById("popup"));
});