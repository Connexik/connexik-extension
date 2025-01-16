import MicroMatch from "micromatch"
import type {
  PlasmoCSConfig,
  PlasmoCSUIJSXContainer,
  PlasmoRender
} from "plasmo"
import { useEffect, useState } from "react"
import { createRoot } from "react-dom/client"

import type { ConnexikUser } from "~server/types/user.type"
import profileScraper from "~services/profile-scraper"
import { extractLoggedInUserDetails } from "~services/user"

import DataStore from "../datastore/session"
import { wait } from "~utils/common"

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

const TopBar = () => {
  const [loggedInUser, setLoggedInUser] = useState<ConnexikUser | null>(null)
  const [showTopBar, setShowTopBar] = useState<Boolean>(false)

  const changeLoggedInUser = (val: ConnexikUser) => {
    setLoggedInUser(val)
  }

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
    } else if (feature === "referral") {
    }
  }

  const handleSetTopBar = () => {
    setShowTopBar(!showTopBar)
  }

  return (
    loggedInUser && (
      <div
        id="connexik-profile-item"
        style={{
          position: "absolute",
          right: 0,
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
            marginRight: "15px"
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
                  onClick={scanProfile}
                  style={{
                    background: "transparent",
                    margin: 0,
                    fontSize: "1.4rem",
                    minHeight: "2.4rem",
                    padding: ".2rem .8rem",
                    lineHeight: "2rem",
                    transitionTimingFunction: "cubic-bezier(.4,0,.2,1)",
                    alignItems: "center",
                    border: "none",
                    boxSizing: "border-box",
                    cursor: "pointer",
                    fontWeight: "600",
                    maxWidth: "480px",
                    overflow: "hidden",
                    textAlign: "center",
                    transitionProperty: "background-color,box-shadow,color",
                    verticalAlign: "middle",
                    backgroundColor: "transparent",
                    color: "#0a66c2",
                    boxShadow: "inset 0 0 0 1px #0a66c2",
                    textDecoration: "none",
                    width: "100%",
                    borderRadius: "1.6rem",
                    paddingLeft: "1.2rem",
                    paddingRight: "1.2rem",
                    minWidth: 0
                  }}>
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
                <ul
                  style={{
                    maxHeight: "none",
                    listStyleType: "none",
                    marginTop: "0.4rem",
                    marginBottom: "0.4rem",
                    listStyle: "none",
                    padding: 0
                  }}>
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
                      onClick={() => goToFeatures("referral")}
                      type="button">
                      Referral Wizard
                    </button>
                  </li>
                </ul>
              </li>
            </ul>
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
  const globalListItems = await waitForElement();

  if (!globalListItems) {
    await wait(3);
  }

  const rootContainer = await createRootContainer(anchor)
  const root = createRoot(rootContainer)
  root.render(<TopBar />)
}

export default TopBar
