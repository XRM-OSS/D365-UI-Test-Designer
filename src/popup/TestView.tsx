import * as React from "react";
import { PreTestNavigation, TestCapture, TestDefinition } from "../domain/TestSuite";
import { CommunicationMessage, CommunicationRequest, CommunicationResponse } from "../domain/Communication";
import { DefaultButton, IconButton } from "@fluentui/react/lib/Button";
import { Dropdown, DropdownMenuItemType, IDropdownOption } from "@fluentui/react/lib/Dropdown";
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
            actions: (test.actions ?? []).concat([{ event: "assertion", name: "name" }])};
        updateTest(test.id, update);
    };
    const sortedElements = (formState?.pageElements ?? []).sort((a, b) => a.label.localeCompare(b.label));
    
    const options: IDropdownOption[] = [
        { key: 'attributesHeader', text: 'Attribute Controls', itemType: DropdownMenuItemType.Header },
        ...sortedElements.filter(a => !!a.attributeType).map(a => ({ key: a.controlName, text: a.label })),
        { key: 'attributesHeader', text: 'Subgrid Controls', itemType: DropdownMenuItemType.Header },
        ...sortedElements.filter(a => a.controlType === "subgrid").map(a => ({ key: a.controlName, text: a.label }))
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

    const getActivityDescription = (action: TestCapture) => {
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
                        { text: "None", key: "none" },
                        { text: "New Record", key: "new" },
                        { text: "Existing Record", key: "existing" },
                    ]}
                />
                { test.preTestNavigation && test.preTestNavigation.recordId && <Text>{test.preTestNavigation.recordId}</Text>}
            </Card.Section>
            <Card.Section tokens={cardSectionTokens}>
                <Text>Actions <IconButton aria-label="Add Assertion" label="Add Assertion" iconProps={{iconName: "AddTo"}} onClick={addAssertion} /></Text>
                { test.actions?.map((c, i) => 
                    <div style={{display: "flex", flexDirection: "row"}}>
                        { c.event !== "assertion"
                            ? <ActivityItem key={`${test.id}_${i}`} isCompact={true} activityDescription={getActivityDescription(c)} activityIcon={<Icon iconName="UserEvent" />} />
                            : <>
                                <Dropdown
                                    placeholder="Assertion target"
                                    onChange={(val: any) => {}}
                                    options={options}
                                />
                                <Checkbox label="Assert value" />
                                <Dropdown
                                    label="Assert visibility"
                                    selectedKey={"noop"}
                                    onChange={(val: any) => {}}
                                    options={[
                                        { text: "No-Op", key: "noop" },
                                        { text: "Visible", key: "visible" },
                                        { text: "Hidden", key: "hidden" },
                                    ]}
                                />
                                <Dropdown
                                    label="Assert disabled state"
                                    selectedKey={"noop"}
                                    onChange={(val: any) => {}}
                                    options={[
                                        { text: "No-Op", key: "noop" },
                                        { text: "Disabled", key: "disabled" },
                                        { text: "Enabled", key: "enabled" },
                                    ]}
                                />
                                <Dropdown
                                    label="Assert field level"
                                    selectedKey={"noop"}
                                    onChange={(val: any) => {}}
                                    options={[
                                        { text: "No-Op", key: "noop" },
                                        { text: "None", key: "none" },
                                        { text: "Recommended", key: "recommended" },
                                        { text: "Required", key: "required" },
                                    ]}
                                />
                            </>
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