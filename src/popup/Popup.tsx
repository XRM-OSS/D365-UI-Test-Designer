import * as React from "react";
import { TestDefinition, TestSuite } from "../domain/TestSuite";
import { CommunicationMessage, CommunicationRequest, CommunicationResponse } from "../domain/Communication";
import { CaptureView } from "./CaptureView";
import { ExportView } from "./ExportView";
import { getStoredPageState, setStoredPageState, getStoredTestSuite, setStoredTestSuite } from "../domain/Storage";
import { IOverflowSetItemProps, OverflowSet } from "@fluentui/react/lib/OverflowSet";
import { CommandBarButton, DefaultButton, IButtonStyles, IconButton } from "@fluentui/react/lib/Button";
import { v4 as uuidv4 } from "uuid";
import { PageState } from "../domain/PageState";
import { IContextualMenuProps } from "@fluentui/react/lib/ContextualMenu";

const sendMessage = (payload: CommunicationRequest, cb?: (r: any) => void) => {
    chrome.runtime.sendMessage(payload, cb);
};

export const PopUp: React.FC<any> = () => {
    const [pageState, setPageState] = React.useState({} as PageState);
    const [testSuite, setTestSuite] = React.useState({} as TestSuite);
    const [activeTab, setActiveTab] = React.useState("#capture");

    const refreshState = async () => {
        const newPageState = await getStoredPageState();
        setPageState(newPageState);
        const newTestSuite = await getStoredTestSuite();
        setTestSuite(newTestSuite);
    };

    const persistTestSuite = async (suite: TestSuite) => {
        await setStoredTestSuite(suite);
        setTestSuite(suite);
    };

    React.useEffect(() => {
        if (!pageState.formState) {
            sendMessage({ recipient: "page", operation: "getFormState" });
        }

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

    const updateTest = (position: number, test: TestDefinition) => {
        const newTests = [...testSuite.tests];
        newTests.splice(position, 1, test);

        persistTestSuite({...testSuite, tests: newTests});
    }

    const addTest = () => {
        persistTestSuite({...testSuite, tests: (testSuite.tests ?? []).concat([{ name: `Test ${(testSuite.tests?.length ?? 0) + 1}`, id: uuidv4(), actions: [] }])});
    }

    const clear = () => {
        stopRecording();
        persistTestSuite({});
    }

    const menuProps: IContextualMenuProps = {
        items: testSuite.tests?.map(t => ({ key: t.id, text: t.name, onClick: () => startRecording(t.id)})),
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
            key: "export",
            name: "Export",
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
            onClick: addTest,
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

    return (
        <div style={{width: "760px", height: "600px"}}>
            <OverflowSet
                role="menubar"
                styles={{root: {backgroundColor: "#f8f9fa"}}}
                onRenderItem={onRenderItem}
                onRenderOverflowButton={onRenderOverflowButton}
                items={navItems.filter(i => !!i)}
            />
            { activeTab === "#capture" && <CaptureView pageState={pageState} suite={testSuite} updateTest={updateTest} /> }
            { activeTab === "#export" && <ExportView state={testSuite}></ExportView> }
        </div>
    );
}