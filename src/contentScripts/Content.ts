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
            operation: "attributeChanged",
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

    private handlers: {[key: string]: () => any} = {
        "getAttributes": () => {
            var xrm = this.oss_FindXrm();

            return xrm.Page.getAttribute().map(a => a.getName());
        },
        "startRecording": () => {
            var xrm = this.oss_FindXrm();

            xrm.Page.getAttribute().forEach(a => a.addOnChange(this.attributeOnChange));
            
            return true;
        },
        "stopRecording": () => {
            var xrm = this.oss_FindXrm();

            xrm.Page.getAttribute().forEach(a => a.removeOnChange(this.attributeOnChange));
            
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

            const data = this.handlers[operation]();
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