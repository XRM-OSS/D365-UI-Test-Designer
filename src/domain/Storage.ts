import { TestSuite } from "./TestSuite";

const defaultState: TestSuite = {
    recordingToTest: "",
    tests: []
};

export const getStoredState = (): Promise<TestSuite> => {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get("popUpState", ({popUpState}) => chrome.runtime.lastError ? reject(chrome.runtime.lastError.message) : resolve(popUpState ?? defaultState));
    });
}

export const setStoredState = (state: TestSuite) => {
    return new Promise((resolve, reject) => {
        chrome.storage.local.set({ popUpState: state }, () => chrome.runtime.lastError ? reject(chrome.runtime.lastError.message) : resolve(null))
    });
}