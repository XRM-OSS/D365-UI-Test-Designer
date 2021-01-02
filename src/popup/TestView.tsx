import * as React from "react";
import { AssertionDefinition, ExistingRecordNavigation, FormAction, PreTestNavigation, TestAction, TestAssertion, TestDefinition, TestSuite, TestTimeout } from "../domain/TestSuite";
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
import { Label } from "@fluentui/react/lib/Label";
import { StandardControl } from "../domain/ControlTypes";
import { ActionDropdown } from "./ActionDropdown";

export interface TestViewProps {
    previousTest: TestDefinition;
    test: TestDefinition;
    position: number;
    formState: FormState;
    suite: TestSuite;
    updateTest: (id: string, test: TestDefinition) => void;
    moveTestUp: (id: string) => void;
    moveTestDown: (id: string) => void;
}

export const TestView: React.FC<TestViewProps> = ({position, test, previousTest, suite, formState, updateTest, moveTestUp, moveTestDown}) => {
    const addAssertion = () => {
        const update: TestDefinition = {
            ...test,
            actions: (test.actions ?? []).concat([{ event: "assertion", assertions: {} }])};
        updateTest(test.id, update);
    };

    const addAction = () => {
        const update: TestDefinition = {
            ...test,
            actions: (test.actions ?? []).concat([{ event: "setValue", name: "", logicalName: "" }])};
        updateTest(test.id, update);
    };

    const addTimeout = () => {
        const update: TestDefinition = {
            ...test,
            actions: (test.actions ?? []).concat([{ event: "timeout", type: "duration", duration: 2000 }])};
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

    const onChangeName = React.useCallback(
        (event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string) => {
          updateTest(test.id, {...test, name: newValue });
        },
        [test]
    );

    const onDelete = React.useCallback(() => {
          updateTest(test.id, undefined);
        },
        [test]
    );

    const onMoveUp = React.useCallback(() => {
            moveTestUp(test.id);
        },
        [test]
    );

    const onMoveDown = React.useCallback(() => {
            moveTestDown(test.id);
        },
        [test]
    );

    const onMoveActionUp = React.useCallback((index: number) => {
            if (index === 0) {
                return;
            }

            const destinationIndex = index - 1;
            swapPositions(test.actions, index, destinationIndex);

            updateTest(test.id, test);
        },
        [test, test.actions]
    );

    const onMoveActionDown = React.useCallback((index: number) => {
            if (index === test.actions.length - 1) {
                return;
            }

            const destinationIndex = index + 1;
            swapPositions(test.actions, index, destinationIndex);

            updateTest(test.id, test);
        },
        [test, test.actions]
    );

    const onDeleteAction = React.useCallback((index: number) => {
            test.actions.splice(index, 1);

            updateTest(test.id, test);
        },
        [test, test.actions]
    );

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
        const action = test.actions[index] as TestAssertion;
        action.name = option.id;

        const control = suite?.metadata[test.entityLogicalName]?.controls?.find(c => c.controlName === option.id);

        action.attributeType = control?.type === "control" ? control?.attributeType : undefined;
        action.attributeName = control?.type === "control" ? control?.logicalName : undefined;

        const element = formState?.controlStates?.find(e => e.controlName === option.id);

        action.assertions = {
            expectedDisableState: { type: element?.disabled ? "disabled" : "enabled" },
            expectedFieldLevel: { type: element?.requiredLevel ?? "noop" },
            expectedValue: { type: "value", value: element?.value },
            expectedVisibility: { type: element?.visible ? "visible" : "hidden" }
        } as AssertionDefinition;

        updateTest(test.id, test);
    }

    const onUpdateAssertionExpectedValue = (index: number, option: IDropdownOption) => {
        const action = test.actions[index] as TestAssertion;
        action.assertions.expectedValue = {...(action.assertions.expectedValue ?? { type: "noop" }), type: option.id as any };

        updateTest(test.id, test);
    }

    const onUpdateAssertionValue = (index: number, value: any) => {
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

    const onUpdateTimeoutDuration = (index: number, value: string) => {
        const action = test.actions[index] as TestTimeout;
        action.duration = parseInt(value);

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
            const control = suite.metadata[previousTest.entityLogicalName]?.controls?.find(c => c.controlName === item.id && c.type === "control") as StandardControl;

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
                        <TextField styles={{ root: { flex: "1", marginLeft: "5px"}}} onChange={(e, v) => onUpdateActionValue(i, v)} value={action.value ?? ""} />
                        { buttons }
                    </div>
                ];
            case "assertion":
                return [
                    <div key={1} style={{display: "flex", flexDirection: "row", paddingBottom: "5px", paddingTop: "5px"}}>
                        <Text styles={{root: { paddingTop: "5px"}}} className={classNames.eventText}>{action.event}</Text>
                        <Dropdown
                            onChange={(e, v) => onUpdateAssertionName(i, v)}
                            selectedKey={action.name}
                            styles={{root: { flex: "1", marginLeft: "5px", width: "200px" }}}
                            options={options}
                        />
                        { buttons }
                    </div>,
                    <div key={2} style={{display: "flex", flexDirection: "column", paddingBottom: "5px", paddingTop: "5px", width: "100%"}}>
                        { action.name && suite?.metadata[test.entityLogicalName]?.controls?.some(e => e.controlName === action.name && e.type === "control" && !!e.attributeType) &&
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
                                { action.assertions.expectedValue?.type === "value" && <TextField styles={{ root: { flex: "1", width: "100%", paddingLeft: "5px", paddingTop: "5px"}}} onChange={(e, v) => onUpdateAssertionValue(i, v)} value={action.assertions.expectedValue?.value ?? ""} /> }
                            </ActionDropdown>
                        }
                        { action.name &&
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
                        { action.name && suite?.metadata[test.entityLogicalName]?.controls?.some(e => e.controlName === action.name && e.type === "control" && !!e.attributeType) &&
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
                        { action.name && suite?.metadata[test.entityLogicalName]?.controls?.some(e => e.controlName === action.name && e.type === "control" && !!e.attributeType) &&
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
            case "timeout":
                return [
                    <div key={1} style={{display: "flex", flexDirection: "row", paddingBottom: "5px", paddingTop: "5px"}}>
                        <Text styles={{root: { paddingTop: "5px"}}} className={classNames.eventText}>{action.event}</Text>
                        <Text styles={{root: { paddingTop: "5px", paddingLeft: "5px"}}}>Timeout duration (ms)</Text>
                        <TextField styles={{root: { marginLeft: "5px", flex: "1"}}} onChange={(e, v) => onUpdateTimeoutDuration(i, v)} value={action.duration?.toString()} />
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
                        <IconButton onClick={onMoveUp} iconProps={{iconName: "ChevronUp"}} />
                        <IconButton onClick={onMoveDown} iconProps={{iconName: "ChevronDown"}} />
                        <IconButton onClick={onDelete} iconProps={{iconName: "Delete"}} />
                    </div>
                </div>
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
                <Text>Actions <IconButton aria-label="Add Action" label="Add Action" iconProps={{iconName: "UserEvent"}} onClick={addAction} /> <IconButton aria-label="Add Assertion" label="Add Assertion" iconProps={{iconName: "CheckList"}} onClick={addAssertion} /> <IconButton aria-label="Add Timeout" label="Add Timeout" iconProps={{iconName: "Timer"}} onClick={addTimeout} /></Text>
                <div style={{overflow: "auto", width: "100%", maxHeight: "250px"}}>
                    { 
                        test.actions?.map((c, i) => {
                            const buttons = (
                                <div>
                                    <IconButton onClick={() => onMoveActionUp(i)} iconProps={{iconName: "ChevronUp"}} />
                                    <IconButton onClick={() => onMoveActionDown(i)} iconProps={{iconName: "ChevronDown"}} />
                                    <IconButton onClick={() => onDeleteAction(i)} iconProps={{iconName: "Delete"}} />
                                </div>
                            );
                            
                            return (
                                <ActivityItem key={`${test.id}_${i}`} styles={{root: {borderBottom: "1px solid #7777"}}} isCompact={true} activityDescription={getActionActivityDescription(i, c, buttons)} activityIcon={<Icon iconName={c.event === "timeout" ? "Timer" : (c.event === "assertion" ? "CheckList" : "UserEvent")} />} />
                            );
                        })
                    }
                </div>
            </Card.Section>
        </Card>
    );
}