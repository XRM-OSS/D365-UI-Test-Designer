import * as React from "react";
import { AssertionControl, AssertionDefinition, CustomButtonAction, ExistingRecordNavigation, FormAction, PressAction, PreTestNavigation, TestAction, TestAssertion, TestDefinition, TestSuite, TypeAction, WaitAction } from "../domain/TestSuite";
import { CommunicationMessage, CommunicationRequest, CommunicationResponse } from "../domain/Communication";
import { DefaultButton, IconButton } from "@fluentui/react/lib/Button";
import { Dropdown, DropdownMenuItemType, IDropdownOption, IDropdownProps } from "@fluentui/react/lib/Dropdown";
import { Checkbox } from "@fluentui/react/lib/Checkbox";
import { Card, ICardTokens, ICardSectionStyles, ICardSectionTokens } from "@uifabric/react-cards";
import { TextField } from "@fluentui/react/lib/TextField";
import { Icon } from "@fluentui/react/lib/Icon";
import { Stack } from "@fluentui/react/lib/Stack";
import { Text } from "@fluentui/react/lib/Text";
import { FormState } from "../domain/PageState";
import { ActivityItem } from "@fluentui/react/lib/ActivityItem";
import { mergeStyleSets } from "@fluentui/react/lib/Styling";
import { swapPositions } from "../domain/SwapPositions";
import { StandardControl } from "../domain/ControlTypes";
import { ActionDropdown } from "./ActionDropdown";
import { useSuiteContext, useSuiteDispatch } from "../domain/SuiteContext";

export interface TestViewProps {
    previousTest: TestDefinition;
    test: TestDefinition;
    position: number;
    formState: FormState;
    suite: TestSuite;
    groupId: string;
}

