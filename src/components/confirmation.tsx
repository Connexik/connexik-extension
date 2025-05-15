import React, { useEffect, useState } from "react"
import { createRoot } from "react-dom/client"

import "../style.css"

import connections from "~server/connections"
import type { ConnexikUser } from "~server/types/user.type"

// ConfirmationDialog Component
export const ConfirmationDialog: React.FC<{
  onClose: () => void
  processCohortCards: (type: string, remainingCount: number) => () => void
  loggedInUser: ConnexikUser
}> = ({ onClose, loggedInUser, processCohortCards }) => {
  const [scannedModal, setScannedModal] = useState(false)
  const [remainingCount, setRemainingCount] = useState<number>(null)
  const [isDisabled, setIsDisabled] = useState(false);

  useEffect(() => {
    const fetchCount = async () => {
      const count = await connections.growConnectionsCount(
        loggedInUser?.connexikId
      )
      setRemainingCount(count)
    }
    fetchCount()
  }, [])

  const isScanned = loggedInUser?.isScanned

  const onClick = (type: string) => () => {
    setIsDisabled(true);
    if (!isScanned && type === "ai") {
      setScannedModal(true)
      return
    }

    onClose()
    processCohortCards(type, remainingCount)
  }

  return scannedModal ? (
    <ScanProfileDialog
      onClick={onClick("ai")}
      onClose={onClose}
      username={loggedInUser?.username}
    />
  ) : (
    <div className="connexik-modal-overlay">
      {remainingCount === null ?
        <div className="connexik-spinner"></div> : (
          <div className="connexik-modal-container">
            <button className="connexik-modal-close-btn" onClick={onClose}>
              ✕
            </button>
            <div className="connexik-modal-header">
              <h2>Ready to grow your network?</h2>
            </div>
            <div className="connexik-modal-body">
              <p>
                LinkedIn loves quality over quantity, and so do we! So, You can
                send 50–60 connection requests daily and 300–400 weekly. 🌟
              </p>
              <br />
              <p>
                {isScanned &&
                  (remainingCount ? (
                    <strong>
                      Good news: You still have {remainingCount} requests left for
                      today.
                    </strong>
                  ) : (
                    <strong>Bad news: You've reached today's limit. 🚫</strong>
                  ))}
              </p>
            </div>
            <div className="connexik-modal-footer">
              {!!remainingCount && (
                <div
                  style={{
                    width: "100%",
                    textAlign: "center",
                    display: "flex",
                    justifyContent: "center",
                    gap: "10px"
                  }}>
                  <button
                    className="connexik-btn-primary"
                    onClick={onClick("ai")}
                    disabled={isDisabled}>
                    <span style={{ display: isScanned ? "none" : "inherit" }}>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        width="15"
                        height="15"
                        fill="currentColor"
                        aria-hidden="true"
                        style={{ marginBottom: "2px" }}>
                        <path d="M12 2a5 5 0 0 0-5 5v4H5c-1.1 0-2 .9-2 2v9c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-9c0-1.1-.9-2-2-2h-2V7a5 5 0 0 0-5-5zm-3 5a3 3 0 1 1 6 0v4H9V7zm3 10a2 2 0 1 1 0-4 2 2 0 0 1 0 4z" />
                      </svg>
                    </span>
                    Do it with <strong>Connexik AI</strong>
                  </button>
                  <button
                    className="connexik-btn-secondary"
                    onClick={onClick("all")} disabled={isDisabled}
                  >
                    Do It for All
                  </button>
                  <button className="connexik-btn-ternary" onClick={onClose} disabled={isDisabled}
                  >
                    I'll Come Back Later
                  </button>
                </div>
              )}
              {!remainingCount && (
                <button className="connexik-btn-primary" onClick={onClose} disabled={isDisabled}
                >
                  Got It! I'll Try Tomorrow
                </button>
              )}
            </div>
            <div className="connexik-modal-footer-note">
              Made with ❤️ by Connexik
            </div>
          </div>
        )}
    </div>
  )
}

export const ScanProfileDialog: React.FC<{
  onClick: () => void
  onClose: () => void
  username: string
}> = ({ onClick, onClose, username }) => {
  return (
    <div className="connexik-modal-overlay">
      <div className="connexik-modal-container">
        <button className="connexik-modal-close-btn" onClick={onClose}>
          ✕
        </button>
        <div className="connexik-modal-header">
          <h2>Profile Scan Required</h2>
        </div>
        <div className="connexik-modal-body">
          <p>
            You need to scan your LinkedIn profile first to use
            <span style={{ fontWeight: "bolder", color: "#0078c1" }}>
              Connexik AI
            </span>
            filters efficiently
          </p>
        </div>
        <div className="connexik-modal-footer">
          <button
            className="connexik-btn-primary"
            onClick={() => {
              window.open(
                `https://www.linkedin.com/in/${username}/?connexik-scan=true&connexik-redirect=accept`,
                "_self"
              )
            }}>
            Scan My Profile
          </button>
          <button className="connexik-btn-secondary" onClick={onClick}>
            Accept All Instead
          </button>
        </div>
        <div className="connexik-modal-footer-note">
          Made with ❤️ by Connexik
        </div>
      </div>
    </div>
  )
}

// show Method
export const showConfirmationDialog = async (
  ele,
  loggedInUser,
  processCohortCards
) => {
  // Create a container dynamically
  const customDiv = document.createElement("div")
  ele.appendChild(customDiv)

  customDiv.id = "connexik-network-confirmation"
  // Create a React root for rendering
  const root = createRoot(customDiv)

  // Handle dialog close and cleanup
  const closeModal = () => {
    root.unmount() // Unmount the React component
    ele.removeChild(customDiv) // Remove the container
  }

  // Render the ConfirmationDialog with a close handler
  root.render(
    <ConfirmationDialog
      onClose={closeModal}
      processCohortCards={processCohortCards}
      loggedInUser={loggedInUser}
    />
  )
}
