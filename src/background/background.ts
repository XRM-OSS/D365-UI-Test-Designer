import { popUpState } from "../domain/popUpState";
import { communicationMessage, communicationRequest, communicationResponse } from "../domain/communication";
import { getState, setState } from "../domain/storage";

const processMessageToPage = async (request: communicationRequest) => {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, request);
    });
};

const processMessageToPopUp = async (request: communicationResponse) => {
    const state = await getState();

    switch (request.operation) {
        case "startRecording":
            state.isRecording = request.success;
            break;
        case "stopRecording": 
            state.isRecording = !request.success;
            break;
        case "getAttributes":
            state.attributes = request.data;
            break;
        case "attributeChanged":
            state.captures.push(request.data);
            break;
    }

    await setState(state);

    console.log("Backend script received message for popup: " + JSON.stringify(request));
    chrome.runtime.sendMessage(state);
};

// Add event listener for extension events
chrome.runtime.onMessage.addListener((request: communicationMessage, sender, sendResponse) => {
    switch(request.recipient) {
        case "popup":
            processMessageToPopUp(request as communicationResponse);
            break;
        case "page":
            console.log("Backend script received message for page: " + JSON.stringify(request));
            processMessageToPage(request as communicationRequest);
            break;
        default:
            break;
        }
});

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    chrome.tabs.query({active: true, currentWindow: true}, async (tabs) => {
        if (tabs[0].id !== tabId) {
            return;
        }

        const state = await getState();
        state.isRecording = false;

        await setState(state);
    });
});