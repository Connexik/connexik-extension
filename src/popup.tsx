import { useEffect, useState } from "react"

import { SESSION_STATUS } from "~config"
import type { Session } from "~server/types/user.type"

import { getSession, signInWithLinkedIn } from "./services/background"

const Popup = () => {
  const [sessionData, setSessionData] = useState<Session>(null)
  const [signInError, setsSignInError] = useState<string>(null)

  useEffect(() => {
    const checkSession = async () => {
      const session = await getSession()
      if (session) {
        setSessionData(session)
      }
    }

    checkSession()
  }, [])

  const handleSignIn = async () => {
    try {
      const session = await signInWithLinkedIn()
      setSessionData(session)
    } catch (err) {
      setsSignInError(err.message)
    }
  }

  return (
    <div
      style={{
        fontFamily:
          "-apple-system,system-ui,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,Fira Sans,Ubuntu,Oxygen,Oxygen Sans,Cantarell,Droid Sans,Apple Color Emoji,Segoe UI Emoji,Segoe UI Emoji,Segoe UI Symbol,Lucida Grande,Helvetica,Arial,sans-serif",
        width: "400px",
        maxWidth: "-webkit-fill-available",
        margin: "-8px",
        backgroundColor: "#f4f4f4"
      }}>
      <div
        style={{
          borderBottom: "1px solid lightgrey",
          padding: "5%"
        }}>
        <header
          style={{
            fontSize: "24px",
            fontWeight: "bold",
            display: "flex",
            justifyContent: "center"
          }}>
          <img
            style={{
              width: "25px",
              height: "30px",
              minWidth: "15px",
              marginRight: "5px"
            }}
            src={chrome.runtime.getURL(`assets/connexik-ai-no-bg.png`)}
            alt="Connexik AI Logo"
          />
          <span>Connexik AI</span>
        </header>
      </div>
      <main style={{ padding: "5%" }}>
        {sessionData ? (
          sessionData?.status === SESSION_STATUS.QUEUED ? (
            <div style={{ textAlign: "center" }}>
              <h3>
                Welcome {sessionData.firstName} {sessionData.lastName}!
              </h3>
              <h3 style={{ marginBottom: "16px", marginTop: "16px" }}>
                You're still in queue for access. Ping us at{" "}
                <a
                  href="mailto:theconnexik@gmail.com"
                  style={{ color: "#0073b1" }}>
                  theconnexik@gmail.com
                </a>
              </h3>
            </div>
          ) : sessionData?.status === SESSION_STATUS.BLOCKED ? (
            <div style={{ textAlign: "center" }}>
              <h3>
                Welcome {sessionData.firstName} {sessionData.lastName}!
              </h3>
              <h3 style={{ marginBottom: "16px", marginTop: "16px" }}>
                You're blocked for access. Ping us at{" "}
                <a
                  href="mailto:theconnexik@gmail.com"
                  style={{ color: "#0073b1" }}>
                  theconnexik@gmail.com
                </a>
              </h3>
            </div>
          ) : (
            <div>
              <h3>
                Welcome {sessionData.firstName} {sessionData.lastName}!
              </h3>
              <p>Go To LinkedIn & Use powers of Connexik AI:</p>
              {/* <p>Here’s your today's remaining requests:</p> */}
              {/* <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: "16px",
                  margin: "16px 0"
                }}>
                <div>
                  <h4>Accept with AI</h4>
                  <p>{sessionData.remainingAccepts || 0}</p>
                </div>
                <div>
                  <h4>Grow with AI</h4>
                  <p>{sessionData.remainingGrows || 0}</p>
                </div>
              </div> */}
              <div style={{ display: "flex", justifyContent: "center" }}>
                <button
                  onClick={() => {
                    // Redirect to LinkedIn for processing
                    window.open("https://www.linkedin.com", "_blank")
                  }}
                  style={{
                    padding: "8px 16px",
                    fontSize: "16px",
                    backgroundColor: "#0073b1",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    marginTop: "16px",
                    marginLeft: "auto",
                    marginRight: "auto"
                  }}>
                  Go to LinkedIn
                </button>
              </div>
            </div>
          )
        ) : (
          <div style={{ textAlign: "center" }}>
            <img
              src={chrome.runtime.getURL(`assets/linkedin-active.png`)}
              alt="Sign in with LinkedIn"
              style={{
                width: "55%",
                cursor: "pointer",
                borderRadius: "0.2rem"
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.src = chrome.runtime.getURL(
                  `assets/linkedin-hover.png`
                ))
              }
              onMouseLeave={(e) =>
                (e.currentTarget.src = chrome.runtime.getURL(
                  `assets/linkedin-active.png`
                ))
              }
              onClick={handleSignIn}
            />
          </div>
        )}
      </main>
      <footer
        style={{
          textAlign: "center",
          fontSize: "10px",
          color: "#666",
          padding: "2%"
        }}>
        Made with ❤️ by Connexik
      </footer>
    </div>
  )
}

export default Popup
