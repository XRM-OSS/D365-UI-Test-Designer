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

export interface TestSuite {
    recordingToTest?: string;
    tests?: Array<TestDefinition>;
    attributes?: Array<string>;
    controls?: Array<string>;
}