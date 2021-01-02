import { ControlState, FormState } from "../domain/PageState";
import { CommunicationMessage, CommunicationRequest, CommunicationResponse } from "../domain/Communication";
import { EntityMetadata } from "../domain/TestSuite";
import { EntityControl, SectionControl, TabControl } from "../domain/ControlTypes";
import { GlobalState } from "../domain/GlobalState";

class PageLogic
{
    constructor() {

    }

    private sendMessage = (message: CommunicationResponse) => {
        window.postMessage({
                type: "__D365_UITest_Inject",
                data: message 
            },
            "*");
    }

    private attributeOnChange = (context: Xrm.Events.EventContext) => {
        try {
            const eventSource = (context.getEventSource() as Xrm.Attributes.Attribute)
            const name = eventSource?.getName();

            if (!name) {
                return;
            }

            const value = eventSource.getValue();
            const type = eventSource.getAttributeType();

            this.sendMessage({
                operation: "formEvent",
                recipient: "popup",
                success: true,
                data: {
                    name: eventSource.controls.get(0)?.getName() ?? name,
                    logicalName: name,
                    event: "setValue",
                    attributeType: type,
                    value: type === "lookup" ? JSON.stringify(value) : value
                }
            });
        }
        catch (e) {
            console.error(e?.message);
        }
    };

    private onSave = (context: Xrm.Events.SaveEventContext) => {
        try {
            const eventArgs = context.getEventArgs();

            // We don't want to capture auto save events
            if (eventArgs.getSaveMode() == 70) {
                return;
            }

            this.sendMessage({
                operation: "formEvent",
                recipient: "popup",
                success: true,
                data: {
                    event: "save"
                }
            });
        }
        catch (e) {
            console.error(e?.message);
        }
    };

    private handlers: {[key: string]: (data?: any) => Promise<[ boolean, any ]>} = {
        "getFormState": async () => {
            const xrm = this.oss_FindXrm();

            if (!xrm || !xrm.Page.data || !xrm.Page.data.entity) {
                return [false, undefined];
            }

            return [ true, {
                entity: xrm.Page.data.entity.getEntityName(),
                recordId: xrm.Page.data.entity.getId(),
                controlStates: xrm.Page.getControl().map(c => {
                    const attribute = ((c as any).getAttribute ? (c as any).getAttribute() : undefined) as Xrm.Attributes.Attribute;
            
                    return {
                        type: "control",
                        controlName: c.getName(),
                        disabled: (c as any).getDisabled && (c as any).getDisabled(),
                        visible: c.getVisible() && (!c.getParent() || c.getParent().getVisible()) && (!c.getParent() || !c.getParent().getParent() || c.getParent().getParent().getVisible()),
                        logicalName: attribute?.getName(),
                        attributeType: attribute?.getAttributeType(),
                        requiredLevel: attribute?.getRequiredLevel(),
                        value: attribute?.getAttributeType() === "lookup" ? JSON.stringify(attribute?.getValue()) : attribute?.getValue() 
                    } as ControlState;
                })
                .concat(xrm.Page.ui.tabs.get().map(t => ({ type: "tab", controlName: t.getName(), label: t.getLabel(), visible: t.getVisible()})))
                .concat(xrm.Page.ui.tabs.get().reduce((all, cur) => [...all, ...cur.sections.get()], []).map((s: Xrm.Controls.Section) => ({ type: "section", controlName: s.getName(), label: s.getLabel(), visible: s.getVisible() && (!s.getParent() || s.getParent().getVisible())} as ControlState)))
            } as FormState];
        },
        "getEntityMetadata": async () => {
            const xrm = this.oss_FindXrm();

            if (!xrm || !xrm.Page.data || !xrm.Page.data.entity) {
                return [false, undefined];
            }

            return [ true, {
                logicalName: xrm.Page.data.entity.getEntityName(),
                controls: xrm.Page.getControl().map(c => {
                    const attribute = ((c as any).getAttribute ? (c as any).getAttribute() : undefined) as Xrm.Attributes.Attribute;
            
                    return {
                        type: "control",
                        controlName: c.getName(),
                        controlType: c.getControlType(),
                        label: c.getLabel(),
                        logicalName: attribute?.getName(),
                        attributeType: attribute?.getAttributeType()
                    } as EntityControl;
                })
                .concat(xrm.Page.ui.tabs.get().map(t => ({ type: "tab", controlName: t.getName(), label: t.getLabel()} as TabControl)))
                .concat(xrm.Page.ui.tabs.get().reduce((all, cur) => [...all, ...cur.sections.get()], []).map(s => ({ type: "section", controlName: s.getName(), tabName: s.getParent() && s.getParent().getName(), label: s.getLabel() } as SectionControl)))
            } as EntityMetadata];
        },
        "startRecording": async (testId: string) => {
            const xrm = this.oss_FindXrm();

            if (!xrm || !xrm.Page.data || !xrm.Page.data.entity) {
                return [false, undefined];
            }

            xrm.Page.getAttribute().forEach(a => a.addOnChange(this.attributeOnChange));
            xrm.Page.data.entity.addOnSave(this.onSave);

            return [ true, testId];
        },
        "stopRecording": async () => {
            const xrm = this.oss_FindXrm();

            if (!xrm || !xrm.Page.data || !xrm.Page.data.entity) {
                return [false, undefined];
            }

            xrm.Page.getAttribute().forEach(a => a.removeOnChange(this.attributeOnChange));
            xrm.Page.data.entity.removeOnSave(this.onSave);

            return [true, true];
        },
        "getGlobalState": async () => {
            const xrm = this.oss_FindXrm();

            const globalContext = xrm.Utility.getGlobalContext();
            const appProperties = await globalContext.getCurrentAppProperties();

            return [true, {
                appId: appProperties.appId
            } as GlobalState];
        }
    };

    bootstrap() {
        window.addEventListener("message", async (event) => {
            const eventData = event.data;
            if (!eventData || eventData.type !== "__D365_UITest_Content") {
                return;
            }

            const message: CommunicationRequest = eventData.data;
            const operation = message.operation;

            if (!this.handlers[operation]) {
                this.sendMessage({ recipient: "popup", operation: operation, success: false, data: "Operation not found" });
            }

            const [success, data] = await this.handlers[operation](message.data);
            this.sendMessage({ recipient: "popup", operation: operation, success: success, data: data });
        });
    }

    private oss_FindXrm () {
        if (window.Xrm && (window.Xrm as any).Internal && (window.Xrm as any).Internal && (window.Xrm as any).Internal && (window.Xrm as any).Internal.isUci && (window.Xrm as any).Internal.isUci()) {
            return window.Xrm;
        }

        const frames = Array.from(document.querySelectorAll("iframe"))
            .filter(f => f.style.visibility !== "hidden")
            .filter(f => { try { return f.contentWindow && f.contentWindow.Xrm; } catch { return false; } })
            .map(f => f.contentWindow.Xrm)
            .filter(f => f.Page);

        return frames.length ? frames[0] : window.Xrm;
    }
}

new PageLogic().bootstrap();