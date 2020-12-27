import * as React from "react";
import { AssertionDefinition, PreTestNavigation, TestAction, TestAssertion, TestDefinition, TestTimeout } from "../domain/TestSuite";
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

export interface TestViewProps {
    test: TestDefinition;
    formState: FormState;
    updateTest: (id: string, test: TestDefinition) => void;
    moveTestUp: (id: string) => void;
    moveTestDown: (id: string) => void;
}

export const TestView: React.FC<TestViewProps> = ({test, formState, updateTest, moveTestUp, moveTestDown}) => {
    const addAssertion = () => {
        const update: TestDefinition = {
            ...test,
            actions: (test.actions ?? []).concat([{ event: "assertion", assertions: {} }])};
        updateTest(test.id, update);
    };

    const addTimeout = () => {
        const update: TestDefinition = {
            ...test,
            actions: (test.actions ?? []).concat([{ event: "timeout", duration: 2000 }])};
        updateTest(test.id, update);
    };
    
    const sortedElements = (formState?.pageElements ?? []).sort((a, b) => a.label.localeCompare(b.label));
    const sortedTabs = (formState?.tabs ?? []).sort((a, b) => (a.label ?? a.name).localeCompare((b.label ?? b.name)));
    const sortedSections = (formState?.sections ?? []).sort((a, b) => (a.label ?? a.name).localeCompare((b.label ?? b.name)));

    const options: IDropdownOption[] = [
        { key: 'attributesHeader', text: 'Attribute Controls', itemType: DropdownMenuItemType.Header },
        ...sortedElements.filter(a => !!a.attributeType).map(a => ({ id: a.controlName, key: a.controlName, text: a.label })),
        { key: 'subgridsHeader', text: 'Subgrid Controls', itemType: DropdownMenuItemType.Header },
        ...sortedElements.filter(a => a.controlType === "subgrid").map(a => ({ id: a.controlName, key: a.controlName, text: a.label })),
        { key: 'tabsHeader', text: 'Tabs', itemType: DropdownMenuItemType.Header },
        ...sortedTabs.map(a => ({ id: a.name, key: a.name, text: a.label ?? a.name })),
        { key: 'sectionsHeader', text: 'Sections', itemType: DropdownMenuItemType.Header },
        ...sortedSections.map(a => ({ id: a.name, key: a.name, text: a.label ?? a.name }))
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

    const onUpdateAssertionName = (index: number, option: IDropdownOption) => {
        const action = test.actions[index] as TestAssertion;
        action.name = option.id;

        const element = formState.pageElements.find(e => e.controlName === option.id)
            ?? formState.tabs.find(t => t.name === option.id)
            ?? formState.sections.find(s => s.name === option.id);

        action.attributeType = (element as any).attributeType;
        action.attributeName = (element as any).logicalName;

        action.assertions = {
            expectedDisableState: { type: (element as any).disabled ? "disabled" : "enabled" },
            expectedFieldLevel: { type: (element as any).requiredLevel ?? "noop" },
            expectedValue: { type: "value", value: (element as any).value },
            expectedVisibility: { type: element.visible ? "visible" : "hidden" }
        } as AssertionDefinition;

        updateTest(test.id, test);
    }

    const onUpdateAssertionValue = (index: number, option: IDropdownOption) => {
        const action = test.actions[index] as TestAssertion;
        action.assertions.expectedValue = {...(action.assertions.expectedValue ?? { type: "noop" }), type: option.id as any };

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

    const renderAssertionLabel = (props: IDropdownProps, prefix: JSX.Element): JSX.Element => {
        return (
            <div style={{display: "flex", flexDirection: "row", width: "100%"}}>
                {prefix}
                <Label>{props.label}</Label>
            </div>
        );
      };

    const cardTokens: ICardTokens = {
        childrenGap: "10px",
        maxWidth: "100%"
    };
    const cardSectionTokens: ICardSectionTokens = {
        childrenGap: cardTokens.childrenGap,
        padding: "5px"
    };

    const onInitializationActionChange = (event: React.FormEvent<HTMLDivElement>, item: IDropdownOption): void => {
        let preTestNavigation: PreTestNavigation = undefined;

        if (item.key === "new") {
            preTestNavigation = {
                entity: formState?.entity
            };
        }
        else if (item.key === "existing") {
            preTestNavigation = {
                entity: formState?.entity,
                recordId: formState?.recordId
            };
        }

        updateTest(test.id, {...test, preTestNavigation: preTestNavigation });
    };

    const classNames = mergeStyleSets({
        eventText: {
          fontWeight: 'bold',
        }
      });

    const getActivityDescription = (action: TestAction) => {
        switch (action.event) {
            case "setValue":
                return [
                    <span key={1} className={classNames.eventText}>{ action.event } </span>,
                    <span key={2}>{action.name} ({action.attributeType}): {action.value}</span>
                ];
            case "save":
                return [
                    <span key={1} className={classNames.eventText}>{ action.event } </span>,
                    <span key={2}>Form save</span>
                ];
            default:
                return [
                    <span key={1} className={classNames.eventText}>
                        { action.event }
                    </span>
                ];
        }
    }

    return (
        <Card tokens={cardTokens} styles={{ root: { width: "100%" } }}>
            <Card.Item>
                <IconButton onClick={onMoveUp} iconProps={{iconName: "ChevronUp"}} />
                <IconButton onClick={onMoveDown} iconProps={{iconName: "ChevronDown"}} />
                <IconButton onClick={onDelete} iconProps={{iconName: "Delete"}} />
            </Card.Item>
            <Card.Item tokens={cardSectionTokens}>
                <TextField
                    label="Name"
                    value={test.name}
                    onChange={onChangeName}
                    required
                />
            </Card.Item>
            <Card.Section tokens={cardSectionTokens}>
                <Dropdown
                    label="Initialization Action (Navigation)"
                    selectedKey={!test.preTestNavigation ? "none" : (test.preTestNavigation.recordId ? "existing" : "new")}
                    onChange={onInitializationActionChange}
                    options={[
                        { text: "None", id: "none", key: "none" },
                        { text: "New Record", id: "new", key: "new" },
                        { text: "Existing Record", id: "existing", key: "existing" },
                    ]}
                />
                { test.preTestNavigation && test.preTestNavigation.recordId && <Text>{test.preTestNavigation.recordId}</Text>}
            </Card.Section>
            <Card.Section tokens={cardSectionTokens}>
                <Text>Actions <IconButton aria-label="Add Assertion" label="Add Assertion" iconProps={{iconName: "CheckList"}} onClick={addAssertion} /> <IconButton aria-label="Add Timeout" label="Add Timeout" iconProps={{iconName: "Timer"}} onClick={addTimeout} /></Text>
                { test.actions?.map((c, i) => 
                    <div style={{display: "flex", flexDirection: "row"}}>
                        { ["save", "setValue"].includes(c.event) && <ActivityItem key={`${test.id}_${i}`} isCompact={true} activityDescription={getActivityDescription(c)} activityIcon={<Icon iconName="UserEvent" />} /> }
                        { c.event === "timeout" && <TextField label="Timeout duration (ms)" onChange={(e, v) => onUpdateTimeoutDuration(i, v)} value={c.duration?.toString()} /> }
                        { c.event === "assertion" && 
                            <div style={{display: "flex", flexDirection: "column", width: "100%"}}>
                                <Dropdown
                                    label="Assertion target"
                                    onChange={(e, v) => onUpdateAssertionName(i, v)}
                                    selectedKey={c.name}
                                    options={options}
                                />
                                { c.name && formState?.pageElements?.some(e => e.controlName === c.name && !!e.attributeType) &&
                                    <div style={{display: "flex", flexDirection: "row", width: "100%"}}>
                                        <Dropdown
                                            label="Assert Value"
                                            onRenderLabel={(props) => renderAssertionLabel(props, <Checkbox checked={c.assertions?.expectedValue?.active} onChange={(e, v) => onUpdateValueAssertionActive(i, v)} />)}
                                            onChange={(e, v) => onUpdateAssertionValue(i, v)}
                                            selectedKey={c.assertions.expectedValue?.type ?? "noop"}
                                            options={[
                                                { text: "No-Op", id: "noop", key: "noop" },
                                                { text: "Not null", id: "notnull", key: "notnull" },
                                                { text: "Null", id: "null", key: "null" },
                                                { text: "Exact Value", id: "value", key: "value" },
                                            ]}
                                        />
                                        { c.assertions.expectedValue?.type === "value" && <TextField styles={{ root: { width: "100%", marginLeft: "5px"}}} label="Value" disabled value={c.assertions.expectedValue?.value} /> }
                                    </div>
                                }
                                { c.name && <Dropdown
                                    label="Assert visibility"
                                    onRenderLabel={(props) => renderAssertionLabel(props, <Checkbox checked={c.assertions?.expectedVisibility?.active} onChange={(e, v) => onUpdateVisibilityAssertionActive(i, v)} />)}
                                    selectedKey={c.assertions.expectedVisibility?.type ?? "noop"}
                                    onChange={(e, v) => onUpdateVisibilityAssertion(i, v)}
                                    options={[
                                        { text: "No-Op", id: "noop", key: "noop" },
                                        { text: "Visible", id: "visible", key: "visible" },
                                        { text: "Hidden", id: "hidden", key: "hidden" }
                                    ]}
                                /> }
                                { c.name && formState?.pageElements?.some(e => e.controlName === c.name && !!e.attributeType) && <Dropdown
                                    label="Assert disable state"
                                    onRenderLabel={(props) => renderAssertionLabel(props, <Checkbox checked={c.assertions?.expectedDisableState?.active} onChange={(e, v) => onUpdateDisableStateAssertionActive(i, v)} />)}
                                    selectedKey={c.assertions.expectedDisableState?.type ?? "noop"}
                                    onChange={(e, v) => onUpdateDisableStateAssertion(i, v)}
                                    options={[
                                        { text: "No-Op", id: "noop", key: "noop" },
                                        { text: "Disabled", id: "disabled", key: "disabled" },
                                        { text: "Enabled", id: "enabled", key: "enabled" },
                                    ]}
                                /> }
                                { c.name && formState?.pageElements?.some(e => e.controlName === c.name && !!e.attributeType) && <Dropdown
                                    label="Assert field level"
                                    onRenderLabel={(props) => renderAssertionLabel(props, <Checkbox checked={c.assertions?.expectedFieldLevel?.active} onChange={(e, v) => onUpdateFieldLevelAssertionActive(i, v)} />)}
                                    selectedKey={c.assertions.expectedFieldLevel?.type ?? "noop"}
                                    onChange={(e, v) => onUpdateFieldLevelAssertion(i, v)}
                                    options={[
                                        { text: "No-Op", id: "noop", key: "noop" },
                                        { text: "None", id: "none", key: "none" },
                                        { text: "Recommended", id: "recommended", key: "recommended" },
                                        { text: "Required", id: "required", key: "required" },
                                    ]}
                                /> }
                                {/*
                                <Dropdown
                                    label="Assert visible options"
                                    onRenderLabel={(props) => renderAssertionLabel(props, <Checkbox checked={c.assertions?.expectedOptions?.active} onChange={(e, v) => onUpdateOptionsAssertionActive(i, v)} />)}
                                    selectedKeys={["noop"]}
                                    onChange={(e, v) => onUpdateOptionsAssertion(i, v)}
                                    options={[
                                        { text: "No-Op", id: "noop", key: "noop" },
                                        { text: "Matches", id: "matches", key: "matches" }
                                    ]}
                                />*/}
                                <hr />
                            </div>
                        }
                        <IconButton onClick={() => onMoveActionUp(i)} iconProps={{iconName: "ChevronUp"}} />
                        <IconButton onClick={() => onMoveActionDown(i)} iconProps={{iconName: "ChevronDown"}} />
                        <IconButton onClick={() => onDeleteAction(i)} iconProps={{iconName: "Delete"}} />
                    </div>
                )}
            </Card.Section>
        </Card>
    );
}