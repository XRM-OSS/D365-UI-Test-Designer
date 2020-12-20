import { communicationMessage } from "../domain/communication";

const state: Array<any> = [];

// Add event listener for extension events
chrome.runtime.onMessage.addListener((request: communicationMessage, sender, sendResponse) => {
    console.log(JSON.stringify(request));

    switch(request.recipient) {
        case "background":
            sendResponse(state);
            break;
        case "popup":
            state.push(request);
            console.log("Backend script received message for popup: " + JSON.stringify(request));
            chrome.runtime.sendMessage({ request });
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