import { GlobalState } from "./GlobalState";
import { PageState } from "./PageState";
import { TestSuite } from "./TestSuite";

export const defaultPageState: PageState = {
    recordingToTest: ""
};

export const defaultTestSuite: TestSuite = {
    tests: [],
    metadata: {}
};

export const defaultGlobalState: GlobalState = {

};

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

export const upgradeTestSuiteIfNecessary = (suite: TestSuite) => {
    // Upgrade tests if created with a version which was not able to specify assertions in multiselect
    if (suite.tests?.some(t => t.actions?.some(a => a.event === "assertion" && !a.controls))) {
        for (const test of suite.tests) {
            if (!test.actions.some(a => a.event === "assertion" && !a.controls)){
                break;
            }

            test.actions = test.actions.map(a => (a.event !== "assertion" || a.controls) ? a : ({...a, controls: [{ attributeName: (a as any).attributeName, attributeType: (a as any).attributeType, name: (a as any).name }]}));
        }
    }
};

export const getStoredTestSuite = (): Promise<TestSuite> => {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get("testSuite", ({testSuite}: { testSuite: TestSuite }) => {
            if(chrome.runtime.lastError) {
                reject(chrome.runtime.lastError.message);
                return;
            }
            
            const suite = testSuite ?? defaultTestSuite;
            upgradeTestSuiteIfNecessary(suite);            

            resolve(suite);
        });
    });
}

export const setStoredTestSuite = (state: TestSuite) => {
    return new Promise((resolve, reject) => {
        chrome.storage.local.set({ testSuite: state }, () => chrome.runtime.lastError ? reject(chrome.runtime.lastError.message) : resolve(null))
    });
}

export const getStoredGlobalState = (): Promise<GlobalState> => {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get("globalState", ({globalState}) => chrome.runtime.lastError ? reject(chrome.runtime.lastError.message) : resolve(globalState ?? defaultGlobalState));
    });
}

export const setStoredGlobalState = (state: GlobalState) => {
    return new Promise((resolve, reject) => {
        chrome.storage.local.set({ globalState: state }, () => chrome.runtime.lastError ? reject(chrome.runtime.lastError.message) : resolve(null))
    });
}