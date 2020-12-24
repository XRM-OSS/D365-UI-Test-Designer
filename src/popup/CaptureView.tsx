import * as React from "react";
import { Button, Form, Nav, Navbar, Table } from "react-bootstrap";
import { TestDefinition } from "../domain/TestSuite";
import { CommunicationMessage, CommunicationRequest, CommunicationResponse } from "../domain/Communication";

export interface CaptureViewProps {
    test: TestDefinition;
    attributes: Array<string>;
    position: number;
    controls: Array<string>;
    updateTest: (position: number, test: TestDefinition) => void;
}

export const CaptureView: React.FC<CaptureViewProps> = ({test, position, attributes, controls, updateTest}) => {
    const addAssertion = () => updateTest(position, {...test, captures: (test.captures ?? []).concat([{ event: "assertion", name: "name" }])});
    
    return (
        <Table responsive="sm">
            <thead>
                <tr>
                    <th>Event</th>
                    <th>Attribute Name</th>
                    <th>Value</th>
                    <th>Assertions <Button onClick={addAssertion}>+</Button></th>
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
                                <Form.Group controlId="exampleForm.ControlSelect1">
                                    <Form.Label>Select assertion field</Form.Label>
                                    <Form.Control as="select">
                                        {attributes?.map(a => <option>{a}</option>)}
                                    </Form.Control>
                                </Form.Group>
                            </td>
                            <td>
                                <Form.Group controlId="formBasicCheckbox">
                                    <Form.Check type="checkbox" label="Assert current value" />
                                </Form.Group>
                            </td>
                            <td>
                                <Form.Group controlId="formBasicCheckbox">
                                    <Form.Check type="checkbox" label="Assert current visibility state" />
                                </Form.Group>
                                <Form.Group controlId="formBasicCheckbox">
                                    <Form.Check type="checkbox" label="Assert current readonly state" />
                                </Form.Group>
                            </td>
                        </tr>
                    )
                }
            </tbody>
        </Table>
    );
}