import * as React from "react";
import { ErrorBoundary } from "./ErrorBoundary";
import { PopUp } from "./Popup";

export const App: React.FC<any> = () => {
    return (
        <div style={{width: "760px", height: "600px"}}>
            <ErrorBoundary>
                <PopUp />
            </ErrorBoundary>
        </div>
    );
}