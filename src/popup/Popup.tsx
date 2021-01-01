import * as React from "react";
import { TestDefinition, TestSuite } from "../domain/TestSuite";
import { CommunicationMessage, CommunicationRequest, CommunicationResponse } from "../domain/Communication";
import { CaptureView } from "./CaptureView";
import { ExportView } from "./ImportExportView";
import { getStoredPageState, setStoredPageState, getStoredTestSuite, setStoredTestSuite, defaultTestSuite } from "../domain/Storage";
import { IOverflowSetItemProps, OverflowSet } from "@fluentui/react/lib/OverflowSet";
import { CommandBarButton, DefaultButton, IButtonStyles, IconButton, PrimaryButton } from "@fluentui/react/lib/Button";
import { v4 as uuidv4 } from "uuid";
import { PageState } from "../domain/PageState";
import { IContextualMenuProps } from "@fluentui/react/lib/ContextualMenu";
import { swapPositions } from "../domain/SwapPositions";
import { ErrorBoundary } from "./ErrorBoundary";
import { Dialog, DialogFooter, DialogType } from "@fluentui/react/lib/Dialog";
import { Dropdown } from "@fluentui/react/lib/Dropdown";

const sendMessage = (payload: CommunicationRequest, cb?: (r: any) => void) => {
    chrome.runtime.sendMessage(payload, cb);
};

