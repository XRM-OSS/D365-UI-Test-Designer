import * as React from "react";
import { Button, Form, Nav, Navbar, Table } from "react-bootstrap";
import { popUpState } from "../domain/popUpState";
import { communicationMessage, communicationRequest, communicationResponse } from "../domain/communication";

export interface captureViewProps {
    state: popUpState;
    addRow: (data: any) => void;
}

export const CaptureView: React.FC<captureViewProps> = ({state, addRow}) => {
    return (
        <Table responsive="sm">
            <thead>
                <tr>
                    <th>Event</th>
                    <th>Attribute Name</th>
                    <th>Value</th>
                    <th>Assertions <Button onClick={() => addRow({ event: "assertion", name: "name" })}>+</Button></th>
                </tr>
            </thead>
            <tbody>
                {
                    state.captures?.map(c => c.event === "setValue"
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
                                        {state.attributes.map(a => <option>{a}</option>)}
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