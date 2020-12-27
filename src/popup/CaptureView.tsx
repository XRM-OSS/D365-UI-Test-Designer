import * as React from "react";
import { TestDefinition, TestSuite } from "../domain/TestSuite";
import { TestView } from "./TestView";
import { IStackTokens, Stack } from "@fluentui/react/lib/Stack";
import { PageState } from "../domain/PageState";

export interface CaptureViewProps {
    suite: TestSuite;
    pageState: PageState
    updateTest: (id: string, test: TestDefinition) => void;
    moveTestUp: (id: string) => void;
    moveTestDown: (id: string) => void;
}

export const CaptureView: React.FC<CaptureViewProps> = ({pageState, suite, updateTest, moveTestUp, moveTestDown }) => {
    const sectionStackTokens: IStackTokens = { childrenGap: 20, maxWidth: "100%" };

    return (
        <Stack tokens={sectionStackTokens}>
            { suite.tests?.filter(t => !!t).map((t) => 
                <Stack.Item key={`stack_${t.id}`}>
                    <TestView key={`test_${t.id}`} formState={pageState.formState} updateTest={updateTest} moveTestUp={moveTestUp} moveTestDown={moveTestDown} test={t} />
                </Stack.Item>
            ) }
        </Stack>
    );
};