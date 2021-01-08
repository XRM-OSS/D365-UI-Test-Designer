import { EntityControl } from "./ControlTypes";

export interface FormAction {
    event: "setValue" | "save" | "activate" | "deactivate" | "delete";
    attributeType?: Xrm.Attributes.AttributeType;
    name?: string;
    logicalName?: string;
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
    type: "duration" | "selector";
    duration?: number;
    selector?: string;
}

export interface TestAssertion {
    event: "assertion";
    name?: string;
    attributeName?: string;
    assertions: AssertionDefinition;
    attributeType?: Xrm.Attributes.AttributeType;
}

export type TestAction = FormAction | TestAssertion | TestTimeout;

export interface NoRecordNavigation {
    type: "noop";
}

export interface NewRecordNavigation {
    type: "new";
    entity: string;
}

export interface ExistingRecordNavigation {
    type: "existing";
    entity: string;
    recordId: string;
}

export interface LookupNavigation {
    type: "lookup";
    controlName: string;
    logicalName: string;
}

export interface SubgridNavigation {
    type: "subgrid";
    subgridName: string;
    recordPosition: number;
}

export type PreTestNavigation = NoRecordNavigation | NewRecordNavigation | ExistingRecordNavigation | LookupNavigation | SubgridNavigation;

export interface TestDefinition {
    entityLogicalName: string;
    preTestNavigation?: PreTestNavigation;
    name?: string;
    description?: string;
    actions?: Array<TestAction>;
    id: string;
}

export interface EntityMetadata {
    logicalName: string;
    controls: Array<EntityControl>;
}

export interface Settings {
    appId?: string;
}

export interface TestSuite {
    metadata: {[key: string]: EntityMetadata};
    tests?: Array<TestDefinition>;
    settings?: Settings;
}