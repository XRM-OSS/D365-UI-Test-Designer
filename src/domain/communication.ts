export interface communicationMessage {
    recipient: "page" | "popup";
    operation: "getAttributes" | "getState" | "startRecording" | "stopRecording" | "attributeChanged";
}

export interface communicationRequest extends communicationMessage {
}

export interface communicationResponse extends communicationMessage {
    success: boolean;
    data?: any
}