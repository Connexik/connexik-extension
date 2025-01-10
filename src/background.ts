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
