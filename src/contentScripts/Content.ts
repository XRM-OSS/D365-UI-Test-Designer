import { FormState, FormTab } from "../domain/PageState";
import { CommunicationMessage, CommunicationRequest, CommunicationResponse } from "../domain/Communication";

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

    private handlers: {[key: string]: (data?: any) => any} = {
        "getFormState": () => {
            var xrm = this.oss_FindXrm();

            return {
                entity: xrm.Page.data.entity.getEntityName(),
                recordId: xrm.Page.data.entity.getId(),
                tabs: xrm.Page.ui.tabs.get().map(t => ({ name: t.getName(), label: t.getLabel(), visible: t.getVisible(), expanded: t.getDisplayState() === "expanded"})),
                sections:  xrm.Page.ui.tabs.get().reduce((all, cur) => [...all, ...cur.sections.get()], []).map(s => ({ name: s.getName(), label: s.getLabel(), visible: s.getVisible() && (!s.getParent() || s.getParent().getVisible())})),
                pageElements: xrm.Page.getControl().map(c => {
                    const attribute = ((c as any).getAttribute ? (c as any).getAttribute() : undefined) as Xrm.Attributes.Attribute;
                    const type = attribute?.getAttributeType();

                    return {
                        controlName: c.getName(),
                        controlType: c.getControlType(),
                        label: c.getLabel(),
                        disabled: (c as any).getDisabled && (c as any).getDisabled(),
                        visible: c.getVisible() && (!c.getParent() || c.getParent().getVisible()) && (!c.getParent() || !c.getParent().getParent() || c.getParent().getParent().getVisible()),
                        logicalName: attribute?.getName(),
                        requiredLevel: attribute?.getRequiredLevel(),
                        value: type === "lookup" ? JSON.stringify(attribute?.getValue()) : attribute?.getValue(),
                        attributeType: attribute?.getAttributeType()
                    };
                })
            } as FormState;
        },
        "startRecording": (testId: string) => {
            var xrm = this.oss_FindXrm();

            if (!xrm.Page.data || !xrm.Page.data.entity) {
                return;
            }

            xrm.Page.getAttribute().forEach(a => a.addOnChange(this.attributeOnChange));
            xrm.Page.data.entity.addOnSave(this.onSave);

            return testId;
        },
        "stopRecording": () => {
            var xrm = this.oss_FindXrm();

            xrm.Page.getAttribute().forEach(a => a.removeOnChange(this.attributeOnChange));
            xrm.Page.data.entity.removeOnSave(this.onSave);

            return true;
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

            const data = this.handlers[operation](message.data);
            this.sendMessage({ recipient: "popup", operation: operation, success: true, data: data });
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