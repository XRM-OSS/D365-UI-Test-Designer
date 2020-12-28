import { ControlTypes } from "./ControlTypes";

export interface ControlState {
    type: ControlTypes;
    controlName: string;
    visible: boolean;
    disabled?: boolean;
    logicalName?: string;
    attributeType?: Xrm.Attributes.AttributeType;
    requiredLevel?: Xrm.Attributes.RequirementLevel;
    value?: any;
}

export interface FormState {
    entity: string;
    recordId: string;
    controlStates: Array<ControlState>;
}

export interface PageState {
    recordingToTest?: string;
    formState?: FormState;
}