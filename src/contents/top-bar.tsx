import MicroMatch from "micromatch"
import type {
  PlasmoCSConfig,
  PlasmoCSUIJSXContainer,
  PlasmoRender
} from "plasmo"
import { useEffect, useState } from "react"
import { createRoot } from "react-dom/client"

import { INTER_EVENTS, SESSION_STATUS } from "~config"
import type { ConnexikUser, Session } from "~server/types/user.type"
import { getSession, signInWithLinkedIn } from "~services/auth"
import profileScraper from "~services/profile-scraper"
import { extractLoggedInUserDetails } from "~services/user"
import { wait } from "~utils/common"

import DataStore from "../datastore/session"

import "../style.css"

// Plasmo Content Script Configuration
export const config: PlasmoCSConfig = {
  matches: ["*://linkedin.com/*", "*://www.linkedin.com/*"],
  exclude_matches: [
    "*://linkedin.com/preload/",
    "*://www.linkedin.com/preload/"
  ],
  all_frames: true,
  run_at: "document_end" // Ensures script runs after the DOM is fully loaded
}

const isOnProfile = (username: string) => {
  return MicroMatch.isMatch(window.location.href, [
    `*://linkedin.com/in/${username}/`,
    `*://www.linkedin.com/in/${username}/`,
    `*://linkedin.com/in/${username}/*`,
    `*://www.linkedin.com/in/${username}/*`
  ])
}

const SVGIcon = ({
  size = 12,
  color = "currentColor",
  className = "",
  ...props
}) => {
  return (
    <div
      className={`inline-block ${className}`}
      style={{ width: size, height: size }}
      {...props}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        width={size}
        height={size}
        fill="none"
        stroke={color}
        strokeWidth="2"
        className="transition-colors duration-200">
        {/* Circle background */}
        <circle cx="12" cy="12" r="11" />

        {/* "i" dot */}
        <circle cx="12" cy="7" r="1.5" fill={color} stroke="none" />

        {/* "i" stem */}
        <rect
          x="11"
          y="10"
          width="2"
          height="8"
          rx="1"
          fill={color}
          stroke="none"
        />
      </svg>
    </div>
  )
}

