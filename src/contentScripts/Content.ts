import { ControlState, FormState } from "../domain/PageState";
import { CommunicationMessage, CommunicationRequest, CommunicationResponse } from "../domain/Communication";
import { EntityMetadata } from "../domain/TestSuite";
import { EntityControl } from "../domain/ControlTypes";

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
        const eventSource = (context.getEventSource() as Xrm.Attributes.Attribute)
        
        const name = eventSource.getName();
        const value = eventSource.getValue();
        const type = eventSource.getAttributeType();

        this.sendMessage({
            operation: "formEvent",
            recipient: "popup",
            success: true,
            data: {
                name: name,
                event: "setValue",
                attributeType: type,
                value: type === "lookup" ? JSON.stringify(value) : value
            }
        });
    };

    private onSave = () => {
        this.sendMessage({
            operation: "formEvent",
            recipient: "popup",
            success: true,
            data: {
                event: "save"
            }
        });
    };

    private handlers: {[key: string]: (data?: any) => [ boolean, any ]} = {
        "getFormState": () => {
            var xrm = this.oss_FindXrm();

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
                .concat(xrm.Page.ui.tabs.get().reduce((all, cur) => [...all, ...cur.sections.get()], []).map(s => ({ type: "section", controlName: s.getName(), label: s.getLabel(), visible: s.getVisible() && (!s.getParent() || s.getParent().getVisible())})))
            } as FormState];
        },
        "getEntityMetadata": () => {
            var xrm = this.oss_FindXrm();

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
                .concat(xrm.Page.ui.tabs.get().map(t => ({ type: "tab", controlName: t.getName(), label: t.getLabel()})))
                .concat(xrm.Page.ui.tabs.get().reduce((all, cur) => [...all, ...cur.sections.get()], []).map(s => ({ type: "section", controlName: s.getName(), label: s.getLabel() })))
            } as EntityMetadata];
        },
        "startRecording": (testId: string) => {
            var xrm = this.oss_FindXrm();

            if (!xrm || !xrm.Page.data || !xrm.Page.data.entity) {
                return [false, undefined];
            }

            xrm.Page.getAttribute().forEach(a => a.addOnChange(this.attributeOnChange));
            xrm.Page.data.entity.addOnSave(this.onSave);

            return [ true, testId];
        },
        "stopRecording": () => {
            var xrm = this.oss_FindXrm();

            if (!xrm || !xrm.Page.data || !xrm.Page.data.entity) {
                return [false, undefined];
            }

            xrm.Page.getAttribute().forEach(a => a.removeOnChange(this.attributeOnChange));
            xrm.Page.data.entity.removeOnSave(this.onSave);

            return [true, true];
        }
    };

    bootstrap() {
        window.addEventListener("message", (event) => {
            const eventData = event.data;
            if (!eventData || eventData.type !== "__D365_UITest_Content") {
                return;
            }

            const message: CommunicationRequest = eventData.data;
            const operation = message.operation;

            if (!this.handlers[operation]) {
                this.sendMessage({ recipient: "popup", operation: operation, success: false, data: "Operation not found" });
            }

            const [success, data] = this.handlers[operation](message.data);
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