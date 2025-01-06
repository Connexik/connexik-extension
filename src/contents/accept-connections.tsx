import React, { useEffect, useState } from "react";
import type {
  PlasmoCSConfig,
  PlasmoCSUIJSXContainer,
  PlasmoRender,
} from "plasmo";
import { createRoot } from "react-dom/client";
import { extractLoggedInUserDetails } from "~services/user";
import type { ConnexikUser } from "~server/types/user.type";

// Plasmo Content Script Configuration
export const config: PlasmoCSConfig = {
  matches: [
    "*://linkedin.com/mynetwork/invitation-manager/*",
    "*://www.linkedin.com/mynetwork/invitation-manager/*",
  ],
  all_frames: true,
  run_at: "document_end", // Ensures script runs after the DOM is fully loaded
};

const AcceptConnections: React.FC = () => {
  const [filters, setFilters] = useState({
    byCompany: true,
    bySchool: true,
    byMutual: true,
    custom: "",
  });
  const [loggedInUser, setLoggedInUser] = useState<ConnexikUser>(null);
  const [isModalOpen, setModalOpen] = useState(false);

  // Fetch logged-in user details on component mount
  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const userDetails: ConnexikUser = await extractLoggedInUserDetails();
        setLoggedInUser(userDetails);
      } catch (error) {
        console.error("Failed to fetch logged-in user details:", error);
      }
    };

    fetchUserDetails();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked, type } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const applyFilters = () => {
    console.log("Filters Applied:", filters);
    console.log(loggedInUser)
    if (!loggedInUser.isScanned) {
      setModalOpen(true);
    }
    // Implement filtering logic here
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  const acceptAll = () => {
    console.log("Accept All clicked!");
    // Implement Accept All logic here
  };

  return (
    <div className="artdeco-card">
      <div style={{borderBottom: "1px solid rgba(0,0,0,.15)", padding: "1.3rem"}}>
        <h1 className="t-18 t-black t-normal">
          Accept Connections
        </h1>
      </div>
      <div style={{padding: "1.3rem", paddingTop: "0.3rem"}}>
        <div style={{ }}>
          <input
            type="checkbox"
            id="byCompany"
            name="byCompany"
            checked={filters.byCompany}
            onChange={handleChange}
            style={{ }}
          />
          <label htmlFor="byCompany">Accept by Company</label>
        </div>

        <div style={{  }}>
          <input
            type="checkbox"
            id="bySchool"
            name="bySchool"
            checked={filters.bySchool}
            onChange={handleChange}
            style={{  }}
          />
          <label htmlFor="bySchool">Accept by School</label>
        </div>

        <div style={{  }}>
          <input
            type="checkbox"
            id="byMutual"
            name="byMutual"
            checked={filters.byMutual}
            onChange={handleChange}
            style={{ }}
          />
          <label htmlFor="byMutual">Accept by Mutual Connections</label>
        </div>

        <input
          type="text"
          name="custom"
          placeholder="Custom Criteria with AI (ex. Senior Engineer)"
          value={filters.custom}
          onChange={handleChange}
          style={{
            marginTop: "1rem",
          }}
        />
      </div>
      <div className="text-align-center pv4" style={{borderTop: "1px solid rgba(0,0,0,.15)"}}>
        <button
          onClick={applyFilters}
          className="artdeco-button artdeco-button--primary mh2"
          disabled={
            !filters.byCompany &&
            !filters.bySchool &&
            !filters.byMutual &&
            filters.custom.trim() === ""
          }
          title={
            !filters.byCompany &&
            !filters.bySchool &&
            !filters.byMutual &&
            filters.custom.trim() === ""
              ? "Select at least one filter"
              : ""
          }
        >
          <span style={{ display: loggedInUser.isScanned ? "none" : "inherit" }}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="15"
              height="15"
              fill="currentColor"
              aria-hidden="true"
              style={{marginBottom: "2px"}}
            >
              <path d="M12 2a5 5 0 0 0-5 5v4H5c-1.1 0-2 .9-2 2v9c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-9c0-1.1-.9-2-2-2h-2V7a5 5 0 0 0-5-5zm-3 5a3 3 0 1 1 6 0v4H9V7zm3 10a2 2 0 1 1 0-4 2 2 0 0 1 0 4z" />
            </svg> 
          </span>
          <span style={{marginLeft:"5px"}}>Apply Filters</span>
        </button>
        <button
          onClick={acceptAll}
          className="artdeco-button artdeco-button--primary mh2"
          style={{
            backgroundColor: "var(--color-checked)"
          }}
        >
          Accept All
        </button>
      </div>
      <div style={{
        fontSize: "1rem",
        padding: "1rem",
        textAlign: "center",
      }}>Made with ❤️ by Connexik</div>
      {isModalOpen && (
        <div className="artdeco-modal-overlay artdeco-modal-overlay--is-top-layer">
          <div className="artdeco-modal artdeco-modal--layer-default" style={{width: "38%", top: "25%"}}>
            <button
              className="artdeco-button artdeco-button--circle artdeco-button--muted artdeco-button--2 artdeco-button--tertiary artdeco-modal__dismiss"
              onClick={closeModal}>        
              <svg role="none" aria-hidden="true" className="artdeco-button__icon " xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" data-supported-dps="24x24" data-test-icon="close-medium">
                <use href="#close-medium" width="24" height="24"></use>
              </svg>
              <span className="artdeco-button__text"></span>
            </button>
            <div>
              <div className="artdeco-modal__header">
                <h2>Profile Scan Required</h2>
              </div>
              <div className="pv2">
                <div className="pv1 ph5">
                  <p className="text-body-medium-bold pb2" style={{color: "var(--color-label)"}}>You need to scan your LinkedIn profile first to use <span style={{fontWeight: "bolder", color: "#0078c1"}}>Connexik AI</span> filters efficiently</p>
                  <p className="text-body-small" style={{color: "var(--color-label)"}}>Click the button below to proceed.</p>
                </div>
                <div className="text-align-center pv4" style={{borderBottom: "1px solid rgba(0,0,0,.15)"}}>
                  <button
                    onClick={() => { window.open(`https://www.linkedin.com/in/${loggedInUser.lIdentifier}/?connexik-scan=true`, "_self") }}
                    className="artdeco-button artdeco-button--primary mh1 pv2"
                  >
                    Scan My Profile
                  </button>
                  <button
                    onClick={acceptAll}
                    className="artdeco-button artdeco-button--primary mh1 pv2"
                    style={{
                      backgroundColor: "var(--color-checked)"
                    }}
                  >
                    Accept All Instead
                  </button>
                </div>
              </div>
            </div>
            <div style={{
              fontSize: "1rem",
              padding: "1rem",
              textAlign: "center",
            }}>Made with ❤️ by Connexik</div>
          </div>
        </div>
      )}
    </div>
  );
};

