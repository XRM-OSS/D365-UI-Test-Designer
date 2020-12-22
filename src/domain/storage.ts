import { popUpState } from "./popUpState";

const defaultState: popUpState = {
    isRecording: false,
    captures: []
};

export const getState = (): Promise<popUpState> => {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get("popUpState", ({popUpState}) => chrome.runtime.lastError ? reject(chrome.runtime.lastError.message) : resolve(popUpState ?? defaultState));
    });
}

export const setState = (state: popUpState) => {
    return new Promise((resolve, reject) => {
        chrome.storage.local.set({ popUpState: state }, () => chrome.runtime.lastError ? reject(chrome.runtime.lastError.message) : resolve(null))
    });
}