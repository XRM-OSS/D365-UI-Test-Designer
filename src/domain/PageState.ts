export interface PageElementState {
    controlName: string;
    controlType: string;
    label: string;
    logicalName: string;
    requiredLevel: Xrm.Attributes.RequirementLevel;
    value: any;
    attributeType: Xrm.Attributes.AttributeType;
}

export interface FormState {
    entity: string;
    recordId: string;
    pageElements: Array<PageElementState>;
}

export interface PageState {
    recordingToTest?: string;
    formState?: FormState;
}