const TestViewRender: React.FC<TestViewProps> = ({position, groupId, test, suite, previousTest, formState}) => {
    const suiteDispatch = useSuiteDispatch();

    const attributeAssertionVisible = (action: TestAction) => action.event === "assertion" && !!action.controls?.length && action.controls?.every(c => suite?.metadata[test.entityLogicalName]?.controls?.some(e => e.controlName === c.name && e.type === "control" && !!e.attributeType));
    const visibleAssertionVisible = (action: TestAction) => action.event === "assertion" && !!action.controls?.length;

    const updateTest = (id: string, data: TestDefinition) => {
        suiteDispatch({
            type: "updateTest",
            payload: {
                id,
                groupId,
                test: data
            }
        })
    };

    const moveTestUp = (id: string) => {
        suiteDispatch({
            type: "moveTestUp",
            payload: {
                id,
                groupId
            }
        });
    };

    const moveTestDown = (id: string) => {
        suiteDispatch({
            type: "moveTestDown",
            payload: {
                id,
                groupId
            }
        });
    };

    const addAssertion = () => {
        const update: TestDefinition = {
            ...test,
            actions: (test.actions ?? []).concat([{ event: "assertion", controls: [], assertions: {} }])};
        updateTest(test.id, update);
    };

    const addValueAction = () => {
        const update: TestDefinition = {
            ...test,
            actions: (test.actions ?? []).concat([{ event: "setValue", name: "", logicalName: "" }])};
        updateTest(test.id, update);
    };

    const addSaveAction = () => {
        const update: TestDefinition = {
            ...test,
            actions: (test.actions ?? []).concat([{ event: "save" }])};
        updateTest(test.id, update);
    };

    const addTypeAction = () => {
        const update: TestDefinition = {
            ...test,
            actions: (test.actions ?? []).concat([{ event: "type", selector: "", text: "" }])};
        updateTest(test.id, update);
    };

    const addPressAction = () => {
        const update: TestDefinition = {
            ...test,
            actions: (test.actions ?? []).concat([{ event: "press", selector: "", key: "" }])};
        updateTest(test.id, update);
    };

    const addActivateAction = () => {
        const update: TestDefinition = {
            ...test,
            actions: (test.actions ?? []).concat([{ event: "activate" }])};
        updateTest(test.id, update);
    };

    const addDeactivateAction = () => {
        const update: TestDefinition = {
            ...test,
            actions: (test.actions ?? []).concat([{ event: "deactivate" }])};
        updateTest(test.id, update);
    };

    const addDeleteAction = () => {
        const update: TestDefinition = {
            ...test,
            actions: (test.actions ?? []).concat([{ event: "delete" }])};
        updateTest(test.id, update);
    };

    const addCustomButtonAction = () => {
        const update: TestDefinition = {
            ...test,
            actions: (test.actions ?? []).concat([{ event: "customButton" }])};
        updateTest(test.id, update);
    };

    const addTimeout = () => {
        const update: TestDefinition = {
            ...test,
            actions: (test.actions ?? []).concat([{ event: "wait", type: "duration", duration: 2000 }])};
        updateTest(test.id, update);
    };
    
    const previousSortedElements = !previousTest ? [] : (suite?.metadata[previousTest.entityLogicalName]?.controls ?? []).sort((a, b) => a.label.localeCompare(b.label));
    const sortedElements = (suite?.metadata[test.entityLogicalName]?.controls ?? []).sort((a, b) => a.label.localeCompare(b.label));

    const options: IDropdownOption[] = [
        { key: 'attributesHeader', text: 'Attribute Controls', itemType: DropdownMenuItemType.Header },
        ...sortedElements.filter(a => a.type === "control" && !!a.attributeType).map((a: StandardControl) => ({ id: a.controlName, key: a.controlName, text: `${a.label} (${a.controlName}, ${a.logicalName}, ${a.attributeType})` })),
        { key: 'subgridsHeader', text: 'Subgrid Controls', itemType: DropdownMenuItemType.Header },
        ...sortedElements.filter(a => a.type === "control" && a.controlType === "subgrid").map(a => ({ id: a.controlName, key: a.controlName, text: `${a.label} (${a.controlName})` })),
        { key: 'tabsHeader', text: 'Tabs', itemType: DropdownMenuItemType.Header },
        ...sortedElements.filter(a => a.type === "tab").map(a => ({ id: a.controlName, key: a.controlName, text: `${a.label} (${a.controlName})` })),
        { key: 'sectionsHeader', text: 'Sections', itemType: DropdownMenuItemType.Header },
        ...sortedElements.filter(a => a.type === "section").filter(a => a.controlName || a.label).map(a => ({ id: a.controlName, key: a.controlName, text: `${a.label} (${a.controlName})` }))
      ];

    const onChangeName = (event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string) => {
        updateTest(test.id, {...test, name: newValue });
    };

    const onChangeDescription = (event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string) => {
        updateTest(test.id, {...test, description: newValue });
    };

    const onDelete = () => {
        updateTest(test.id, undefined);
    };

    const onMoveUp = () => {
        moveTestUp(test.id);
    };

    const onMoveDown = () => {
        moveTestDown(test.id);
    };

    const onMoveActionUp = (index: number) => {
        if (index === 0) {
            return;
        }

        const destinationIndex = index - 1;
        swapPositions(test.actions, index, destinationIndex);

        updateTest(test.id, test);
    };

    const onMoveActionDown = (index: number) => {
        if (index === test.actions.length - 1) {
            return;
        }

        const destinationIndex = index + 1;
        swapPositions(test.actions, index, destinationIndex);

        updateTest(test.id, test);
    };

    const onDeleteAction = (index: number) => {
        test.actions.splice(index, 1);

        updateTest(test.id, test);
    };

    const onUpdateActionName = (index: number, option: IDropdownOption) => {
        const action = test.actions[index] as FormAction;
        const control = suite?.metadata[test.entityLogicalName]?.controls?.find(c => c.type === "control" && c.controlName === option.id);

        action.name = option.id;
        action.logicalName = control.type === "control" && control.logicalName;
        action.attributeType = control.type === "control" ? control.attributeType : null;
        action.value = null;

        updateTest(test.id, test);
    }

    const onUpdateActionValue = (index: number, value: string) => {
        const action = test.actions[index] as FormAction;
        action.value = typeof(value) === "string" && value === "" ? null : value;

        updateTest(test.id, test);
    }

    const onUpdateAssertionName = (index: number, option: IDropdownOption) => {
        if (!option) {
            return;
        }

        const action = test.actions[index] as TestAssertion;

        if (option.selected) {
            const assertionControl: AssertionControl = {}
            assertionControl.name = option.id;

            const control = suite?.metadata[test.entityLogicalName]?.controls?.find(c => c.controlName === option.id);

            assertionControl.attributeType = control?.type === "control" ? control?.attributeType : undefined;
            assertionControl.attributeName = control?.type === "control" ? control?.logicalName : undefined;

            const element = formState?.controlStates?.find(e => e.controlName === option.id);

            if (Object.keys(action.assertions).length === 0) {
                action.assertions = {
                    expectedDisableState: { type: element?.disabled ? "disabled" : "enabled" },
                    expectedFieldLevel: { type: element?.requiredLevel ?? "noop" },
                    expectedValue: { type: "value", value: element?.value },
                    expectedVisibility: { type: element?.visible ? "visible" : "hidden" }
                } as AssertionDefinition;
            }

            action.controls?.push(assertionControl);
        }
        else {
            action.controls = action.controls?.filter(c => c.name !== option.id);
            
            if (!action.controls?.length) {
                action.assertions = {};
            }
        }

        if (!attributeAssertionVisible(action)) {
            if (action.assertions.expectedDisableState) {
                action.assertions.expectedDisableState.active = false;
            }

            if (action.assertions.expectedFieldLevel) {
                action.assertions.expectedFieldLevel.active = false;
            }

            if (action.assertions.expectedValue) {
                action.assertions.expectedValue.active = false;
            }
        }

        if (!visibleAssertionVisible(action)) {
            if (action.assertions.expectedVisibility) {
                action.assertions.expectedVisibility.active = false;
            }
        }

        updateTest(test.id, test);
    }

    const onUpdateAssertionExpectedValue = (index: number, option: IDropdownOption) => {
        const action = test.actions[index] as TestAssertion;
        action.assertions.expectedValue = {...(action.assertions.expectedValue ?? { type: "noop" }), type: option.id as any };

        updateTest(test.id, test);
    }

    const onUpdateAssertionValue = (index: number, value: string) => {
        const action = test.actions[index] as TestAssertion;
        action.assertions.expectedValue = {...(action.assertions.expectedValue ?? { type: "noop" }), value: typeof(value) === "string" && value === "" ? null : value };

        updateTest(test.id, test);
    }

    const onUpdateValueAssertionActive = (index: number, active: boolean) => {
        const action = test.actions[index] as TestAssertion;
        action.assertions.expectedValue = {...(action.assertions.expectedValue ?? { type: "noop" }), active };

        updateTest(test.id, test);
    }

    const onUpdateVisibilityAssertion = (index: number, option: IDropdownOption) => {
        const action = test.actions[index] as TestAssertion;
        action.assertions.expectedVisibility = {...(action.assertions.expectedVisibility ?? { type: "noop" }), type: option.id as any };

        updateTest(test.id, test);
    }

    const onUpdateVisibilityAssertionActive = (index: number, active: boolean) => {
        const action = test.actions[index] as TestAssertion;
        action.assertions.expectedVisibility = {...(action.assertions.expectedVisibility ?? { type: "noop" }), active };

        updateTest(test.id, test);
    }

    const onUpdateDisableStateAssertion = (index: number, option: IDropdownOption) => {
        const action = test.actions[index] as TestAssertion;
        action.assertions.expectedDisableState = {...(action.assertions.expectedDisableState ?? { type: "noop" }), type: option.id as any };

        updateTest(test.id, test);
    }

    const onUpdateDisableStateAssertionActive = (index: number, active: boolean) => {
        const action = test.actions[index] as TestAssertion;
        action.assertions.expectedDisableState = {...(action.assertions.expectedDisableState ?? { type: "noop" }), active };

        updateTest(test.id, test);
    }

    const onUpdateFieldLevelAssertion = (index: number, option: IDropdownOption) => {
        const action = test.actions[index] as TestAssertion;
        action.assertions.expectedFieldLevel = {...(action.assertions.expectedFieldLevel ?? { type: "noop" }), type: option.id as any };

        updateTest(test.id, test);
    }

    const onUpdateCustomButtonActionType = (index: number, option: IDropdownOption) => {
        const action = test.actions[index] as CustomButtonAction;
        action.type = option.id as any;

        updateTest(test.id, test);
    }

    const onUpdateFieldLevelAssertionActive = (index: number, active: boolean) => {
        const action = test.actions[index] as TestAssertion;
        action.assertions.expectedFieldLevel = {...(action.assertions.expectedFieldLevel ?? { type: "noop" }), active };

        updateTest(test.id, test);
    }

    const onUpdateOptionsAssertion = (index: number, option: IDropdownOption) => {
        const action = test.actions[index] as TestAssertion;
        action.assertions.expectedOptions = {...(action.assertions.expectedOptions ?? { type: "noop" }), type: option.id as any };

        updateTest(test.id, test);
    }

    const onUpdateOptionsAssertionActive = (index: number, active: boolean) => {
        const action = test.actions[index] as TestAssertion;
        action.assertions.expectedOptions = {...(action.assertions.expectedOptions ?? { type: "noop" }), active };

        updateTest(test.id, test);
    }

    const onUpdateWaitActionDuration = (index: number, value: string) => {
        const action = test.actions[index] as WaitAction;
        action.duration = parseInt(value);

        updateTest(test.id, test);
    }

    const onUpdateWaitActionType = (index: number, option: IDropdownOption) => {
        const action = test.actions[index] as WaitAction;
        action.type = option.id as any;

        updateTest(test.id, test);
    }

    const onUpdateWaitActionSelector = (index: number, value: string) => {
        const action = test.actions[index] as WaitAction;
        action.selector = value;

        updateTest(test.id, test);
    }

    const onUpdateCustomButtonValue = (index: number, value: string) => {
        const action = test.actions[index] as CustomButtonAction;
        action.value = value;

        updateTest(test.id, test);
    }

    const onUpdateTypeActionSelector = (index: number, value: string) => {
        const action = test.actions[index] as TypeAction;
        action.selector = value;

        updateTest(test.id, test);
    }

    const onUpdateTypeActionText = (index: number, value: string) => {
        const action = test.actions[index] as TypeAction;
        action.text = value;

        updateTest(test.id, test);
    }

    const onUpdatePressActionSelector = (index: number, value: string) => {
        const action = test.actions[index] as PressAction;
        action.selector = value;

        updateTest(test.id, test);
    }

    const onUpdatePressActionKey = (index: number, value: string) => {
        const action = test.actions[index] as PressAction;
        action.key = value;

        updateTest(test.id, test);
    }

    const cardTokens: ICardTokens = {
        childrenGap: "10px",
        maxWidth: "100%"
    };
    const cardSectionTokens: ICardSectionTokens = {
        childrenGap: cardTokens.childrenGap,
        padding: "5px"
    };

    const onInitializationActionLookupSelection = (event: React.FormEvent<HTMLDivElement>, item: IDropdownOption): void => {
        if (!test.preTestNavigation) {
            return;
        }

        if (test.preTestNavigation.type === "lookup" && !!previousTest) {
            test.preTestNavigation.controlName = item.id;
            const control = suite?.metadata[previousTest.entityLogicalName]?.controls?.find(c => c.controlName === item.id && c.type === "control") as StandardControl;

            test.preTestNavigation.logicalName = control?.logicalName ?? "";
        }

        updateTest(test.id, test);
    };
    
    const onInitializationActionRecordIdChange = (event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, text: string): void => {
        if (!test.preTestNavigation) {
            return;
        }

        if(test.preTestNavigation.type === "existing") {
            test.preTestNavigation.recordId = text;
        }

        updateTest(test.id, test);
    };

    const onInitializationActionSubgridPositionChange = (event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, positionString: string): void => {
        if (!test.preTestNavigation) {
            return;
        }

        const position = parseInt(positionString);

        if (test.preTestNavigation.type === "subgrid" && !isNaN(position)) {
            test.preTestNavigation.recordPosition = position;
        }

        updateTest(test.id, test);
    };

    const onInitializationActionSubgridSelection = (event: React.FormEvent<HTMLDivElement>, item: IDropdownOption): void => {
        if (!test.preTestNavigation) {
            return;
        }

        if (test.preTestNavigation.type === "subgrid") {
            test.preTestNavigation.subgridName = item.id;
        }

        updateTest(test.id, test);
    };

    const onInitializationActionChange = (event: React.FormEvent<HTMLDivElement>, item: IDropdownOption): void => {
        let preTestNavigation: PreTestNavigation = undefined;

        if (item.id === "new") {
            preTestNavigation = {
                type: "new",
                entity: formState?.entity
            };
        }
        else if (item.id === "existing") {
            preTestNavigation = {
                type: "existing",
                entity: formState?.entity,
                recordId: formState?.recordId
            };
        }
        else if (item.id === "lookup") {
            preTestNavigation = {
                type: "lookup",
                logicalName: "",
                controlName: ""
            };
        }
        else if (item.id === "subgrid") {
            preTestNavigation = {
                type: "subgrid",
                subgridName: "",
                recordPosition: 0
            };
        }
        else if (item.id === "noop") {
            preTestNavigation = undefined;
        }

        updateTest(test.id, {...test, preTestNavigation: preTestNavigation });
    };

    const classNames = mergeStyleSets({
        eventText: {
          fontWeight: 'bold',
        }
    });

    const getActivityIcon = (e: TestAction) => {
        switch (e.event) {
            case "wait":
                return "Timer";
            case "assertion":
                return "CheckList"
            case "activate":
                return "DocumentManagement";
            case "deactivate":
                return "ProtectedDocument";
            case "delete":
                return "Delete";
            case "save":
                return "Save";
            case "customButton":
                return "ButtonControl";
            case "type":
                return "KeyboardClassic";
            case "press":
                return "Fingerprint";
            default:
                return "UserEvent";
        }
    }

    const getActionActivityDescription = (i: number, action: TestAction, buttons: React.ReactNode) => {
        switch (action.event) {
            case "setValue":
                return [
                    <div key={1} style={{display: "flex", flexDirection: "row", paddingBottom: "5px", paddingTop: "5px"}}>
                        <Text styles={{root: { paddingTop: "5px"}}} className={classNames.eventText}>{action.event}</Text>
                        <Dropdown
                            styles={{root: { flex: "1", marginLeft: "5px", width: "200px" }}}
                            onChange={(e, v) => onUpdateActionName(i, v)}
                            selectedKey={action.name ?? action.logicalName}
                            options={options}
                        />
                        { action.attributeType === "optionset"
                            ? <Dropdown options={[{key: "null", id: "null", text: "null"}, ...(suite?.metadata[test.entityLogicalName]?.controls.find(c => c.type === "control" && c.controlName === action.name) as StandardControl)?.options?.map(o => ({ key: o.value.toString(), id: o.value.toString(), text: `${o.text} (${o.value})` })) ?? [ { key: action.value?.toString() ?? "null", id: action.value?.toString() ?? "null", text: action.value?.toString() ?? "null" } ].filter(option => option.id !== "null") ]} styles={{ root: { flex: "1", marginLeft: "5px"}}} onChange={(e, v) => onUpdateActionValue(i, v.id)} selectedKey={action.value?.toString() ?? "null"} />
                            : <TextField styles={{ root: { flex: "1", marginLeft: "5px"}}} onChange={(e, v) => onUpdateActionValue(i, v)} value={action.value ?? ""} /> 
                        }
                        { buttons }
                    </div>
                ];
            case "assertion":
                return [
                    <div key={1} style={{display: "flex", flexDirection: "row", paddingBottom: "5px", paddingTop: "5px"}}>
                        <Text styles={{root: { paddingTop: "5px"}}} className={classNames.eventText}>{action.event}</Text>
                        <Dropdown
                            onChange={(e, v) => onUpdateAssertionName(i, v)}
                            selectedKeys={action.controls?.map(c => c.name)}
                            styles={{root: { flex: "1", marginLeft: "5px", width: "200px" }}}
                            options={options}
                            multiSelect
                        />
                        { buttons }
                    </div>,
                    <div key={2} style={{display: "flex", flexDirection: "column", paddingBottom: "5px", paddingTop: "5px", width: "100%"}}>
                        { attributeAssertionVisible(action) &&
                            <ActionDropdown
                                checked={action.assertions?.expectedValue?.active}
                                onCheckedChange={(e, v) => onUpdateValueAssertionActive(i, v)}
                                label="Value"
                                onDropdownChange={(e, v) => onUpdateAssertionExpectedValue(i, v)}
                                dropdownSelectedKey={action.assertions.expectedValue?.type ?? "noop"}
                                options={[
                                    { text: "No-Op", id: "noop", key: "noop" },
                                    { text: "Not null", id: "notnull", key: "notnull" },
                                    { text: "Null", id: "null", key: "null" },
                                    { text: "Exact Value", id: "value", key: "value" },
                                ]}                                
                            >
                                { action.assertions.expectedValue?.type === "value" &&
                                    ( action.controls?.every(c => c.attributeType === "optionset")
                                        ? <Dropdown options={[{key: "null", id: "null", text: "null"}, ...(suite?.metadata[test.entityLogicalName]?.controls.find(c => c.type === "control" && c.attributeType === "optionset" && action.controls?.some(ctrl => ctrl.name === c.controlName)) as StandardControl)?.options?.map(o => ({ key: o.value.toString(), id: o.value.toString(), text: `${o.text} (${o.value})` })) ?? [{ id: action.assertions.expectedValue?.value?.toString() ?? "null", key: action.assertions.expectedValue?.value?.toString() ?? "null", text: action.assertions.expectedValue?.value?.toString() ?? "null" }].filter(option => option.id !== "null")]} styles={{ root: { flex: "1", paddingLeft: "5px", paddingTop: "5px"}}} onChange={(e, v) => onUpdateAssertionValue(i, v.id)} selectedKey={action.assertions.expectedValue?.value?.toString() ?? "null"} />
                                        : <TextField styles={{ root: { flex: "1", width: "100%", paddingLeft: "5px", paddingTop: "5px"}}} onChange={(e, v) => onUpdateAssertionValue(i, v)} value={action.assertions.expectedValue?.value ?? ""} />
                                    )
                                }
                            </ActionDropdown>
                        }
                        { visibleAssertionVisible(action) &&
                            <ActionDropdown
                                checked={action.assertions?.expectedVisibility?.active}
                                onCheckedChange={(e, v) => onUpdateVisibilityAssertionActive(i, v)}
                                label="Visibility"
                                onDropdownChange={(e, v) => onUpdateVisibilityAssertion(i, v)}
                                dropdownSelectedKey={action.assertions.expectedVisibility?.type ?? "noop"}
                                options={[
                                    { text: "No-Op", id: "noop", key: "noop" },
                                    { text: "Visible", id: "visible", key: "visible" },
                                    { text: "Hidden", id: "hidden", key: "hidden" }
                                ]}
                            />
                        }
                        { attributeAssertionVisible(action) &&
                            <ActionDropdown
                                checked={action.assertions?.expectedDisableState?.active}
                                onCheckedChange={(e, v) => onUpdateDisableStateAssertionActive(i, v)}
                                label="Disable state"
                                onDropdownChange={(e, v) => onUpdateDisableStateAssertion(i, v)}
                                dropdownSelectedKey={action.assertions.expectedDisableState?.type ?? "noop"}
                                options={[
                                    { text: "No-Op", id: "noop", key: "noop" },
                                    { text: "Disabled", id: "disabled", key: "disabled" },
                                    { text: "Enabled", id: "enabled", key: "enabled" },
                                ]}
                            />
                        }
                        { attributeAssertionVisible(action) &&
                            <ActionDropdown
                                checked={action.assertions?.expectedFieldLevel?.active}
                                onCheckedChange={(e, v) => onUpdateFieldLevelAssertionActive(i, v)}
                                label="Field level"
                                onDropdownChange={(e, v) => onUpdateFieldLevelAssertion(i, v)}
                                dropdownSelectedKey={action.assertions.expectedFieldLevel?.type ?? "noop"}
                                options={[
                                    { text: "No-Op", id: "noop", key: "noop" },
                                    { text: "None", id: "none", key: "none" },
                                    { text: "Recommended", id: "recommended", key: "recommended" },
                                    { text: "Required", id: "required", key: "required" },
                                ]}
                            />
                        }
                        <hr />
                    </div>
                ];
            case "save":
                return [
                    <div key={1} style={{display: "flex", flexDirection: "row", paddingBottom: "5px", paddingTop: "5px"}}>
                        <Text styles={{root: { paddingTop: "5px"}}} className={classNames.eventText}>{action.event}</Text>
                        <Text styles={{root: { flex: "1", paddingTop: "5px", paddingLeft: "5px" }}}>Form save</Text>
                        { buttons }
                    </div>
                ];
            case "wait":
                return [
                    <div key={1} style={{display: "flex", flexDirection: "row", paddingBottom: "5px", paddingTop: "5px"}}>
                        <Text styles={{root: { paddingTop: "5px"}}} className={classNames.eventText}>{action.event}</Text>
                        <Dropdown selectedKey={action.type ?? ""} placeholder="Specify wait type" onChange={(e, v) => onUpdateWaitActionType(i, v)} styles={{root: { paddingLeft: "5px", flex: "1"}}} options={[{key: "duration", id: "duration", text: "Duration"}, {key: "selector", id: "selector", text: "Selector"}, {key: "uciIdle", id: "uciIdle", text: "UCI Idle"}]} />
                        {
                            action.type === "duration" &&
                            <>
                                <Text styles={{root: { paddingTop: "5px", paddingLeft: "5px"}}}>Timeout duration (ms)</Text>
                                <TextField styles={{root: { marginLeft: "5px", flex: "1"}}} onChange={(e, v) => onUpdateWaitActionDuration(i, v)} value={action.duration?.toString() ?? ""} />
                            </>
                        }
                        {
                            action.type === "selector" &&
                            <>
                                <Text styles={{root: { paddingTop: "5px", paddingLeft: "5px"}}}>CSS Selektor</Text>
                                <TextField styles={{root: { marginLeft: "5px", flex: "1"}}} onChange={(e, v) => onUpdateWaitActionSelector(i, v)} value={action.selector?.toString() ?? ""} />
                            </>
                        }
                        { buttons }
                    </div>
                ];
            case "customButton":
                return [
                    <div key={1} style={{display: "flex", flexDirection: "row", paddingBottom: "5px", paddingTop: "5px"}}>
                        <Text styles={{root: { paddingTop: "5px"}}} className={classNames.eventText}>{action.event}</Text>
                        <Dropdown selectedKey={action.type ?? ""} placeholder="Specify button selector" onChange={(e, v) => onUpdateCustomButtonActionType(i, v)} styles={{root: { paddingLeft: "5px", flex: "1"}}} options={[{key: "byLabel", id: "byLabel", text: "By Label"}, {key: "byDataId", id: "byDataId", text: "By Data Id"}, {key: "custom", id: "custom", text: "Custom"}]} />
                        <TextField styles={{root: { marginLeft: "5px", flex: "1"}}} onChange={(e, v) => onUpdateCustomButtonValue(i, v)} value={action.value ?? ""} />
                        { buttons }
                    </div>
                ];
            case "type":
                return [
                    <div key={1} style={{display: "flex", flexDirection: "row", paddingBottom: "5px", paddingTop: "5px"}}>
                        <Text styles={{root: { paddingTop: "5px"}}} className={classNames.eventText}>{action.event}</Text>
                        <Text styles={{root: { marginLeft: "5px", paddingTop: "5px"}}}>CSS Selector</Text>
                        <TextField styles={{root: { marginLeft: "5px", flex: "1"}}} onChange={(e, v) => onUpdateTypeActionSelector(i, v)} value={action.selector ?? ""} />
                        <Text styles={{root: { marginLeft: "5px", paddingTop: "5px"}}}>Text</Text>
                        <TextField styles={{root: { marginLeft: "5px", flex: "1"}}} onChange={(e, v) => onUpdateTypeActionText(i, v)} value={action.text ?? ""} />
                        { buttons }
                    </div>
                ];
            case "press":
                    return [
                        <div key={1} style={{display: "flex", flexDirection: "row", paddingBottom: "5px", paddingTop: "5px"}}>
                            <Text styles={{root: { paddingTop: "5px"}}} className={classNames.eventText}>{action.event}</Text>
                            <Text styles={{root: { marginLeft: "5px", paddingTop: "5px"}}}>CSS Selector</Text>
                            <TextField styles={{root: { marginLeft: "5px", flex: "1"}}} onChange={(e, v) => onUpdatePressActionSelector(i, v)} value={action.selector ?? ""} />
                            <Text styles={{root: { marginLeft: "5px", paddingTop: "5px"}}}>Key</Text>
                            <TextField styles={{root: { marginLeft: "5px", flex: "1"}}} onChange={(e, v) => onUpdatePressActionKey(i, v)} value={action.key ?? ""} />
                            { buttons }
                        </div>
                    ];
            default:
                return [
                    <div key={1} style={{display: "flex", flexDirection: "row", paddingBottom: "5px", paddingTop: "5px"}}>
                        <Text styles={{root: { paddingTop: "5px"}}} className={classNames.eventText}>{(action as any).event}</Text>
                        { buttons }
                    </div>
                ];
        }
    }

    console.log(`Rerendering test ${test.id}`);

    return (
        <Card tokens={cardTokens} styles={{ root: { width: "100%" } }}>
            <Card.Item tokens={cardSectionTokens}>
                <div style={{display: "flex", flexDirection: "row"}}>
                    <TextField
                        label="Name"
                        value={test.name}
                        onChange={onChangeName}
                        required
                        styles={{root: {flex: "1"}}}
                    />
                    <div style={{paddingLeft: "5px", paddingTop: "30px"}}>
                        <IconButton title="Move this test one position up" onClick={onMoveUp} iconProps={{iconName: "ChevronUp"}} />
                        <IconButton title="Move this test one position down" onClick={onMoveDown} iconProps={{iconName: "ChevronDown"}} />
                        <IconButton title="Delete this test" onClick={onDelete} iconProps={{iconName: "Delete"}} />
                    </div>
                </div>
            </Card.Item>
            <Card.Item tokens={cardSectionTokens}>
                <TextField
                    label="Description"
                    value={test.description}
                    onChange={onChangeDescription}
                    autoAdjustHeight
                    multiline
                />
            </Card.Item>
            <Card.Section tokens={cardSectionTokens}>
                <Dropdown
                    label="Initialization Action (Navigation)"
                    selectedKey={test.preTestNavigation?.type ?? (!!position ? "noop" : "new")}
                    onChange={onInitializationActionChange}
                    options={[
                        // First test needs to have a proper navigation
                        !position ? undefined : { text: "No-Op", id: "noop", key: "noop" },
                        { text: "New Record", id: "new", key: "new" },
                        { text: "Existing Record", id: "existing", key: "existing" },
                        !previousTest ? undefined : { text: "Click lookup", id: "lookup", key: "lookup" },
                        !previousTest ? undefined : { text: "Open Subgrid Record", id: "subgrid", key: "subgrid" }
                    ].filter(e => !!e)}
                />
                { test.preTestNavigation && test.preTestNavigation.type === "lookup" &&
                    <Dropdown
                        onChange={onInitializationActionLookupSelection}
                        selectedKey={test.preTestNavigation.controlName}
                        options={!previousSortedElements ? [] : [
                            { key: 'attributesHeader', text: 'Attribute Controls', itemType: DropdownMenuItemType.Header },
                            ...previousSortedElements.filter(a => a.type === "control" && a.attributeType === "lookup").map((a: StandardControl) => ({ id: a.controlName, key: a.controlName, text: `${a.label} (${a.controlName}, ${a.logicalName}, ${a.attributeType})`}))
                        ]}
                    />
                }
                { test.preTestNavigation && test.preTestNavigation.type === "subgrid" &&
                    <div style={{display: "flex", flexDirection: "row"}}>
                        <Dropdown
                            onChange={onInitializationActionSubgridSelection}
                            selectedKey={test.preTestNavigation.subgridName}
                            styles={{root: {flex: "1"}}}
                            options={!previousSortedElements ? [] : [
                                { key: 'subgridsHeader', text: 'Subgrid Controls', itemType: DropdownMenuItemType.Header },
                                ...previousSortedElements.filter(a => a.type === "control" && a.controlType === "subgrid").map(a => ({ id: a.controlName, key: a.controlName, text: `${a.label} (${a.controlName})` }))
                            ]}
                        />
                        <Text styles={{root: { paddingTop: "5px", paddingLeft: "5px"}}} className={classNames.eventText}>Position</Text>
                        <TextField styles={{root: {paddingLeft: "5px", flex: "1"}}} placeholder="Enter record position (zero based)" value={test.preTestNavigation.recordPosition?.toString() ?? ""} onChange={onInitializationActionSubgridPositionChange} />
                    </div>
                }
                { test.preTestNavigation && test.preTestNavigation.type === "existing" && <TextField onChange={onInitializationActionRecordIdChange} value={test.preTestNavigation.recordId} />}
            </Card.Section>
            <Card.Section tokens={cardSectionTokens}>
                <div style={{display: "flex", flexDirection: "row"}}>
                    <Text styles={{root: {paddingTop: "5px"}}}>Actions</Text>
                    <div style={{paddingLeft: "5px"}}>
                        <IconButton
                            aria-label="Add Action"
                            label="Add Action"
                            iconProps={{iconName: "UserEvent"}}
                            onClick={addValueAction}
                            menuProps={{
                                items: [
                                  {
                                    key: 'setValue',
                                    text: 'Set Value',
                                    iconProps: { iconName: 'UserEvent' },
                                    onClick: addValueAction,
                                    title: "Add a new set value action"
                                  },
                                  {
                                    key: 'save',
                                    text: 'Save',
                                    iconProps: { iconName: 'Save' },
                                    onClick: addSaveAction,
                                    title: "Add a new save action"
                                  },
                                  {
                                    key: 'type',
                                    text: 'Type',
                                    iconProps: { iconName: 'KeyboardClassic' },
                                    onClick: addTypeAction,
                                    title: "Add a new type action"
                                  },
                                  {
                                    key: 'press',
                                    text: 'Press',
                                    iconProps: { iconName: 'Fingerprint' },
                                    onClick: addPressAction,
                                    title: "Add a new keyboard button press action (such as Enter)"
                                  }
                                ],
                                directionalHintFixed: true
                              }}
                            title="Add a new set value action"
                        />
                        <IconButton
                            aria-label="Click Button"
                            label="Click Button"
                            iconProps={{iconName: "ButtonControl"}}
                            onClick={addValueAction}
                            menuProps={{
                                items: [
                                  {
                                    key: 'activate',
                                    text: 'Activate',
                                    iconProps: { iconName: 'DocumentManagement' },
                                    onClick: addActivateAction,
                                    title: "Add an action for clicking the activate button"
                                  },
                                  {
                                    key: 'deactivate',
                                    text: 'Deactivate',
                                    iconProps: { iconName: 'ProtectedDocument' },
                                    onClick: addDeactivateAction,
                                    title: "Add an action for clicking the deactivate button"
                                  },
                                  {
                                    key: 'delete',
                                    text: 'Delete',
                                    iconProps: { iconName: 'Delete' },
                                    onClick: addDeleteAction,
                                    title: "Add an action for clicking the delete button"
                                  },
                                  {
                                    key: 'clickButton',
                                    text: 'Click Button',
                                    iconProps: { iconName: 'ButtonControl' },
                                    onClick: addCustomButtonAction,
                                    title: "Add an action for clicking any button"
                                  }
                                ],
                                directionalHintFixed: true
                              }}
                            title="Add a new button action"
                        />
                        <IconButton aria-label="Add Assertion" title="Add a new assertion action" label="Add Assertion" iconProps={{iconName: "CheckList"}} onClick={addAssertion} />
                        <IconButton aria-label="Add Wait Action" title="Add a new wait action" label="Add Wait Action" iconProps={{iconName: "Timer"}} onClick={addTimeout} />
                    </div>
                </div>
                <div style={{overflow: "auto", width: "100%", maxHeight: "250px"}}>
                    { 
                        test.actions?.map((c, i) => {
                            const buttons = (
                                <div>
                                    <IconButton title="Move this action one position up" onClick={() => onMoveActionUp(i)} iconProps={{iconName: "ChevronUp"}} />
                                    <IconButton title="Move this action one position down" onClick={() => onMoveActionDown(i)} iconProps={{iconName: "ChevronDown"}} />
                                    <IconButton title="Delete this action" onClick={() => onDeleteAction(i)} iconProps={{iconName: "Delete"}} />
                                </div>
                            );
                            
                            return (
                                <ActivityItem key={`${test.id}_${i}`} styles={{root: {borderBottom: "1px solid #7777"}}} isCompact={true} activityDescription={getActionActivityDescription(i, c, buttons)} activityIcon={<Icon iconName={getActivityIcon(c)} />} />
                            );
                        })
                    }
                </div>
            </Card.Section>
        </Card>
    );
}

export const TestView = React.memo(TestViewRender, (prev, next) => 
    prev.test === next.test
    && prev.previousTest?.id === next.previousTest?.id
    && prev.formState === next.formState
    && prev.suite?.metadata === next.suite?.metadata
);