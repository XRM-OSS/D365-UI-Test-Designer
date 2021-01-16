import * as React from "react";
import { SuiteStateProvider } from "../domain/SuiteContext";
import { ErrorBoundary } from "./ErrorBoundary";
import { PopUp } from "./Popup";

export const App: React.FC<any> = () => {
    return (
        <div style={{width: "760px", height: "600px"}}>
            <ErrorBoundary>
                <SuiteStateProvider>
                    <PopUp />
                </SuiteStateProvider>
            </ErrorBoundary>
        </div>
    );
}