const waitForAsideElement = (): Promise<Element> => {
  return new Promise((resolve, reject) => {
    const container = document.querySelector(".application-outlet").querySelector(".authentication-outlet");

    if (!container) {
      reject(new Error(`Container ".application-outlet" not found`));
      return;
    }

    const observer = new MutationObserver(() => {
      const element = container.querySelector(".scaffold-layout__aside");
      if (element) {
        observer.disconnect(); // Stop observing once the element is found
        resolve(element);
      }
    });

    // Start observing the specified container for child changes
    observer.observe(container, {
      childList: true,
      subtree: true, // Observe descendants as well
      attributes: true, // Detect class additions
    });

    // Fallback timeout to prevent infinite wait
    setTimeout(() => {
      observer.disconnect();
      reject(new Error(`Timeout: Element ".scaffold-layout__aside" not found within`));
    }, 10000);
  });
};

export const render: PlasmoRender<PlasmoCSUIJSXContainer> = async () => {
  const rightSidebar = await waitForAsideElement();
  if (rightSidebar) {
    const filterContainer = document.createElement("div");
    filterContainer.id = "connexik-accept-connections";
    rightSidebar.prepend(filterContainer);

    const root = createRoot(filterContainer);
    root.render(<AcceptConnections />);
  }
};

export default AcceptConnections;
