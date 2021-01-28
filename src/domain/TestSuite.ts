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

export interface WaitAction {
    event: "wait";
    type: "duration" | "selector" | "uciIdle";
    duration?: number;
    selector?: string;
}

export interface CustomButtonAction {
    event: "customButton";
    type?: "byLabel" | "byDataId" | "custom";
    value?: string;
}

export interface TypeAction {
    event: "type";
    selector: string;
    text: string;
}

export interface PressAction {
    event: "press";
    selector: string;
    key: string;
}

export interface AssertionControl {
    name?: string;
    attributeName?: string;
    attributeType?: Xrm.Attributes.AttributeType;
};

export interface TestAssertion {
    event: "assertion";
    controls: Array<AssertionControl>;
    assertions: AssertionDefinition;
}

export type TestAction = FormAction | TestAssertion | WaitAction | CustomButtonAction | TypeAction | PressAction;

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

export interface TestGroup { 
    tests?: Array<TestDefinition>;
    name?: string;
    id: string;
}

export interface TestSuite {
    metadata: {[key: string]: EntityMetadata};
    groups?: Array<TestGroup>;
    settings?: Settings;
}