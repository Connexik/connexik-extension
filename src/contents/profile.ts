import type {
  PlasmoCSConfig,
} from "plasmo";
import profileScraper from "~services/profile-scraper";

// Plasmo Content Script Configuration
export const config: PlasmoCSConfig = {
  matches: ["*://linkedin.com/in/*connexik-scan=true*", "*://www.linkedin.com/in/*connexik-scan=true*"],
  all_frames: true,
  run_at: "document_idle", // Ensures script runs after the DOM is fully loaded
};

setTimeout(async () => {
  const urlObj = window.location
  const params = new URLSearchParams(urlObj.search);
  const redirectExists = params.get("connexik-redirect");

  let url: string;
  if(redirectExists === "accept"){
    url = 'https://www.linkedin.com/mynetwork/invitation-manager/';
  }
  await profileScraper.scrapper(url);
}, 2000);