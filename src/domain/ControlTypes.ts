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
}

export interface ContainerControl extends BaseControl {
    type: "tab" | "section";
}

export type EntityControl = StandardControl | ContainerControl;