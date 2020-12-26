export interface CommunicationMessage {
    recipient: "page" | "popup";
    operation: "getFormState" | "getState" | "startRecording" | "stopRecording" | "attributeChanged";
    data?: any
}

export interface CommunicationRequest extends CommunicationMessage {
}

export interface CommunicationResponse extends CommunicationMessage {
    success: boolean;
}