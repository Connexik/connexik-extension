import OverlayManager from "~components/loader";
import type { ConnexikUser } from "~server/types/user.type";
import { extractLoggedInUserDetails, saveUserDetails } from "./user";

import userServer from "~server/user";

const wait = (time: number) => new Promise(res => setTimeout(res, time * 1000));

const processor = async (redirectUrl: string) =>  {    
    const userDetails: ConnexikUser = await extractLoggedInUserDetails();

    const mainHTML = Array.from(document.querySelectorAll("main")).find((main) => {
      return main.querySelectorAll("section.artdeco-card").length > 1;
    }).outerHTML;

    OverlayManager.show("Convex AI is now analysing the profile...");

    await userServer.scanUser(userDetails.connexikId, mainHTML);
    
    await wait(1);
    OverlayManager.showSuccess();

    await wait(3);
    if(redirectUrl){
      window.open(redirectUrl, "_self")
    } else {
      OverlayManager.hide();
    }
}

const scrapper = (redirectUrl: string = "") => new Promise((res) => {
  OverlayManager.show("Extracting data from LinkedIn...");

  setTimeout(async () => res(await processor(redirectUrl)), 0);
})

export default {
    scrapper
}