import * as React from "react";
import { ControlState, TestDefinition } from "../domain/TestSuite";
import { CommunicationMessage, CommunicationRequest, CommunicationResponse } from "../domain/Communication";
import { DefaultButton } from "@fluentui/react/lib/Button";
import { Dropdown, DropdownMenuItemType, IDropdownOption } from "@fluentui/react/lib/Dropdown";
import { Checkbox } from "@fluentui/react/lib/Checkbox";

export interface CaptureViewProps {
    test: TestDefinition;
    position: number;
    controls: Array<ControlState>;
    updateTest: (position: number, test: TestDefinition) => void;
}

export const CaptureView: React.FC<CaptureViewProps> = ({test, position, controls, updateTest}) => {
    const addAssertion = () => updateTest(position, {...test, captures: (test.captures ?? []).concat([{ event: "assertion", name: "name" }])});
    
    const options: IDropdownOption[] = [
        { key: 'attributesHeader', text: 'Attributes', itemType: DropdownMenuItemType.Header },
        ...(controls ?? []).map(a => ({ key: a.controlName, text: a.label }))
      ];

    return (
        <table>
            <thead>
                <tr>
                    <th>Event</th>
                    <th>Attribute Name</th>
                    <th>Value</th>
                    <th>Assertions <DefaultButton onClick={addAssertion}>+</DefaultButton></th>
                </tr>
            </thead>
            <tbody>
                {
                    test.captures?.map(c => c.event === "setValue"
                        ? <tr>
                            <td>{c.event}</td>
                            <td>{c.name}</td>
                            <td>{c.value}</td>
                        </tr>
                        : <tr>
                            <td>{c.event}</td>
                            <td>
                                <Dropdown
                                    placeholder="Select assertion target"
                                    label="Assertion Target"
                                    options={options}
                                />
                            </td>
                            <td>
                                <Checkbox label="Assert current value" />
                            </td>
                            <td>
                                <Checkbox label="Assert current visibility state" />
                                <Checkbox label="Assert current lock state" />
                                <Checkbox label="Assert current field level" />
                            </td>
                        </tr>
                    )
                }
            </tbody>
        </table>
    );
}