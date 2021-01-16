import * as React from "react";
import { TestDefinition, TestSuite } from "../domain/TestSuite";
import { TestView } from "./TestView";
import { IStackTokens, Stack, StackItem } from "@fluentui/react/lib/Stack";
import { PageState } from "../domain/PageState";
import { Text } from "@fluentui/react/lib/Text";
import { TextField } from "@fluentui/react/lib/TextField";
import { GlobalState } from "../domain/GlobalState";
import { IconButton } from "@fluentui/react/lib/Button";
import { useSuiteContext } from "../domain/SuiteContext";

export interface CaptureViewProps {
    pageState: PageState;
    globalState: GlobalState;
}

export const CaptureView: React.FC<CaptureViewProps> = ({pageState, globalState }) => {
    const [ suiteState, suiteDispatch ] = useSuiteContext();
    
    const sectionStackTokens: IStackTokens = { childrenGap: 10, maxWidth: "100%" };

    const onUpdateAppId = (event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string) => {
        if (!suiteState.suite?.settings) {
            suiteState.suite.settings = { };
        }

        const update = {...suiteState.suite, settings: { ...suiteState.suite.settings, appId: newValue } };
        
        suiteDispatch({
            type: "updateSuite",
            payload: update
        });
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
                    <TextField placeholder="Leave empty for using default app" styles={{root: { paddingLeft: "5px", flex: "1"}}} onChange={onUpdateAppId} value={suiteState.suite?.settings?.appId ?? ""} />
                    <IconButton title="Insert the ID of the current app" onClick={onRefreshAppId} iconProps={{iconName: "Refresh"}}></IconButton>
                </div>
            </Stack.Item>
            <Stack.Item>
                <Text styles={{root: { paddingTop: "5px", fontWeight: "bold"}}}>Tests</Text>
            </Stack.Item>
            { suiteState.suite?.tests?.filter(t => !!t).map((t, i, self) => 
                <Stack.Item key={`stack_${t.id}`}>
                    <TestView key={`test_${t.id}`} suite={suiteState.suite} previousTest={i > 0 ? self[i - 1] : undefined} position={i} formState={pageState.formState} test={t} />
                </Stack.Item>
            ) }
        </Stack>
    );
};