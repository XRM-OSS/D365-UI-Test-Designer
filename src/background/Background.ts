import { EntityMetadata, TestSuite } from "../domain/TestSuite";
import { CommunicationMessage, CommunicationRequest, CommunicationResponse } from "../domain/Communication";
import { getStoredPageState, setStoredPageState, getStoredTestSuite, setStoredTestSuite, getStoredGlobalState, setStoredGlobalState } from "../domain/Storage";

const processMessageToPage = async (request: CommunicationRequest) => {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, request);
    });
};

const processMessageToPopUp = async (request: CommunicationResponse) => {
    const pageState = await getStoredPageState();
    const testSuite = await getStoredTestSuite();

    if (!request.success) {
        return;
    }

    switch (request.operation) {
        case "startRecording":
            // This will set the test to which we currently record
            pageState.recordingToTest = request.data;
            await setStoredPageState(pageState);
            break;
        case "stopRecording": 
            pageState.recordingToTest = undefined;
            await setStoredPageState(pageState);
            break;
        case "getFormState":
            pageState.formState = request.data;
            await setStoredPageState(pageState);
            break;
        case "getEntityMetadata":
            const payload = request.data as EntityMetadata;
            if (payload) {
                testSuite.metadata[payload.logicalName] = payload;
                await setStoredTestSuite(testSuite);
            }
            break;
        case "formEvent":
            const activeTest = testSuite.tests.find(t => t.id === pageState.recordingToTest);
            activeTest && activeTest.actions.push(request.data);
            await setStoredTestSuite(testSuite);
            break;
        case "getGlobalState":
            await setStoredGlobalState(request.data);
            break;
    }

    console.log("Backend script received message for popup: " + JSON.stringify(request));
    chrome.runtime.sendMessage("ping");
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
        if (!tabs[0] || tabs[0].id !== tabId) {
            return;
        }

        if (!changeInfo.url) {
            return;
        }

        const state = await getStoredPageState();
        state.recordingToTest = undefined;
        state.formState = undefined;

        await setStoredPageState(state);

        const globalState = await getStoredGlobalState();
        globalState.appId = undefined;

        await setStoredGlobalState(globalState);
    });
});