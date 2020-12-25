export interface CommunicationMessage {
    recipient: "page" | "popup";
    operation: "getControls" | "getState" | "startRecording" | "stopRecording" | "attributeChanged";
}

export interface CommunicationRequest extends CommunicationMessage {
}

export interface CommunicationResponse extends CommunicationMessage {
    success: boolean;
    data?: any
}