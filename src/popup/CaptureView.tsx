import * as React from "react";
import { TestDefinition, TestSuite } from "../domain/TestSuite";
import { TestView } from "./TestView";
import { IStackTokens, Stack } from "@fluentui/react/lib/Stack";
import { PageState } from "../domain/PageState";

export interface CaptureViewProps {
    suite: TestSuite;
    pageState: PageState
    updateTest: (position: number, test: TestDefinition) => void;
    moveTestUp: (position: number) => void;
    moveTestDown: (position: number) => void;
}

export const CaptureView: React.FC<CaptureViewProps> = ({pageState, suite, updateTest, moveTestUp, moveTestDown }) => {
    const sectionStackTokens: IStackTokens = { childrenGap: 20, maxWidth: "100%" };

    return (
        <Stack tokens={sectionStackTokens}>
            { suite.tests?.filter(t => !!t).map((t, i) => 
                <Stack.Item key={`test_${i}`}>
                    <TestView position={i} formState={pageState.formState} updateTest={updateTest} moveTestUp={moveTestUp} moveTestDown={moveTestDown} test={t} />
                </Stack.Item>
            ) }
        </Stack>
    );
};