import * as React from "react";
import { TestGroup } from "../domain/TestSuite";
import { Stack } from "@fluentui/react/lib/Stack";
import { TextField } from "@fluentui/react/lib/TextField";
import { IconButton } from "@fluentui/react/lib/Button";
import { Text } from "@fluentui/react/lib/Text";
import { TestView } from "./TestView";
import { SuiteStateProps } from "../domain/SuiteContext";
import { PageState } from "../domain/PageState";
import { TabStyle } from "./CaptureView";

export interface TestGroupViewProps {
    testGroup: TestGroup;
    suiteState: SuiteStateProps;
    pageState: PageState;
    updateGroupName: (id: string, group: TestGroup) => void;
    moveGroupUp: (id: string) => void;
    moveGroupDown: (id: string) => void;
    deleteGroup: (id: string) => void;
    showTestEntitySelector: (id: string) => void;
}

export const TestGroupView: React.FC<TestGroupViewProps> = ({ testGroup, suiteState, pageState, updateGroupName, moveGroupDown, moveGroupUp, deleteGroup, showTestEntitySelector }) => {
    return (
        <>
            <Stack.Item>
                <div style={{display: "flex", flexDirection: "row", paddingTop: "5px" }}>
                    <TextField styles={{root: { flex: "1" } }} onChange={(e, v) => updateGroupName(v, testGroup)} value={testGroup.name}></TextField>
                    <div style={{ paddingLeft: "5px" }}>
                        <div style={{ display: "flex" }}>
                            <IconButton title="Move this test group to the left" onClick={() => moveGroupUp(testGroup.id)} iconProps={{iconName: "ChevronLeft"}} />
                            <IconButton title="Move this test group to the right" onClick={() => moveGroupDown(testGroup.id)} iconProps={{iconName: "ChevronRight"}} />
                            <IconButton title="Delete this test group" onClick={() => deleteGroup(testGroup.id)} iconProps={{iconName: "Delete"}} />
                        </div>
                    </div>
                </div>
            </Stack.Item>
            <Stack.Item>
                <Text styles={{root: { paddingTop: "5px", fontWeight: "bold"}}}>Tests <IconButton onClick={() => showTestEntitySelector(testGroup.id)} iconProps={{iconName: "Add"}}></IconButton></Text>
            </Stack.Item>
            {
                testGroup.tests?.filter(t => !!t)
                .map((t, i, self) => 
                    <Stack.Item key={`stack_${t.id}`}>
                        <TestView key={`test_${t.id}`} groupId={testGroup.id} suite={suiteState.suite} previousTest={i > 0 ? self[i - 1] : undefined} position={i} formState={pageState.formState} test={t} />
                    </Stack.Item>
                )
            }
        </>
    );
};