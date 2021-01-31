import * as React from "react";
import { TestDefinition, TestGroup, TestSuite } from "../domain/TestSuite";
import { IStackTokens, Stack } from "@fluentui/react/lib/Stack";
import { PageState } from "../domain/PageState";
import { Text } from "@fluentui/react/lib/Text";
import { TextField } from "@fluentui/react/lib/TextField";
import { GlobalState } from "../domain/GlobalState";
import { DefaultButton, IconButton, PrimaryButton } from "@fluentui/react/lib/Button";
import { useSuiteContext } from "../domain/SuiteContext";
import { Pivot } from "@fluentui/react/lib/Pivot";
import { v4 as uuidv4 } from "uuid";
import { Dialog, DialogFooter, DialogType } from "@fluentui/react/lib/Dialog";
import { Dropdown } from "@fluentui/react/lib/Dropdown";
import { TestGroupView } from "./TestGroupView";
import { PivotItem } from "@fluentui/react/lib/Pivot";

export interface CaptureViewProps {
    pageState: PageState;
    globalState: GlobalState;
}

export interface TabStyle {
    id: string;
    style: React.CSSProperties;
}

export const CaptureView: React.FC<CaptureViewProps> = ({pageState, globalState }) => {
    const [ suiteState, suiteDispatch ] = useSuiteContext();
    const [entitySelectorHidden, setEntitySelectorHidden] = React.useState(true);
    const [testEntityLogicalName, setTestEntityLogicalName] = React.useState("");
    const [selectedGroup, setSelectedGroup] = React.useState<string>("");

    const sectionStackTokens: IStackTokens = { childrenGap: 10, maxWidth: "100%" };

    const onUpdateAppId = (event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string) => {
        if (!suiteState.suite?.settings) {
            suiteState.suite.settings = { };
        }

        const update = {...suiteState.suite, settings: { ...suiteState.suite.settings, appId: newValue } };
        
        suiteDispatch({
            type: "updateSuite",
            payload: {
                suite: update,
                persist: true
            }
        });
    };

    const onRefreshAppId = () => {
        onUpdateAppId(undefined, globalState.appId);
    };

    const showTestEntitySelector = (groupId: string) => {
        setSelectedGroup(groupId);
        setEntitySelectorHidden(false);
    }

    const hideTestEntitySelector = () => {
        setSelectedGroup("");
        setEntitySelectorHidden(true);
    }

    const addTest = () => {
        const group = suiteState?.suite?.groups?.find(g => g.id === selectedGroup);

        if (!group) {
            return;
        }

        suiteDispatch({
            type: "addTest",
            payload: {
                groupId: selectedGroup,
                test: {
                    name: `Test ${(group.tests?.length ?? 0) + 1}`,
                    id: uuidv4(),
                    actions: [],
                    entityLogicalName: testEntityLogicalName,
                    preTestNavigation: group.tests && group.tests.length
                        ? undefined 
                        : { type: "new", entity: testEntityLogicalName }
                }
            }
        });
        hideTestEntitySelector();
    }

    const modalProps = {
        isBlocking: true,
        styles: { main: { maxWidth: 450 } }
    };

    const dialogContentProps = {
        type: DialogType.normal,
        title: 'For which entity is your test?',
        subText: 'If your entity does not show up here, please navigate to a form of the missing entity, so that we can collect its metadata.',
    };

    const deleteGroup = (id: string) => {
        suiteDispatch({
            type: "updateTestGroup",
            payload: {
                id,
                group: undefined
            }
        });
    };

    const updateGroupName = (value: string, group: TestGroup) => {
        suiteDispatch({
            type: "updateTestGroup",
            payload: {
                id: group.id,
                group: { ...group, name: value }
            }
        });
    };

    const moveGroupUp = (id: string) => {
        suiteDispatch({
            type: "moveGroupUp",
            payload: {
                id
            }
        });
    };

    const moveGroupDown = (id: string) => {
        suiteDispatch({
            type: "moveGroupDown",
            payload: {
                id
            }
        });
    };

    return (
        <>
            <Dialog
                hidden={entitySelectorHidden}
                onDismiss={() => setEntitySelectorHidden(true)}
                dialogContentProps={dialogContentProps}
                modalProps={modalProps}
            >
                <Dropdown
                    label="Entity Logical Name"
                    onChange={(e, v) => setTestEntityLogicalName(v.id)}
                    selectedKey={testEntityLogicalName}
                    options={Object.keys(suiteState.suite?.metadata ?? {}).map(k => ({ text: k, id: k, key: k }))}
                />
                <DialogFooter>
                    <PrimaryButton disabled={!testEntityLogicalName} onClick={addTest} text="Ok" />
                    <DefaultButton onClick={hideTestEntitySelector} text="Cancel" />
                </DialogFooter>
            </Dialog>
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
                    <Pivot styles={{ root: { overflowX: "auto", overflowY: "hidden" } }}>
                        {
                            suiteState.suite?.groups?.map(g =>
                                <PivotItem key={g.id} itemKey={g.id} id={g.id} headerText={g.name ?? "Default"}>
                                    <TestGroupView
                                        key={g.id}
                                        testGroup={g}
                                        suiteState={suiteState}
                                        pageState={pageState}
                                        moveGroupDown={moveGroupDown}
                                        moveGroupUp={moveGroupUp}
                                        deleteGroup={deleteGroup} 
                                        updateGroupName={updateGroupName}
                                        showTestEntitySelector={showTestEntitySelector}
                                    />
                                </PivotItem>
                            )
                        }
                    </Pivot>
                </Stack.Item>
            </Stack>
        </>
    );
};