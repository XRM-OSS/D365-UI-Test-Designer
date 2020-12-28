import * as React from "react";
import { ErrorBoundary } from "./ErrorBoundary";
import { PopUp } from "./Popup";

export const App: React.FC<any> = () => {
    return (
        <ErrorBoundary>
            <PopUp />
        </ErrorBoundary>
    );
}