import { popUpState } from "../domain/popUpState";
import { communicationMessage, communicationResponse } from "../domain/communication";

const state: popUpState = {
    isRecording: false,
    captures: []
};

const processMessageToPopUp = (request: communicationResponse) => {
    switch (request.operation) {
        case "startRecording":
            state.isRecording = request.data;
            break;
        case "stopRecording": 
            state.isRecording = !request.data;
            break;
        case "getAttributes":
            state.attributes = request.data;
            break;
        case "attributeChanged":
            state.captures.push(request.data);
            break;
    }

    console.log("Backend script received message for popup: " + JSON.stringify(request));
    chrome.runtime.sendMessage(state);
}

// Add event listener for extension events
chrome.runtime.onMessage.addListener((request: communicationMessage, sender, sendResponse) => {
    console.log(JSON.stringify(request));

    switch(request.recipient) {
        case "background":
            sendResponse(state);
            break;
        case "popup":
            processMessageToPopUp(request as communicationResponse);
            break;
        case "page":
            console.log("Backend script received message for page: " + JSON.stringify(request));

            chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                chrome.tabs.sendMessage(tabs[0].id, request);
            });
            break;
        default:
            break;
        }
});