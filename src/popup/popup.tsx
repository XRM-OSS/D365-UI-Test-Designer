import * as React from "react";
import { Button, Form, Nav, Navbar } from "react-bootstrap";
import { popUpState } from "../domain/popUpState";
import { communicationMessage, communicationRequest, communicationResponse } from "../domain/communication";

const sendMessage = (payload: communicationRequest, cb?: (r: any) => void) => {
    chrome.runtime.sendMessage(payload, cb);
};

export const PopUp: React.FC<any> = () => {
    const [data, setData] = React.useState({ captures: [] } as popUpState);

    const updateState = () => {
        sendMessage({ recipient: "background", operation: "getState" }, (response) => {
            setData(response);
        });
    };

    React.useEffect(() => {
        chrome.runtime.onMessage.addListener((response: communicationResponse, sender) => {
            updateState();
        });

        updateState();        
    }, []);

    const toggleRecording = () => {
        sendMessage({ recipient: "page", operation: data.isRecording ? "stopRecording" : "startRecording" });
    };

    return (
        <div style={{width: "800px", height: "600px"}}>
            <Navbar bg="dark" variant="dark">
                <Navbar.Brand href="#">
                    D365-UI-Test Designer
                </Navbar.Brand>
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="mr-auto">
                        <Nav.Link href="#capture">Capture</Nav.Link>
                        <Nav.Link href="#export">Export</Nav.Link>
                        <Nav.Link href="#utility">Utility</Nav.Link>
                    </Nav>
                    <Form inline>
                        <Button variant={data.isRecording ? "success" : "danger"}>{ data.isRecording ? "Stop Recording" : "Start Recording" }</Button>
                    </Form>
                </Navbar.Collapse>
            </Navbar>
            <Button onClick={() => sendMessage({ recipient: "page", operation: "getAttributes" })}>
                Contact backend
            </Button>
            {data.captures.map(d => <div>{JSON.stringify(d)}</div>)}
        </div>
    );
}