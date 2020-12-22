import * as React from "react";
import { Button, Form, Nav, Navbar, Table } from "react-bootstrap";
import { popUpState } from "../domain/popUpState";
import { communicationMessage, communicationRequest, communicationResponse } from "../domain/communication";
import { CaptureView } from "./CaptureView";
import { ExportView } from "./ExportView";
import { getState } from "../domain/storage";

const sendMessage = (payload: communicationRequest, cb?: (r: any) => void) => {
    chrome.runtime.sendMessage(payload, cb);
};

export const PopUp: React.FC<any> = () => {
    const [state, setState] = React.useState({ captures: [] } as popUpState);
    const [activeTab, setActiveTab] = React.useState("#capture");

    const updateState = async () => {
        const newState = await getState();
        setState(newState);
    };

    React.useEffect(() => {
        if (!state.attributes) {
            sendMessage({ recipient: "page", operation: "getAttributes" });
        }

        chrome.runtime.onMessage.addListener((response: popUpState, sender) => {
            setState(response);
        });

        updateState();        
    }, []);

    const toggleRecording = () => {
        sendMessage({ recipient: "page", operation: state.isRecording ? "stopRecording" : "startRecording" });
    };

    const addRow = (newRow: any) => {
        setState({...state, captures: [...state.captures, newRow]});
    }

    return (
        <div style={{width: "800px", height: "600px"}}>
            <Navbar bg="dark" variant="dark">
                <Navbar.Brand href="#">
                    D365-UI-Test Designer
                </Navbar.Brand>
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav defaultActiveKey="#capture" className="mr-auto">
                        <Nav.Link onClick={() => setActiveTab("#capture")} href="#capture">Capture</Nav.Link>
                        <Nav.Link onClick={() => setActiveTab("#export")} href="#export">Export</Nav.Link>
                        <Nav.Link onClick={() => setActiveTab("#utility")} href="#utility">Utility</Nav.Link>
                    </Nav>
                    <Form inline>
                        <Button onClick={toggleRecording} variant={state.isRecording ? "success" : "danger"}>{ state.isRecording ? "Stop Recording" : "Start Recording" }</Button>
                    </Form>
                </Navbar.Collapse>
            </Navbar>
            { activeTab === "#capture" && <CaptureView addRow={addRow} state={state}></CaptureView> }
            { activeTab === "#export" && <ExportView state={state}></ExportView> }
        </div>
    );
}