import { INTER_EVENTS } from "~config";
import localStore from "~datastore/local";

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
    console.log("background - ", request, sender)
    // if (request.action === INTER_EVENTS.GET_SESSION) {
    //     const response = await localStore.getLinkedInUserData();
    //     console.log("background response - ", response)
    //     if (response.success) {
    //         const user = response.data ? (Object.keys(response.data).length > 0 ? response.data : null) : null;
    //         sendResponse({ success: true, user });
    //     } else {
    //         sendResponse({ success: false, error: "Unknown action" });
    //     }
    // } else if (request.action === INTER_EVENTS.SET_SESSION) {
    //     try {
    //         const response = await localStore.setLinkedInUserData(request.payload);
    //         sendResponse(response);
    //     } catch (error) {
    //         sendResponse({ success: false, error: error.message });
    //     }
    // } else 
    if(request.action === INTER_EVENTS.OPEN_POPUP) {
        chrome.windows.create({
            url: chrome.runtime.getURL("popup.html"),
            type: "popup",
            width: 400,
            height: 300
        });
    } else {
        sendResponse({ success: false, error: "Unknown action" });
    }
    return true;
});

// chrome.runtime.onInstalled.addListener(() => {
//   chrome.declarativeNetRequest.updateDynamicRules(
//     {
//       addRules: [
//         {
//           id: 1,
//           priority: 1,
//           action: {
//             type: "redirect",
//             redirect: {
//               regexSubstitution: "https://www.linkedin.com/voyager/api/graphql?includeWebMetadata=true&variables=(\\1count:0\\3)&queryId=\\4"
//             }
//           },
//           condition: {
//             regexFilter: "^https://www\\.linkedin\\.com/voyager/api/graphql\\?includeWebMetadata=true&variables=\\((.*?count:)(\\d+)(.*)\\)&queryId=(.*)$",
//             resourceTypes: ["xmlhttprequest"]
//           }
//         }
//       ],
//       removeRuleIds: [1] // Optional cleanup of old rules
//     },
//     () => {
//       console.log("Dynamic rule added: Replaced count=10 with count=0");
//     }
//   );
// });