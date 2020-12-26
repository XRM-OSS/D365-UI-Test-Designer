import * as React from "react";
import { PreTestNavigation, TestDefinition } from "../domain/TestSuite";
import { CommunicationMessage, CommunicationRequest, CommunicationResponse } from "../domain/Communication";
import { DefaultButton, IconButton } from "@fluentui/react/lib/Button";
import { Dropdown, DropdownMenuItemType, IDropdownOption } from "@fluentui/react/lib/Dropdown";
import { Checkbox } from "@fluentui/react/lib/Checkbox";
import { Card, ICardTokens, ICardSectionStyles, ICardSectionTokens } from "@uifabric/react-cards";
import { TextField } from "@fluentui/react/lib/TextField";
import { Icon } from "@fluentui/react/lib/Icon";
import { Stack } from "@fluentui/react/lib/Stack";
import { Text } from "@fluentui/react/lib/Text";
import { FormState, PageElementState } from "../domain/PageState";

export interface TestViewProps {
    test: TestDefinition;
    position: number;
    formState: FormState;
    updateTest: (position: number, test: TestDefinition) => void;
}

export const TestView: React.FC<TestViewProps> = ({test, position, formState, updateTest}) => {
    const addAssertion = () => updateTest(position, {...test, actions: (test.actions ?? []).concat([{ event: "assertion", name: "name" }])});
    const sortedElements = (formState?.pageElements ?? []).sort((a, b) => b.label.localeCompare(a.label));
    
    const options: IDropdownOption[] = [
        { key: 'attributesHeader', text: 'Attribute Controls', itemType: DropdownMenuItemType.Header },
        ...sortedElements.filter(a => !!a.attributeType).map(a => ({ key: a.controlName, text: a.label })),
        { key: 'attributesHeader', text: 'Subgrid Controls', itemType: DropdownMenuItemType.Header },
        ...sortedElements.filter(a => a.controlType === "subgrid").map(a => ({ key: a.controlName, text: a.label }))
      ];

    const onChangeName = React.useCallback(
        (event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string) => {
          updateTest(position, {...test, name: newValue });
        },
        []
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

        updateTest(position, {...test, preTestNavigation: preTestNavigation });
    };

    return (
        <Card tokens={cardTokens} styles={{ root: { width: "100%" } }}>
            <Card.Item tokens={cardSectionTokens}>
                <TextField
                    label="Name"
                    value={test.name}
                    onChange={onChangeName}
                    required
                />
                <IconButton iconProps={{iconName: "Delete"}} />
            </Card.Item>
            <Card.Section tokens={cardSectionTokens}>
                <Text>Initialization Action</Text>
                <Dropdown
                    placeholder="Select assertion target"
                    label="Navigate To"
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
                {test.actions?.map(c => c.event === "setValue"
                        ? <tr>
                            <td>{c.event}</td>
                            <td>{c.name}</td>
                            <td>{c.value}</td>
                        </tr>
                        : <>
                            <Dropdown
                                placeholder="Select assertion target"
                                label="Assertion Target"
                                options={options}
                            />
                            <Checkbox label="Assert current value" />
                            <Checkbox label="Assert current visibility state" />
                            <Checkbox label="Assert current lock state" />
                            <Checkbox label="Assert current field level" />
                        </>)
                }
            </Card.Section>
        </Card>
    );
}