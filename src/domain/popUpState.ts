export interface popUpState {
    isRecording?: boolean;
    captures?: Array<{event: string; attributeType: string; name: string; value: any;}>;
    attributes?: Array<string>;
}