const TopBar = () => {
  const [sessionData, setSessionData] = useState<Session>(null)
  const [loggedInUser, setLoggedInUser] = useState<ConnexikUser | null>(null)
  const [showTopBar, setShowTopBar] = useState<Boolean>(false)
  const [isTooltipVisible, setTooltipVisible] = useState(false)

  const changeLoggedInUser = (val: ConnexikUser) => {
    setLoggedInUser(val)
  }

  // Fetch session data on component mount
  useEffect(() => {
    const checkSession = async () => {
      const session = await getSession()
      if (session) {
        setSessionData(session)
      }
    }

    checkSession()
  }, [])

  // Fetch logged-in user details on component mount
  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const userDetails: ConnexikUser = await extractLoggedInUserDetails()
        setLoggedInUser(userDetails)

        DataStore.registerChangeUserData(changeLoggedInUser)
      } catch (error) {
        console.error("Failed to fetch logged-in user details:", error)
      }
    }

    fetchUserDetails()
  }, [])

  const processTopBar = () => {
    setShowTopBar(isOnProfile(loggedInUser?.username))
  }

  let oldURL = window.location.href
  const observer = new MutationObserver(() => {
    if (oldURL !== window.location.href) {
      oldURL = window.location.href
      processTopBar()
    }
  })
  observer.observe(document.body, { childList: true, subtree: true })

  useEffect(() => {
    if (loggedInUser) {
      processTopBar()
    }
  }, [loggedInUser])

  const scanProfile = async () => {
    if (!loggedInUser) {
      return
    }

    if (isOnProfile(loggedInUser?.username)) {
      await profileScraper.scrapper()
    } else {
      const safeUsername = encodeURIComponent(loggedInUser?.username || "")
      window.open(
        `https://www.linkedin.com/in/${safeUsername}/?connexik-scan=true`,
        "_self"
      )
    }
  }

  const goToFeatures = (feature: string) => {
    if (feature === "accept") {
      if (
        !MicroMatch.isMatch(window.location.href, [
          `*://linkedin.com/mynetwork/invitation-manager/*`,
          `*://www.linkedin.com/mynetwork/invitation-manager/*`
        ])
      ) {
        window.open(
          `${window.location.origin}/mynetwork/invitation-manager/`,
          "_self"
        )
      }
    } else if (feature === "grow") {
      const matched = MicroMatch.isMatch(oldURL, ["*/mynetwork/grow*"])
      if (!matched) {
        window.open(`${window.location.origin}/mynetwork/grow`, "_self")
      }
    } else if (feature === "referral") {
    }
  }

  const handleSetTopBar = () => {
    if (!sessionData) {
      chrome.runtime.sendMessage({ action: INTER_EVENTS.OPEN_POPUP })
    }
    setShowTopBar(!showTopBar)
  }

  return (
    <div
      id="connexik-profile-item"
      style={{
        position: "absolute",
        right: "1.2%",
        fontFamily:
          "-apple-system,system-ui,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,Fira Sans,Ubuntu,Oxygen,Oxygen Sans,Cantarell,Droid Sans,Apple Color Emoji,Segoe UI Emoji,Segoe UI Emoji,Segoe UI Symbol,Lucida Grande,Helvetica,Arial,sans-serif"
      }}>
      <button
        onClick={handleSetTopBar}
        style={{
          border: 0,
          background: "transparent",
          paddingTop: "4%",
          paddingBottom: "4%",
          borderLeft: "1px solid rgb(140 140 140 / .2)",
          padding: "4% 10%",
          width: "max-content",
          cursor: "pointer",
          backgroundColor: !sessionData ? "#cd5c5c85" : "#ffffff00"
        }}>
        <img
          style={{
            width: "25px",
            height: "30px",
            minWidth: "15px",
            marginRight: "15%",
            marginBottom: "-5%"
          }}
          src={chrome.runtime.getURL(`assets/connexik-ai-no-bg.png`)}
        />
        <span
          style={{
            fontSize: "1.2rem",
            color: "rgb(0 0 0 / .6)",
            display: "flex",
            alignItems: "center",
            lineHeight: "1.33333",
            fontFamily:
              "-apple-system, system-ui, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica Neue, Fira Sans, Ubuntu, Oxygen, Oxygen Sans, Cantarell, Droid Sans, Apple Color Emoji, Segoe UI Emoji, Segoe UI Emoji, Segoe UI Symbol, Lucida Grande, Helvetica, Arial, sans-serif"
          }}
          title="Connexik AI">
          Connexik AI
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            aria-hidden="true"
            data-supported-dps="16x16"
            viewBox="0 0 16 16"
            data-token-id="379"
            width="16"
            height="16"
            style={{
              width: "16px",
              minWidth: "16px",
              height: "16px",
              minHeight: "16px"
            }}>
            <path d="M8 11 3 6h10Z"></path>
          </svg>
        </span>
      </button>
      <div
        id="connexik-ai-dropdown"
        style={{
          maxWidth: "300px",
          display: showTopBar ? "inherit" : "none",
          position: "absolute",
          inset: "calc(100% + 8px) 0px auto auto",
          maxHeight: "calc(-64px + 100vh)",
          overflowY: "auto",
          transition:
            "visibility 25ms linear, z-index 25ms linear, opacity 334ms cubic-bezier(0, 0, 0.2, 1), 25ms",
          zIndex: "999",
          width: "max-content",
          color: "black",
          borderRadius: "0.8rem 0 0.8rem 0.8rem",
          backgroundColor: "#fff",
          boxShadow:
            "rgba(140, 140, 140, 0.2) 0px 0px 0px 1px, rgba(0, 0, 0, 0.3) 0px 4px 4px",
          right: 0,
          fontFamily:
            "-apple-system,system-ui,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,Fira Sans,Ubuntu,Oxygen,Oxygen Sans,Cantarell,Droid Sans,Apple Color Emoji,Segoe UI Emoji,Segoe UI Emoji,Segoe UI Symbol,Lucida Grande,Helvetica,Arial,sans-serif"
        }}>
        <div
          style={{
            transition:
              "visibility 0s linear 25ms, z-index 0s linear 25ms, opacity 334ms cubic-bezier(0,0,.2,1), 25ms",
            width: "100%"
          }}>
          {sessionData?.status !== SESSION_STATUS.ACTIVE ? (
            !sessionData ? (
              <div style={{ textAlign: "center", padding: "10px" }}>
                <h3>Sign in with LinkedIn to get started</h3>
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "5px 8px" }}>
                <h3>
                  Welcome {sessionData.firstName} {sessionData.lastName}!
                </h3>
                <h3 style={{ marginBottom: "16px", marginTop: "16px" }}>
                  {sessionData.status === SESSION_STATUS.QUEUED
                    ? "You're still in queue for access. For early access, ping us at "
                    : "You're blocked for access. For access, ping us at "}
                  <a
                    href="mailto:theconnexik@gmail.com"
                    style={{ color: "#0073b1" }}>
                    theconnexik@gmail.com
                  </a>
                </h3>
              </div>
            )
          ) : (
            loggedInUser && (
              <div>
                <header style={{ padding: ".8rem", display: "block" }}>
                  <div style={{ display: "flex" }}>
                    <div style={{ position: "relative", flexShrink: 0 }}>
                      <img
                        style={{
                          borderRadius: "50%",
                          backgroundColor: "#fff",
                          color: "rgb(0 0 0/.9)",
                          border: "none",
                          boxShadow: "none",
                          position: "relative",
                          width: "56px",
                          height: "56px",
                          boxSizing: "border-box",
                          backgroundClip: "content-box",
                          maxHeight: "100%",
                          maxWidth: "100%",
                          verticalAlign: "bottom",
                          overflow: "hidden",
                          transform: "scale(1)",
                          transition: "transform .2s ease-in-out",
                          minWidth: "24px"
                        }}
                        width="70"
                        height="70"
                        src={loggedInUser?.profileUrl}
                      />
                    </div>
                    <div style={{ paddingLeft: "0.8rem", alignSelf: "center" }}>
                      <div
                        style={{
                          fontWeight: "600",
                          fontSize: "1.6rem",
                          lineHeight: 1.5,
                          display: "inline",
                          color: "rgb(0 0 0/.9)"
                        }}>
                        {loggedInUser?.firstName} {loggedInUser?.lastName}
                      </div>
                      <div
                        style={{
                          fontSize: "1.4rem",
                          lineHeight: "1.42857",
                          color: "rgb(0 0 0/.9)",
                          fontWeight: "400",
                          display: "block"
                        }}>
                        {loggedInUser?.title}
                      </div>
                    </div>
                  </div>
                  <div
                    style={{
                      width: "100%",
                      display: "flex",
                      marginTop: ".8rem"
                    }}>
                    <a
                      className="connexik-top-bar-button"
                      onClick={scanProfile}>
                      {loggedInUser?.isScanned
                        ? "Rescan Profile"
                        : "Scan My Profile"}
                    </a>
                  </div>
                </header>
                <ul
                  style={{
                    maxHeight: "none",
                    listStyleType: "none",
                    listStyle: "none",
                    padding: "0",
                    margin: 0
                  }}>
                  <li
                    style={{
                      padding: "0 2px"
                    }}>
                    <h3
                      style={{
                        backgroundColor: "hsla(0,0%,100%,0)",
                        borderTop: "1px solid rgb(140 140 140/.2)",
                        fontSize: "1.6rem",
                        display: "block",
                        lineHeight: "2rem",
                        fontWeight: "600",
                        padding: "1.2rem 1.2rem 0",
                        textTransform: "none",
                        margin: 0
                      }}>
                      Features
                    </h3>
                    <style>
                      {`
                        .connexik-top-bar-list li button:hover{ 
                          text-decoration: underline; 
                        }
                          
                        .connexik-top-bar-button {
                          background: transparent;
                          margin: 0;
                          font-size: 1.4rem;
                          min-height: 2.4rem;
                          padding: 0.2rem 0.8rem;
                          line-height: 2rem;
                          transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
                          align-items: center;
                          border: none;
                          box-sizing: border-box;
                          cursor: pointer;
                          font-weight: 600;
                          max-width: 480px;
                          overflow: hidden;
                          text-align: center;
                          transition-property: background-color, box-shadow, color;
                          vertical-align: middle;
                          background-color: transparent;
                          color: #0a66c2;
                          box-shadow: inset 0 0 0 1px #0a66c2;
                          text-decoration: none;
                          width: 100%;
                          border-radius: 1.6rem;
                          padding-left: 1.2rem;
                          padding-right: 1.2rem;
                          min-width: 0;
                        }

                        .connexik-top-bar-button:hover {
                          background-color: #0b66c224;
                        }
                      `}
                    </style>
                    <ul
                      style={{
                        maxHeight: "none",
                        listStyleType: "none",
                        marginTop: "0.4rem",
                        marginBottom: "0.4rem",
                        listStyle: "none",
                        padding: 0
                      }}
                      className="connexik-top-bar-list">
                      <li style={{ padding: "0 2px" }}>
                        <button
                          style={{
                            width: "100%",
                            alignItems: "center",
                            display: "flex",
                            justifyContent: "space-between",
                            paddingRight: "0.4rem",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            fontSize: "1.4rem",
                            fontWeight: "400",
                            lineHeight: "2rem",
                            padding: "0.4rem 1.2rem",
                            color: "rgb(0 0 0/.6)",
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            marginBottom: 0
                          }}
                          onClick={() => goToFeatures("accept")}
                          type="button">
                          Accept My Connections
                        </button>
                      </li>
                      <li style={{ padding: "0 2px" }}>
                        <button
                          style={{
                            width: "100%",
                            alignItems: "center",
                            display: "flex",
                            justifyContent: "space-between",
                            paddingRight: "0.4rem",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            fontSize: "1.4rem",
                            fontWeight: "400",
                            lineHeight: "2rem",
                            padding: "0.4rem 1.2rem",
                            color: "rgb(0 0 0/.6)",
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            marginBottom: 0
                          }}
                          onClick={() => goToFeatures("grow")}
                          type="button">
                          Grow My Network
                        </button>
                      </li>
                      <li style={{ padding: "0 2px" }}>
                        <button
                          style={{
                            width: "100%",
                            alignItems: "center",
                            display: "flex",
                            justifyContent: "space-between",
                            paddingRight: "0.4rem",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            fontSize: "1.4rem",
                            fontWeight: "400",
                            lineHeight: "2rem",
                            padding: "0.4rem 1.2rem",
                            color: "rgb(0 0 0/.6)",
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            marginBottom: 0
                          }}
                          onMouseEnter={() => setTooltipVisible(true)}
                          onMouseLeave={() => setTooltipVisible(false)}
                          // onClick={() => goToFeatures("referral")}
                          type="button">
                          Referral Wizard
                          <span
                            style={{
                              marginRight: "auto",
                              marginLeft: "0.5rem",
                              marginTop: "-0.5rem",
                              display: "inline-block",
                              position: "relative",
                              cursor: "pointer"
                            }}
                            className="connexik-info-icon"
                            onMouseEnter={() => setTooltipVisible(true)}
                            onMouseLeave={() => setTooltipVisible(false)}>
                            <SVGIcon />
                            {isTooltipVisible && (
                              <span
                                style={{
                                  position: "fixed",
                                  top: "30%",
                                  right: "-5%",
                                  transform: "translateX(-50%)",
                                  marginBottom: "0.5rem",
                                  background: "#fff",
                                  color: "#000",
                                  padding: "0.5rem 1rem",
                                  borderRadius: "4px",
                                  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
                                  fontSize: "1.2rem",
                                  lineHeight: "1.4rem",
                                  whiteSpace: "normal",
                                  width: "220px",
                                  textAlign: "center",
                                  zIndex: "1000"
                                }}
                                className="tooltip">
                                <strong>Coming Soon</strong>
                                <br />
                                You will be able to get referrals from the
                                company's employees you're applying for.
                              </span>
                            )}
                          </span>
                        </button>
                      </li>
                    </ul>
                  </li>
                </ul>
              </div>
            )
          )}
          <div
            style={{
              fontSize: "1rem",
              padding: "0.8rem",
              textAlign: "center"
            }}>
            Made with ❤️ by Connexik
          </div>
        </div>
      </div>
    </div>
  )
}

