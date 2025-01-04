import React, { useEffect } from "react";
import type {
  PlasmoCSConfig,
  PlasmoCSUIJSXContainer,
  PlasmoRender,
} from "plasmo";
import { createRoot } from "react-dom/client";
import profileScraper from "~services/profile-scraper";

// Plasmo Content Script Configuration
export const config: PlasmoCSConfig = {
  matches: ["*://linkedin.com/*", "*://www.linkedin.com/*"],
  all_frames: true,
  run_at: "document_end", // Ensures script runs after the DOM is fully loaded
};

const ExtractButton = () => {
  const [isButtonVisible, setIsButtonVisible] = React.useState(false);

  // Function to check if the page is a profile page and contains edit elements
  const checkIfButtonShouldShow = () => {
    const isProfilePage = /\/in\//.test(window.location.pathname);
    const hasEditElements =
      !!document.querySelector('[class*="-edit"]');

    return isProfilePage && hasEditElements;
  };

  useEffect(() => {
    // Show or hide the button based on the criteria
    const observer = new MutationObserver(() => {
      setIsButtonVisible(checkIfButtonShouldShow());
    });

    // Observe the DOM for changes
    observer.observe(document.body, { childList: true, subtree: true });

    // Cleanup the observer on component unmount
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    // Hide the button if the user navigates to another page
    const handleNavigation = () => {
      setIsButtonVisible(checkIfButtonShouldShow());
    };

    // Listen to popstate (for navigation changes)
    window.addEventListener("popstate", handleNavigation);

    // Cleanup on unmount
    return () => window.removeEventListener("popstate", handleNavigation);
  }, [])

  if (!isButtonVisible) {
    return null;
  }

  return (
    <div>
      <button
        onClick={profileScraper.scrapper}
        style={{
          position: "fixed",
          top: "10px",
          right: "10px",
          backgroundColor: "#0073b1",
          color: "#fff",
          padding: "10px 20px",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        Extract Profile Data
      </button>
    </div>
  );
};

export const render: PlasmoRender<PlasmoCSUIJSXContainer> = async ({
  anchor,
  createRootContainer,
}) => {
  const rootContainer = await createRootContainer(anchor);
  const root = createRoot(rootContainer);
  root.render(<ExtractButton />);
};

export default ExtractButton;
