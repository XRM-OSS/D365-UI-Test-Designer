import * as React from "react";
import { TestDefinition, TestSuite } from "../domain/TestSuite";
import { TestView } from "./TestView";
import { IStackTokens, Stack } from "@fluentui/react/lib/Stack";
import { PageState } from "../domain/PageState";

export interface CaptureViewProps {
    suite: TestSuite;
    pageState: PageState
    updateTest: (position: number, test: TestDefinition) => void;
}

export const CaptureView: React.FC<CaptureViewProps> = ({pageState, suite, updateTest }) => {
    const sectionStackTokens: IStackTokens = { childrenGap: 20, maxWidth: "100%" };

    return (
        <Stack tokens={sectionStackTokens}>
            { suite.tests?.map((t, i) => 
                <Stack.Item key={`test_${i}`}>
                    <TestView position={i} formState={pageState.formState} updateTest={updateTest} test={t} />
                </Stack.Item>
            ) }
        </Stack>
    );
};