const waitForElement = (): Promise<Element> => {
  return new Promise((resolve, reject) => {
    let container = document.querySelector(".application-outlet")

    if (!container) {
      return resolve(null)
    }

    // Immediate check for the element before observing
    const preCheck = container.querySelector("ul.global-nav__primary-items")
    if (preCheck) {
      resolve(preCheck)
      return
    }

    const observer = new MutationObserver(() => {
      const element = container.querySelector("#global-nav")
      if (element) {
        observer.disconnect() // Stop observing once the element is found

        const observerInside = new MutationObserver(() => {
          const internalElement = element.querySelector(
            "ul.global-nav__primary-items"
          )
          if (internalElement) {
            observerInside.disconnect()
            resolve(internalElement)
          }
        })

        observerInside.observe(element, {
          childList: true,
          subtree: true
        })

        // Fallback timeout for internal observer
        setTimeout(() => {
          observerInside.disconnect()
          reject(
            new Error(
              `Timeout: Element "ul.global-nav__primary-items" not found`
            )
          )
        }, 60000)
      }
    })

    observer.observe(container, {
      childList: true,
      subtree: true
    })

    // Fallback timeout for outer observer
    setTimeout(() => {
      observer.disconnect()
      reject(new Error(`Timeout: Element "#global-nav" not found`))
    }, 60000)
  })
}

export const render: PlasmoRender<PlasmoCSUIJSXContainer> = async ({
  anchor,
  createRootContainer
}) => {
  const globalListItems = await waitForElement()

  if (!globalListItems) {
    await wait(3)
  }

  const rootContainer = await createRootContainer(anchor)
  const root = createRoot(rootContainer)
  root.render(<TopBar />)
}

export default TopBar
