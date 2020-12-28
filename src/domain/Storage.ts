import { PageState } from "./PageState";
import { TestSuite } from "./TestSuite";

export const defaultPageState: PageState = {
    recordingToTest: ""
};

export const defaultTestSuite: TestSuite = {
    tests: []
}

export const getStoredPageState = (): Promise<PageState> => {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get("popUpState", ({popUpState}) => chrome.runtime.lastError ? reject(chrome.runtime.lastError.message) : resolve(popUpState ?? defaultPageState));
    });
}

export const setStoredPageState = (state: PageState) => {
    return new Promise((resolve, reject) => {
        chrome.storage.local.set({ popUpState: state }, () => chrome.runtime.lastError ? reject(chrome.runtime.lastError.message) : resolve(null))
    });
}

export const getStoredTestSuite = (): Promise<TestSuite> => {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get("testSuite", ({testSuite}) => chrome.runtime.lastError ? reject(chrome.runtime.lastError.message) : resolve(testSuite ?? defaultTestSuite));
    });
}

export const setStoredTestSuite = (state: TestSuite) => {
    return new Promise((resolve, reject) => {
        chrome.storage.local.set({ testSuite: state }, () => chrome.runtime.lastError ? reject(chrome.runtime.lastError.message) : resolve(null))
    });
}