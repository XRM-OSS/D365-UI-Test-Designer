import { communicationRequest } from "../domain/communication";

window.addEventListener("message", function(event) {
    // We only accept messages from ourselves
    if (event.source != window)
      return;
  
    if (event.data.type && (event.data.type == "__D365_UITest_Inject")) {
      chrome.runtime.sendMessage(event.data.data);
    }
  }, false);  

chrome.runtime.onMessage.addListener((request: communicationRequest, sender, sendResponse: any) => {
    window.postMessage({
            type: "__D365_UITest_Content",
            data: request
        },
        "*"
    );
});

const s = document.createElement('script');

s.src = chrome.runtime.getURL('content.js');
s.onload = function() {
    (this as any).remove();
};

(document.head || document.documentElement).appendChild(s);