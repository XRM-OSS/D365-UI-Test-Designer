import * as React from "react";
import { TestDefinition, TestSuite } from "../domain/TestSuite";
import { TestView } from "./TestView";
import { IStackTokens, Stack, StackItem } from "@fluentui/react/lib/Stack";
import { PageState } from "../domain/PageState";
import { Text } from "@fluentui/react/lib/Text";
import { TextField } from "@fluentui/react/lib/TextField";
import { GlobalState } from "../domain/GlobalState";
import { IconButton } from "@fluentui/react/lib/Button";

export interface CaptureViewProps {
    suite: TestSuite;
    pageState: PageState;
    globalState: GlobalState;
    updateTest: (id: string, test: TestDefinition) => void;
    updateSuite: (suite: TestSuite) => void;
    moveTestUp: (id: string) => void;
    moveTestDown: (id: string) => void;
}

export const CaptureView: React.FC<CaptureViewProps> = ({pageState, suite, globalState, updateTest, updateSuite, moveTestUp, moveTestDown }) => {
    const sectionStackTokens: IStackTokens = { childrenGap: 10, maxWidth: "100%" };

    const onUpdateAppId = (event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string) => {
        if (!suite.settings) {
            suite.settings = { };
        }

        suite.settings.appId = newValue;
        updateSuite(suite);
    };

    const onRefreshAppId = () => {
        onUpdateAppId(undefined, globalState.appId);
    };

    return (
        <Stack tokens={sectionStackTokens}>
            <Stack.Item>
                <Text styles={{root: { paddingTop: "5px", fontWeight: "bold"}}}>Settings</Text>
                <div style={{display: "flex", flexDirection: "row", paddingTop: "5px"}}>
                    <Text styles={{root: { paddingTop: "5px" } }}>App Id</Text>
                    <TextField placeholder="Leave empty for using default app" styles={{root: { paddingLeft: "5px", flex: "1"}}} onChange={onUpdateAppId} value={suite.settings?.appId} />
                    <IconButton onClick={onRefreshAppId} iconProps={{iconName: "Refresh"}}></IconButton>
                </div>
            </Stack.Item>
            <Stack.Item>
                <Text styles={{root: { paddingTop: "5px", fontWeight: "bold"}}}>Tests</Text>
            </Stack.Item>
            { suite.tests?.filter(t => !!t).map((t, i, self) => 
                <Stack.Item key={`stack_${t.id}`}>
                    <TestView key={`test_${t.id}`} previousTest={i > 0 ? self[i - 1] : undefined} position={i} suite={suite} formState={pageState.formState} updateTest={updateTest} moveTestUp={moveTestUp} moveTestDown={moveTestDown} test={t} />
                </Stack.Item>
            ) }
        </Stack>
    );
};