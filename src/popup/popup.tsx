import * as React from "react";
import { Button } from "react-bootstrap";
import { communicationMessage, communicationRequest, communicationResponse } from "../domain/communication";

const sendMessage = (payload: communicationRequest, cb?: (r: any) => void) => {
    chrome.runtime.sendMessage(payload, cb);
};

export const PopUp: React.FC<any> = () => {
    const [data, setData] = React.useState([]);

    React.useEffect(() => {
        chrome.runtime.onMessage.addListener((response: communicationResponse, sender, sendResponse: any) => {
            setData([...data, JSON.stringify(response)]);
        });

        sendMessage({ recipient: "background", operation: "getState" }, (response) => {
            setData([...data, JSON.stringify(response)]);
        });
    }, []);

    return (
        <div style={{width: "800px", height: "600px"}}>
            <Button onClick={() => sendMessage({ recipient: "page", operation: "getAttributes" })}>
                Contact backend
            </Button>
            {data.map(d => <div>{d}</div>)}
        </div>
    );
}