import DataStore from "../datastore/session";
import type { ConnexikUser, UserDetails } from "~server/types/user.type";
import userServer from "~server/user";

const getCodeBlock = () => {
  // Helper function to query a specific document (top window or iframe)
  const queryCodeBlocks = (doc) => {
    try {
      const blocks = doc.querySelectorAll('code[id^="bpr-guid-"]');
      if (blocks.length) {
        return blocks;
      }
    } catch (error) {
      console.error("Error querying document:", error);
    }
  };

  // Query the top document
  let codeBlock = queryCodeBlocks(document);
  if(codeBlock){
    return codeBlock;
  }

  // Query all iframes
  const iframes = document.querySelectorAll("iframe");
  iframes.forEach((iframe) => {
    try {
      const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
      if (iframeDoc) {
        codeBlock = queryCodeBlocks(iframeDoc);
        if(codeBlock){
          return;
        }
      }
    } catch (error) {
      console.warn("Error accessing iframe document:", error);
    }
  });

  return codeBlock;
};

export const extractLoggedInUserDetails = async () => {
    const codeBlocks = getCodeBlock();
    if(!codeBlocks){
      return null;
    }

    let userDetails: UserDetails;
    codeBlocks.forEach((codeBlock) => {
      try {
        // Parse the JSON content of the <code> block
        const data = JSON.parse(codeBlock.textContent);

        // Check for the logged-in user's details
        if (data.data && data.data.$type === "com.linkedin.voyager.common.Me") {
          const miniProfileUrn = data.data["*miniProfile"];
          const userMiniProfile = data.included.find(
            (item: {entityUrn: string}) => item.entityUrn === miniProfileUrn
          );  
          if (userMiniProfile) {
            userDetails = {
              identifier: data.data.plainId,
              username: userMiniProfile.publicIdentifier,
              title: userMiniProfile.occupation,
              firstName: userMiniProfile.firstName,
              lastName: userMiniProfile.lastName,
              profileUrl: userMiniProfile.picture?.rootUrl + userMiniProfile.picture?.artifacts?.[1].fileIdentifyingUrlPathSegment
            };
          }
        }
      } catch (error) {
        console.error("Error parsing code block for Extension:", error);
      }
    });

    if(!userDetails){
        return;
    }

    const cacheData = await DataStore.getUserData();

    if(cacheData?.identifier === userDetails.identifier){
      return cacheData;
    }

    const connexikUser: ConnexikUser =  await userServer.getUserDetails(userDetails);

    await DataStore.setUserData(connexikUser);
    
    return connexikUser;
}

export const saveUserDetails = async (connexikUser: ConnexikUser) => {
  await DataStore.setUserData(connexikUser);
}