import * as React from "react";
import { TestDefinition, TestSuite } from "../domain/TestSuite";
import { CommunicationMessage, CommunicationRequest, CommunicationResponse } from "../domain/Communication";
import { CaptureView } from "./CaptureView";
import { ExportView } from "./ExportView";
import { getStoredState, setStoredState } from "../domain/Storage";
import { IOverflowSetItemProps, OverflowSet } from "@fluentui/react/lib/OverflowSet";
import { CommandBarButton, DefaultButton, IButtonStyles, IconButton } from "@fluentui/react/lib/Button";

const sendMessage = (payload: CommunicationRequest, cb?: (r: any) => void) => {
    chrome.runtime.sendMessage(payload, cb);
};

export const PopUp: React.FC<any> = () => {
    const [state, setState] = React.useState({} as TestSuite);
    const [activeTab, setActiveTab] = React.useState("#capture");

    const refreshState = async () => {
        const newState = await getStoredState();
        setState(newState);
    };

    const persistState = async (state: TestSuite) => {
        await setStoredState(state);
        setState(state);
    };

    React.useEffect(() => {
        if (!state.controls) {
            sendMessage({ recipient: "page", operation: "getControls" });
        }

        chrome.runtime.onMessage.addListener((response: TestSuite, sender) => {
            setState(response);
        });

        refreshState();        
    }, []);

    const toggleRecording = () => {
        sendMessage({ recipient: "page", operation: state.recordingToTest ? "stopRecording" : "startRecording" });
    };

    const updateTest = (position: number, test: TestDefinition) => {
        const newTests = [...state.tests];
        newTests.splice(position, 1, test);

        persistState({...state, tests: newTests});
    }

    const addTest = () => {
        persistState({...state, tests: (state.tests ?? []).concat([{ name: `Test ${(state.tests?.length ?? 0) + 1}` }])});
    }

    const navItems: Array<IOverflowSetItemProps> = [
        {
            key: "capture",
            name: "Capture",
            icon: "Add",
            onClick: () => setActiveTab("#capture"),
        },
        {
            key: "export",
            name: "Export",
            icon: "Add",
            onClick: () => setActiveTab("#export"),
        },
        {
            key: "utility",
            name: "Utility",
            icon: "Add",
            onClick: () => setActiveTab("#utility"),
        },
        {
            key: "addTest",
            name: "Add Test",
            icon: "Add",
            onClick: addTest,
        },
        {
            key: "toggleRecording",
            onRender: () => <DefaultButton
            text="Primary"
            primary
            split
            splitButtonAriaLabel="See 2 options"
            aria-roledescription="split button"
            onClick={toggleRecording}
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
            />
        );
    };

    return (
        <div style={{width: "800px", height: "600px"}}>
            <OverflowSet
                role="menubar"
                styles={{root: {backgroundColor: "#f8f9fa"}}}
                onRenderItem={onRenderItem}
                onRenderOverflowButton={onRenderOverflowButton}
                items={navItems.filter(i => !!i)}
            />
            { activeTab === "#capture" && 
                <div style={{overflow: "auto"}}>
                    { state.tests?.map((t, i) => <CaptureView key={`test_${i}`} position={i} controls={state.controls} updateTest={updateTest} test={t} />) }
                </div>
            }
            { activeTab === "#export" && <ExportView state={state}></ExportView> }
        </div>
    );
}