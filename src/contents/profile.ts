import type {
  PlasmoCSConfig,
} from "plasmo";
import profileScraper from "~services/profile-scraper";

// Plasmo Content Script Configuration
export const config: PlasmoCSConfig = {
  matches: ["*://linkedin.com/in/*connexik-scan=true", "*://www.linkedin.com/in/*connexik-scan=true"],
  all_frames: true,
  run_at: "document_idle", // Ensures script runs after the DOM is fully loaded
};

setTimeout(() => {
  profileScraper.scrapper();
}, 2000);