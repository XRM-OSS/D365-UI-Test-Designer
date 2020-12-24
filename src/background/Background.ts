import { TestSuite } from "../domain/TestSuite";
import { CommunicationMessage, CommunicationRequest, CommunicationResponse } from "../domain/Communication";
import { getStoredState, setStoredState } from "../domain/Storage";

const processMessageToPage = async (request: CommunicationRequest) => {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, request);
    });
};

const processMessageToPopUp = async (request: CommunicationResponse) => {
    const state = await getStoredState();

    switch (request.operation) {
        case "startRecording":
            state.recordingToTest = "asdf";
            break;
        case "stopRecording": 
            if (request.success) {
                state.recordingToTest = undefined;
            }
            break;
        case "getAttributes":
            state.attributes = request.data;
            break;
        case "attributeChanged":
            state.tests[0].captures.push(request.data);
            break;
    }

    await setStoredState(state);

    console.log("Backend script received message for popup: " + JSON.stringify(request));
    chrome.runtime.sendMessage(state);
};

// Add event listener for extension events
chrome.runtime.onMessage.addListener((request: CommunicationMessage, sender, sendResponse) => {
    switch(request.recipient) {
        case "popup":
            processMessageToPopUp(request as CommunicationResponse);
            break;
        case "page":
            console.log("Backend script received message for page: " + JSON.stringify(request));
            processMessageToPage(request as CommunicationRequest);
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

        const state = await getStoredState();
        state.recordingToTest = undefined;

        await setStoredState(state);
    });
});