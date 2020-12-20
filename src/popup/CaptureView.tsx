import * as React from "react";
import { Button, Form, Nav, Navbar, Table } from "react-bootstrap";
import { popUpState } from "../domain/popUpState";
import { communicationMessage, communicationRequest, communicationResponse } from "../domain/communication";

export interface captureViewProps {
    state: popUpState
}

export const CaptureView: React.FC<captureViewProps> = ({state}) => {
    return (
        <Table responsive="sm">
            <thead>
                <tr>
                    <th>Event</th>
                    <th>Attribute Name</th>
                    <th>Value</th>
                    <th>Assertions</th>
                </tr>
            </thead>
            <tbody>
                {
                    state.captures?.map(c =>
                        <tr>
                            <td>{c.event}</td>
                            <td>{c.name}</td>
                            <td>{c.value}</td>
                        </tr>
                    )
                }
            </tbody>
        </Table>
    );
}