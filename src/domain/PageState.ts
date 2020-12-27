export interface PageElementState {
    controlName: string;
    controlType: string;
    label: string;
    logicalName: string;
    requiredLevel: Xrm.Attributes.RequirementLevel;
    value: any;
    attributeType: Xrm.Attributes.AttributeType;
    visible: boolean;
    disabled: boolean;
}

export interface FormContainer {
    name: string;
    label: string;
    visible: boolean;
}

export interface FormTab extends FormContainer {
    expanded: boolean;
}

export interface FormSection extends FormContainer {

}

export interface FormState {
    entity: string;
    recordId: string;
    tabs: Array<FormTab>;
    sections: Array<FormSection>;
    pageElements: Array<PageElementState>;
}

export interface PageState {
    recordingToTest?: string;
    formState?: FormState;
}