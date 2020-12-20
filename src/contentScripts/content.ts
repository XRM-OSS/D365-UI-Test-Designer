import { communicationMessage, communicationRequest, communicationResponse } from "../domain/communication";

class pageLogic
{
    constructor() {

    }

    private handlers: {[key: string]: () => any} = {
        "getAttributes": () => {
            var xrm = this.oss_FindXrm();

            return xrm.Page.getAttribute().map(a => a.getName());
        }
    };

    private sendMessage(message: communicationResponse) {
        window.postMessage({
                type: "__D365_UITest_Inject",
                data: message 
            },
            "*");
    }

    bootstrap() {
        window.addEventListener("message", (event) => {
            const eventData = event.data;
            if (!eventData || eventData.type !== "__D365_UITest_Content") {
                return;
            }

            const message: communicationRequest = eventData.data;
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

new pageLogic().bootstrap();