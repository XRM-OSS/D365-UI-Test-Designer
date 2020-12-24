import * as React from "react";
import { Button, Form, Nav, Navbar, Table } from "react-bootstrap";
import { TestDefinition, TestSuite } from "../domain/TestSuite";
import { CommunicationMessage, CommunicationRequest, CommunicationResponse } from "../domain/Communication";
import { CaptureView } from "./CaptureView";
import { ExportView } from "./ExportView";
import { getStoredState, setStoredState } from "../domain/Storage";

const sendMessage = (payload: CommunicationRequest, cb?: (r: any) => void) => {
    chrome.runtime.sendMessage(payload, cb);
};

export const PopUp: React.FC<any> = () => {
    const [state, setState] = React.useState({} as TestSuite);
    const [activeTab, setActiveTab] = React.useState("#capture");

    const refreshState = async () => {
        const newState = await getStoredState();
        setState(newState);
    };

    const persistState = async (state: TestSuite) => {
        await setStoredState(state);
        setState(state);
    };

    React.useEffect(() => {
        if (!state.attributes) {
            sendMessage({ recipient: "page", operation: "getAttributes" });
        }

        chrome.runtime.onMessage.addListener((response: TestSuite, sender) => {
            setState(response);
        });

        refreshState();        
    }, []);

    const toggleRecording = () => {
        sendMessage({ recipient: "page", operation: state.recordingToTest ? "stopRecording" : "startRecording" });
    };

    const updateTest = (position: number, test: TestDefinition) => {
        const newTests = [...state.tests];
        newTests.splice(position, 1, test);

        persistState({...state, tests: newTests});
    }

    const addTest = () => {
        persistState({...state, tests: (state.tests ?? []).concat([{ name: `Test ${(state.tests?.length ?? 0) + 1}` }])});
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
                        <Button onClick={addTest}>{ "Add Test" }</Button>
                        <Button style={{marginLeft: "5px"}} onClick={toggleRecording} variant={state.recordingToTest ? "success" : "danger"}>{ state.recordingToTest ? "Stop Recording" : "Start Recording" }</Button>
                    </Form>
                </Navbar.Collapse>
            </Navbar>
            { activeTab === "#capture" && 
                <div style={{overflow: "auto"}}>
                    { state.tests?.map((t, i) => <CaptureView key={`test_${i}`} position={i} attributes={state.attributes} controls={state.controls} updateTest={updateTest} test={t} />) }
                </div>
            }
            { activeTab === "#export" && <ExportView state={state}></ExportView> }
        </div>
    );
}