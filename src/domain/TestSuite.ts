export interface FormAction {
    event: "setValue" | "save";
    attributeType?: string;
    name: string;
    value?: any;
}

export interface AssertionDefinition {
    expectedVisibility?: { type: "noop" | "visible" | "hidden", active?: boolean };
    expectedDisableState?: { type: "noop" | "enabled" | "disabled", active?: boolean };
    expectedFieldLevel?: { type: "noop" | "none" | "recommended" | "required", active?: boolean };
    expectedOptions?: { type: "noop" | "matches", options?: Array<number>, active?: boolean };
    expectedValue?: { type: "noop" | "null" | "notnull" | "value", active?: boolean, value?: any };
}

export interface TestTimeout {
    event: "timeout";
    duration: number;
}

export interface TestAssertion {
    event: "assertion";
    name?: string;
    attributeName?: string;
    assertions: AssertionDefinition;
    attributeType?: string;
}

export type TestAction = FormAction | TestAssertion | TestTimeout;

export interface PreTestNavigation {
    entity: string;
    recordId?: string; 
}

export interface TestDefinition {
    preTestNavigation?: PreTestNavigation;
    name?: string;
    actions?: Array<TestAction>;
    postTestNavigation?: any;
    id: string;
}

export interface TestSuite {
    tests?: Array<TestDefinition>;
}