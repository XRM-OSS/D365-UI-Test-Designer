export interface TestCapture {
    event: string;
    attributeType?: string;
    name: string;
    value?: any;
}

export interface PreTestNavigation {
    entity: string;
    recordId?: string; 
}

export interface TestDefinition {
    preTestNavigation?: PreTestNavigation;
    name?: string;
    actions?: Array<TestCapture>;
    postTestNavigation?: any;
    id: string;
}

export interface TestSuite {
    tests?: Array<TestDefinition>;
}