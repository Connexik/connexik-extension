import React, { useEffect, useState } from "react";
import type {
  PlasmoCSConfig,
  PlasmoCSUIJSXContainer,
  PlasmoRender,
} from "plasmo";
import { createRoot } from "react-dom/client";
import MicroMatch from "micromatch"

import DataStore from "../datastore/session";

import profileScraper from "~services/profile-scraper";
import { extractLoggedInUserDetails } from "~services/user";
import type { ConnexikUser } from "~server/types/user.type";

// Plasmo Content Script Configuration
export const config: PlasmoCSConfig = {
  matches: ["*://linkedin.com/*", "*://www.linkedin.com/*"],
  all_frames: true,
  run_at: "document_end", // Ensures script runs after the DOM is fully loaded
};

const isOnProfile = (username: string) => {
  return MicroMatch.isMatch(
    window.location.href,
    [
      `*://linkedin.com/in/${username}/`,
      `*://www.linkedin.com/in/${username}/`,
      `*://linkedin.com/in/${username}/*`,
      `*://www.linkedin.com/in/${username}/*`,
    ]
  );
}

const TopBar = () => {
  const [loggedInUser, setLoggedInUser] = useState<ConnexikUser | null>(null);
  const [showTopBar, setShowTopBar] = useState<Boolean>(false);

  const changeLoggedInUser = (val: ConnexikUser) => {
    setLoggedInUser(val);
  }

  // Fetch logged-in user details on component mount
  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const userDetails: ConnexikUser = await extractLoggedInUserDetails();
        setLoggedInUser(userDetails);

        DataStore.registerChangeUserData(changeLoggedInUser)
      } catch (error) {
        console.error("Failed to fetch logged-in user details:", error);
      }
    };

    fetchUserDetails();
  }, []);

  const processTopBar = () => {
    setShowTopBar(isOnProfile(loggedInUser?.username));
  }

  let oldURL = window.location.href;
  const observer = new MutationObserver(() => {
    if(oldURL !== window.location.href){
      oldURL = window.location.href;
      processTopBar();
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
  
  useEffect(() => {
    if (loggedInUser) {
      processTopBar();
    }
  }, [loggedInUser]);
  
  const scanProfile = async () => {
    if(!loggedInUser){
      return
    }

    if(isOnProfile(loggedInUser?.username)){
      await profileScraper.scrapper();
    } else {
      window.open(`https://www.linkedin.com/in/${loggedInUser?.username}/?connexik-scan=true`, "_self")
    }
  };

  const goToFeatures = (feature: string) => {
    console.log(feature)
    if(feature === "accept"){
      if(!MicroMatch.isMatch(window.location.href, [`*://linkedin.com/mynetwork/invitation-manager/*`, `*://www.linkedin.com/mynetwork/invitation-manager/*`])){
        window.open(`${window.location.origin}/mynetwork/invitation-manager/`, "_self");
      }
    } else if (feature === "grow"){

    } else if(feature === "referral"){

    }
  }

  return loggedInUser && (
    <div className="global-nav__me artdeco-dropdown artdeco-dropdown--placement-bottom artdeco-dropdown--justification-left">
      <button onClick={() => setShowTopBar(!showTopBar)}>
        <img className="global-nav__me-photo evi-image" style={{width: "25px", height: "30px", minWidth: "15px", marginRight: "15%", marginBottom: "-5%"}}
          src={chrome.runtime.getURL(`assets/connexik-ai-no-bg.png`)} />
        <span className="t-12 global-nav__primary-link-text" title="Connexik AI">
          Connexik AI
          <svg role="none" aria-hidden="true" className="global-nav__icon global-nav__icon--small" 
            style={{marginTop:"-2%"}}
            xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" 
            data-supported-dps="16x16" data-test-icon="caret-small">
            <use href="#caret-small" width="16" height="16"></use>
          </svg>
        </span>
      </button>
      <div id="connexik-ai-dropdown" style={{maxWidth: "300px", display: showTopBar ? "inherit": "none"}}
        className="global-nav__me-content artdeco-dropdown__content artdeco-dropdown__content--is-open artdeco-dropdown--is-dropdown-element artdeco-dropdown__content--justification-right artdeco-dropdown__content--placement-bottom">
        <div className="artdeco-dropdown__content-inner">
          <header className="p2">
            <div className="artdeco-entity-lockup artdeco-entity-lockup--size-4">
              <div className="artdeco-entity-lockup__image artdeco-entity-lockup__image--type-circle">
                <img width="70" height="70" className="global-nav__me-photo evi-image"
                  src={loggedInUser?.profileUrl} />
              </div>
              <div className="artdeco-entity-lockup__content">
                <div className="artdeco-entity-lockup__title inline">
                  {loggedInUser?.firstName} {loggedInUser?.lastName}             
                </div>
                <div className="artdeco-entity-lockup__subtitle">
                  {loggedInUser?.title}
                </div>
              </div>
            </div>
            <div className="display-flex mt2 full-width">
              <a onClick={scanProfile}
                className="ember-view active full-width artdeco-button artdeco-button--secondary artdeco-button--1">
                {loggedInUser?.isScanned ? "Rescan Profile": "Scan My Profile"}
              </a>
            </div>
          </header>
          <ul className="global-nav__secondary-items" aria-label="Me menu"> 
            <li className="global-nav__secondary-item">
              <h3 className="global-nav__secondary-title">
                Features
              </h3>
              <ul className="mv1" aria-label="Account">
                <li className="global-nav__secondary-item">
                  <button onClick={() => goToFeatures("accept")}
                    className="global-nav__secondary-faux-link global-nav__secondary-faux-link--hoverable global-nav__secondary-faux-link--max-width" type="button">
                    Accept My Connections
                  </button>
                </li>
                <li className="global-nav__secondary-item">
                  <button onClick={() => goToFeatures("grow")}
                    className="global-nav__secondary-faux-link global-nav__secondary-faux-link--hoverable global-nav__secondary-faux-link--max-width" type="button">
                    Grow My Network
                  </button>
                </li>
                <li className="global-nav__secondary-item">
                  <button onClick={() => goToFeatures("referral")}
                    className="global-nav__secondary-faux-link global-nav__secondary-faux-link--hoverable global-nav__secondary-faux-link--max-width" type="button">
                    Referral Wizard
                  </button>
                </li>
              </ul>
            </li>
          </ul>
          <div style={{fontSize: "1rem", "padding": "0.8rem", "textAlign": "center"}}>Made with ❤️ by Connexik</div>
        </div>
      </div>
    </div>
  );
};

const waitForElement = (): Promise<Element> => {
  return new Promise((resolve, reject) => {
    const container = document.querySelector(".application-outlet");

    if (!container) {
      reject(new Error(`Container ".application-outlet" not found`));
      return;
    }

    // Immediate check for the element before observing
    const preCheck = container.querySelector("ul.global-nav__primary-items");
    if (preCheck) {
      resolve(preCheck);
      return;
    }

    const observer = new MutationObserver(() => {
      const element = container.querySelector("#global-nav");
      if (element) {
        observer.disconnect(); // Stop observing once the element is found

        const observerInside = new MutationObserver(() => {
          const internalElement = element.querySelector("ul.global-nav__primary-items");
          if (internalElement) {
            observerInside.disconnect();
            resolve(internalElement);
          }
        });

        observerInside.observe(element, {
          childList: true,
          subtree: true,
        });

        // Fallback timeout for internal observer
        setTimeout(() => {
          observerInside.disconnect();
          reject(new Error(`Timeout: Element "ul.global-nav__primary-items" not found`));
        }, 60000);
      }
    });

    observer.observe(container, {
      childList: true,
      subtree: true,
    });

    // Fallback timeout for outer observer
    setTimeout(() => {
      observer.disconnect();
      reject(new Error(`Timeout: Element "#global-nav" not found`));
    }, 60000);
  });
};

export const render: PlasmoRender<PlasmoCSUIJSXContainer> = async () => {
  const globalListItems = await waitForElement();
  if (globalListItems) {
    const globalItem = document.createElement("li");
    globalItem.id = "connexik-profile-item";
    globalItem.className = "global-nav__primary-item"
    globalItem.style.position = "absolute"
    globalItem.style.right = "0";
    globalItem.style.top = "6%"
    globalItem.style.borderLeft = "1px solid var(--color-border-faint)"
    globalItem.style.paddingLeft = "1%"
    globalItem.style.paddingRight = "1.5%"
    globalListItems.append(globalItem);

    const root = createRoot(globalItem);
    root.render(<TopBar />);
  }
};

export default TopBar;
