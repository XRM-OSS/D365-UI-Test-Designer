import * as React from "react";
import { TestDefinition, TestSuite } from "../domain/TestSuite";
import { CommunicationMessage, CommunicationRequest, CommunicationResponse } from "../domain/Communication";
import { CaptureView } from "./CaptureView";
import { ExportView } from "./ImportExportView";
import { getStoredPageState, setStoredPageState, getStoredTestSuite, setStoredTestSuite, defaultTestSuite, getStoredGlobalState } from "../domain/Storage";
import { IOverflowSetItemProps, OverflowSet } from "@fluentui/react/lib/OverflowSet";
import { CommandBarButton, DefaultButton, IButtonStyles, IconButton, PrimaryButton } from "@fluentui/react/lib/Button";
import { PageState } from "../domain/PageState";
import { IContextualMenuProps } from "@fluentui/react/lib/ContextualMenu";
import { GlobalState } from "../domain/GlobalState";
import { useSuiteContext, useSuiteDispatch } from "../domain/SuiteContext";
import { v4 as uuidv4 } from "uuid";

const sendMessage = (payload: CommunicationRequest, cb?: (r: any) => void) => {
    chrome.runtime.sendMessage(payload, cb);
};

export const PopUp: React.FC<any> = () => {
    const [suiteState, suiteDispatch] = useSuiteContext();
    const [pageState, setPageState] = React.useState({} as PageState);
    const [globalState, setGlobalState] = React.useState({} as GlobalState);
    const [activeTab, setActiveTab] = React.useState("#capture");

    const refreshState = async () => {
        const newPageState = await getStoredPageState();
        setPageState(newPageState);
        
        const newTestSuite = await getStoredTestSuite();
        suiteDispatch({
            type: "updateSuite",
            payload: {
                suite: newTestSuite,
                persist: false
            }
        });
        
        const newGlobalState = await getStoredGlobalState();
        setGlobalState(newGlobalState);
    };

    React.useEffect(() => {
        if (!pageState.formState) {
            sendMessage({ recipient: "page", operation: "getFormState" });
        }

        if (!globalState.appId) {
            sendMessage({ recipient: "page", operation: "getGlobalState" });
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

    const addTestGroup = () => {
        suiteDispatch({
            type: "addTestGroup",
            payload: {
                group: {
                    id: uuidv4(),
                    name: `Group ${(suiteState?.suite?.groups?.length ?? 0) + 1}`,
                    tests: []
                }
            }
        });
    }

    const clear = () => {
        stopRecording();

        suiteDispatch({
            type: "updateSuite",
            payload: {
                suite: defaultTestSuite,
                persist: true
            }
        });
    }

    const menuProps: IContextualMenuProps = {
        items: suiteState.suite?.groups?.reduce((all, cur) => [...all, ...cur.tests.map(t => ({...t, name: `${t.name} (${cur.name ?? "Default"})` }))], [])?.filter(t => !!t).map(t => ({ key: t.id, text: t.name, onClick: () => startRecording(t.id)})),
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
            key: "addTestGroup",
            name: "Add Test Group",
            icon: "Add",
            onClick: addTestGroup,
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
        <div>
            <OverflowSet
                role="menubar"
                styles={{root: {backgroundColor: "#f8f9fa", position: "sticky", top: "0px", zIndex: 1, padding: "5px" }}}
                onRenderItem={onRenderItem}
                onRenderOverflowButton={onRenderOverflowButton}
                items={navItems.filter(i => !!i)}
            />
            <div style={{padding: "5px"}}>
                { activeTab === "#capture" && <CaptureView pageState={pageState} globalState={globalState} /> }
                { activeTab === "#export" && <ExportView /> }
            </div>
        </div>
    );
}
