import * as React from "react";
import * as ReactDOM from "react-dom";
import { PopUp } from "./Popup";

import "../../node_modules/bootstrap/dist/css/bootstrap.min.css";

chrome.tabs.query({ active: true, currentWindow: true }, tab => {
    ReactDOM.render(<PopUp />, document.getElementById("popup"));
});