export const PopUp: React.FC<any> = () => {
    const [pageState, setPageState] = React.useState({} as PageState);
    const [testSuite, setTestSuite] = React.useState({} as TestSuite);
    const [activeTab, setActiveTab] = React.useState("#capture");
    const [entitySelectorHidden, setEntitySelectorHidden] = React.useState(true);
    const [testEntityLogicalName, setTestEntityLogicalName] = React.useState("");

    const refreshState = async () => {
        const newPageState = await getStoredPageState();
        setPageState(newPageState);
        const newTestSuite = await getStoredTestSuite();
        setTestSuite(newTestSuite);
    };

    const persistTestSuite = async (suite: TestSuite) => {
        await setStoredTestSuite(suite);
        setTestSuite({...suite});
    };

    React.useEffect(() => {
        if (!pageState.formState) {
            sendMessage({ recipient: "page", operation: "getFormState" });
        }

        sendMessage({ recipient: "page", operation: "getEntityMetadata" });

        chrome.runtime.onMessage.addListener((response: TestSuite, sender) => {
            refreshState();
        });

        refreshState();        
    }, []);

    const stopRecording = () => {
        sendMessage({ recipient: "page", operation: "stopRecording" });
    };

    const startRecording = (testId: string) => {
        sendMessage({ recipient: "page", operation: "startRecording", data: testId });
    };

    const updateTest = (id: string, test: TestDefinition) => {
        const newTests = [...testSuite.tests];
        const position = newTests.findIndex(t => t.id === id);

        if (test) {
            newTests.splice(position, 1, test);
        }
        else {
            const testToDelete = newTests[position];

            // Stop recording if test that is currently deleted is in active recording
            if (pageState.recordingToTest === testToDelete.id) {
                stopRecording();
            }

            newTests.splice(position, 1);
        }

        persistTestSuite({...testSuite, tests: newTests});
    }

    const addTest = () => {
        persistTestSuite({...testSuite, tests: (testSuite.tests ?? []).concat([{ name: `Test ${(testSuite.tests?.length ?? 0) + 1}`, id: uuidv4(), actions: [], entityLogicalName: testEntityLogicalName, preTestNavigation: testSuite && testSuite.tests && testSuite.tests.length ? undefined : { type: "new", entity: testEntityLogicalName } }])});
        setEntitySelectorHidden(true);
    }

    const showTestEntitySelector = () => {
        setEntitySelectorHidden(false);
    }

    const moveTestUp = React.useCallback((id: string) => {
            const index = testSuite.tests.findIndex(t => t.id === id);
            if (index === 0) {
                return;
            }

            const destinationIndex = index - 1;
            swapPositions(testSuite.tests, index, destinationIndex);

            persistTestSuite(testSuite);
        },
        [testSuite, testSuite.tests]
    );

    const moveTestDown = React.useCallback((id: string) => {
            const index = testSuite.tests.findIndex(t => t.id === id);
            if (index === testSuite.tests.length - 1) {
                return;
            }

            const destinationIndex = index + 1;
            swapPositions(testSuite.tests, index, destinationIndex);

            persistTestSuite(testSuite);
        },
        [testSuite, testSuite.tests]
    );

    const clear = () => {
        stopRecording();
        persistTestSuite(defaultTestSuite);
    }

    const menuProps: IContextualMenuProps = {
        items: testSuite.tests?.filter(t => !!t).map(t => ({ key: t.id, text: t.name, onClick: () => startRecording(t.id)})),
        directionalHintFixed: true,
    };

    const navItems: Array<IOverflowSetItemProps> = [
        {
            key: "capture",
            name: "Capture",
            icon: "FrontCamera",
            onClick: () => setActiveTab("#capture"),
        },
        {
            key: "importExport",
            name: "Import / Export",
            icon: "CloudImportExport",
            onClick: () => setActiveTab("#export"),
        },
        {
            key: "utility",
            name: "Utility",
            icon: "DeveloperTools",
            onClick: () => setActiveTab("#utility"),
        },
        {
            key: "addTest",
            name: "Add Test",
            icon: "Add",
            onClick: showTestEntitySelector,
        },
        {
            key: "clear",
            name: "Clear All",
            icon: "RecycleBin",
            onClick: clear,
        },
        {
            key: "toggleRecording",
            onRender: () =>
                <DefaultButton
                    text={pageState.recordingToTest ? "Recording Active" : "Recording Inactive"}
                    split
                    splitButtonAriaLabel="See 2 options"
                    splitButtonMenuProps={{styles: { root: { backgroundColor: pageState.recordingToTest ? "green" : "red" } }}}
                    aria-roledescription="split button"
                    menuProps={menuProps}
                    onClick={stopRecording}
                    styles={{ root: { color: "white", backgroundColor: pageState.recordingToTest ? "green" : "red" } }}
                />
        }
      ];
    
      const onRenderOverflowButton = (overflowItems: any[] | undefined): JSX.Element => {
        const buttonStyles: Partial<IButtonStyles> = {
          root: {
            minWidth: 0,
            padding: '0 4px',
            alignSelf: 'stretch',
            height: 'auto',
          },
        };
        
        return (
          <CommandBarButton
            ariaLabel="More items"
            role="menuitem"
            styles={buttonStyles}
            menuIconProps={{ iconName: 'More' }}
            menuProps={{ items: overflowItems! }}
          />
        );
      };  

    const onRenderItem = (item: IOverflowSetItemProps): JSX.Element => {
        if (item.onRender) {
            return item.onRender(item);
        }

        return (
            <CommandBarButton
                role="menuitem"
                iconProps={{ iconName: item.icon }}
                menuProps={item.subMenuProps}
                text={item.name}
                onClick={item.onClick}
            />
        );
    };

    const modalProps = {
        isBlocking: true,
        styles: { main: { maxWidth: 450 } }
    };

    const dialogContentProps = {
        type: DialogType.normal,
        title: 'For which entity is your test?',
        subText: 'If your entity does not show up here, please navigate to a form of the missing entity, so that we can collect its metadata.',
    };

    return (
        <div>
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
                    options={Object.keys(testSuite?.metadata ?? {}).map(k => ({ text: k, id: k, key: k }))}
                />
                <DialogFooter>
                    <PrimaryButton disabled={!testEntityLogicalName} onClick={addTest} text="Ok" />
                    <DefaultButton onClick={() => setEntitySelectorHidden(true)} text="Cancel" />
                </DialogFooter>
            </Dialog>
            <OverflowSet
                role="menubar"
                styles={{root: {backgroundColor: "#f8f9fa", position: "sticky", top: "0px", zIndex: 1, padding: "5px" }}}
                onRenderItem={onRenderItem}
                onRenderOverflowButton={onRenderOverflowButton}
                items={navItems.filter(i => !!i)}
            />
            <div style={{padding: "5px"}}>
                { activeTab === "#capture" && <CaptureView pageState={pageState} suite={testSuite} updateTest={updateTest} moveTestDown={moveTestDown} moveTestUp={moveTestUp} /> }
                { activeTab === "#export" && <ExportView importTestSuite={persistTestSuite} state={testSuite}></ExportView> }
            </div>
        </div>
    );
}
