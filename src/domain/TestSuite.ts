export interface TestCapture {
    event: string;
    attributeType?: string;
    name: string;
    value?: any;
}

export interface TestDefinition {
    preTestNavigation?: any;
    name?: string;
    captures?: Array<TestCapture>;
    postTestNavigation?: any;
}

export interface ControlState {
    controlName: string;
    controlType: string;
    label: string;
    logicalName: string;
    requiredLevel: Xrm.Attributes.RequirementLevel;
    value: any;
    attributeType: Xrm.Attributes.AttributeType;
}

export interface TestSuite {
    recordingToTest?: string;
    tests?: Array<TestDefinition>;
    controls?: Array<ControlState>;
}