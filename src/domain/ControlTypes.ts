export type ControlTypes = "control" | "tab" | "section";

export interface BaseControl {
    type: ControlTypes;
    controlName: string;
    label: string;
}

export interface StandardControl extends BaseControl {
    type: "control";
    controlType?: string;
    logicalName?: string;
    attributeType?: Xrm.Attributes.AttributeType;
    options?: Array<Xrm.OptionSetValue>;
}

export interface TabControl extends BaseControl {
    type: "tab";
}

export interface SectionControl extends BaseControl {
    type: "section";
    tabName: string;
}

export type EntityControl = StandardControl | TabControl | SectionControl;