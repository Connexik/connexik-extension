/** @jsxImportSource @emotion/react */

import { css } from "@emotion/react"
import MicroMatch from "micromatch"
import type {
  PlasmoCSConfig,
  PlasmoCSUIJSXContainer,
  PlasmoRender
} from "plasmo"
import { useEffect, useRef, useState } from "react"
import { createRoot } from "react-dom/client"

import "../style.css"

import { capitalizeFirstLetter } from "~utils/common"
import { processGrowNetwork } from "~services/grow-network"

export const config: PlasmoCSConfig = {
  matches: ["*://linkedin.com/*", "*://www.linkedin.com/*"],
  all_frames: true,
  run_at: "document_end" // Ensures script runs after the DOM is fully loaded
}

const hoverAnchorStyle = css`
  color: #0a66c2;
  box-shadow: inset 0 0 0 1px currentColor;
  transition-property: box-shadow;
  padding-inline: 1.6rem;
  border-radius: 2.4rem;
  min-height: 3.2rem;
  align-items: center;
  display: flex;
  background-color: rgb(55 143 233 / 0.1);
  &:hover {
    color: #004182;
    box-shadow: inset 0 0 0 2px #004182;
    background-color: rgb(55 143 233 / 0.3);
  }
`

const OpenAccept: React.FC<{
  labelText: string
}> = ({ labelText = "Accept By" }) => {
  return (
    <span css={hoverAnchorStyle}>
      <span style={{ whiteSpace: "pre-wrap", fontSize: "1.6rem" }}>
        {labelText} Convexik AI ❤️
      </span>
    </span>
  )
}

const dialogOpenProcess = (pymk) => {
  const intervalDialogOpenId = setInterval(() => {
    const dialogElement = document.querySelector("dialog[open]")
    if (!dialogElement) {
      return
    }
    clearInterval(intervalDialogOpenId)

    processGrowNetwork(dialogElement)
  }, 1000)
}

const moreSuggestionsProcess = () => {
  const targetElement = document.querySelector(
    '[data-view-name="cohorts-section-more-suggestions"]>section'
  )

  if (targetElement) {
    // Scroll to the element
    targetElement.scrollIntoView({
      behavior: "smooth", // Smooth scrolling animation
      block: "start", // Align the element at the top of the viewport
      inline: "nearest" // For horizontal scrolling (if applicable)
    })

    processGrowNetwork(targetElement)
  }
}

const processGrow = (pymk) => {
  if (pymk.button) {
    dialogOpenProcess(pymk)
  } else {
    moreSuggestionsProcess()
  }
}

const pymkProcess = (ele, button = true) => {
  const firstChild = ele.firstElementChild
  if (!firstChild) return

  const headingEle = firstChild.querySelector("h2")
  if (!headingEle) return

  const headingText = headingEle.innerText
    .replace("People you may know", "")
    .replace("People in the", "")
    .replace("you may know", "")
    .trim()

  if (!headingText) return

  const capitalHeading = capitalizeFirstLetter(headingText)

  let buttonEle
  if (button) {
    buttonEle = firstChild.querySelector("button")
    if (!buttonEle) return
  }

  const responseData = {
    heading: capitalHeading,
    text: headingEle.innerText,
    button: buttonEle
  }

  if (ele && !ele.querySelector(".connexik-pymk-show")) {
    const customButton = document.createElement("button")
    customButton.className = "connexik-pymk-show"
    customButton.style.cssText = `
      min-height: auto;
      min-width: auto;
      background-color: transparent;
      padding: 0;
      border: 0
    `

    customButton.onclick = () => {
      if (buttonEle) {
        buttonEle.click()
        processGrow(responseData)
      }
    }

    firstChild.firstElementChild.appendChild(customButton)

    headingEle.style.cssText = `
      display: flex;
    `

    const root = createRoot(customButton)
    root.render(<OpenAccept labelText="Grow with" />)
  }

  return responseData
}

const getPYMK = (prevData = {}) => {
  const finalData = { ...prevData }
  const pymkData = document.querySelectorAll(
    '[data-view-name="cohorts-section-pymk"]>section>div'
  )

  for (let ele of pymkData) {
    const finalObj = pymkProcess(ele)

    if (!finalObj) {
      continue
    }

    finalData[finalObj.heading] = finalObj
  }

  let final = false

  const moreSuggestions = document.querySelector(
    '[data-view-name="cohorts-section-more-suggestions"]'
  )
  if (moreSuggestions) {
    const divSection = moreSuggestions.querySelector("section")
    if (divSection) {
      const finalObj = pymkProcess(divSection, false)
      if (finalObj) {
        final = true
        finalData[finalObj.heading] = finalObj
      }
    }
  } else {
    let pymkEle = document.querySelector(
      '[data-view-name="cohorts-section-pymk"]'
    )
    if (!pymkEle) {
      pymkEle = document.querySelector(
        '[data-view-name="cohorts-section-pfollows"]'
      )
    }
    pymkEle?.parentElement?.lastElementChild?.querySelector("button")?.click()
  }

  return { data: finalData, final }
}

let intervalNetworkGrowId: NodeJS.Timeout
const NetworkGrow: React.FC = () => {
  const [pymkData, setPYMKData] = useState({})
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false)

  useEffect(() => {
    intervalNetworkGrowId = setInterval(() => {
      const { final, data } = getPYMK(pymkData)
      if (final) {
        clearInterval(intervalNetworkGrowId)
      }

      setPYMKData(data)
    }, 1000)

    return () => clearInterval(intervalNetworkGrowId)
  }, [])

  const toggleCollapse = () => {
    setIsCollapsed((prevState) => !prevState)
  }

  const showGrowNetwork = (e) => {
    const { textContent } = e.target

    const pymk = pymkData[textContent]
    if (!pymk) {
      return
    }

    if (pymk.button) {
      pymk.button.click()
      processGrow(pymk)
    }
  }

  return (
    <div className="network-grow-container">
      <div
        className="network-grow-heading"
        onClick={toggleCollapse}
        role="button"
        aria-expanded={!isCollapsed}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault()
            toggleCollapse()
          }
        }}>
        <img
          style={{
            width: "18px",
            height: "19px",
            marginRight: "3%"
          }}
          src={chrome.runtime.getURL(`assets/connexik-ai-no-bg.png`)}
        />
        <h2 className="heading-text">Grow your network</h2>
        <button
          className="collapse-button"
          aria-label={isCollapsed ? "Expand list" : "Collapse list"}
          onClick={(e) => {
            e.stopPropagation() // Prevent triggering the parent onClick
            toggleCollapse()
          }}>
          {isCollapsed ? "+" : "−"}
        </button>
      </div>
      {!isCollapsed && (
        <div className="network-types-list">
          {Object.values(pymkData).map(
            (type: { text: string; heading: string }) => (
              <div className="network-type-item" key={type.heading}>
                <a
                  key={type.heading}
                  title={type.text}
                  data-id={type.heading}
                  onClick={showGrowNetwork}>
                  ➤ <span>{type.heading}</span>
                </a>
              </div>
            )
          )}
        </div>
      )}
      <div
        style={{
          fontSize: "1rem",
          padding: "1rem",
          textAlign: "center",
          paddingBottom: 0
        }}>
        Made with ❤️ by Connexik
      </div>
    </div>
  )
}

const networkGrowController = () => {
  const intervalId = setInterval(() => {
    const targetElement = document.querySelector(
      '[href^="https://www.linkedin.com/mynetwork/invitation-manager"],' +
        '[href^="http://www.linkedin.com/mynetwork/invitation-manager"],' +
        '[href^="https://linkedin.com/mynetwork/invitation-manager"],' +
        '[href^="http://linkedin.com/mynetwork/invitation-manager"]'
    ) as HTMLAnchorElement

    if (targetElement) {
      const parentDiv = targetElement.closest("div")
      if (parentDiv && !parentDiv.querySelector("#connexik-accept")) {
        const customButton = document.createElement("button")
        customButton.id = "connexik-accept"
        customButton.style.cssText = `
          min-height: auto;
          min-width: auto;
          background-color: transparent;
          padding: 0;
          border: 0
        `

        customButton.onclick = () => {
          if (targetElement.href) {
            window.open(targetElement.href, "_self")
          }
        }

        parentDiv.appendChild(customButton)

        const root = createRoot(customButton)
        root.render(<OpenAccept labelText="Accept by" />)
      }
      // else {
      //   // clearInterval(intervalId)
      // }
    }
  }, 1000) // Check every second

  const growIntervalId = setInterval(() => {
    const wildcardSelector =
      'a[href*="linkedin.com/mynetwork/invite-connect/connections"]'
    const matchingLink = document.querySelector(wildcardSelector)
    if (!matchingLink) {
      return
    }

    const parentDiv = matchingLink.closest("section").closest("div")
    if (!parentDiv) {
      return
    }

    if (!parentDiv.querySelector("#connexik-grow-section")) {
      const overflowDiv = parentDiv.parentElement
      if (overflowDiv) {
        overflowDiv.style.cssText = `
          overflow-y: scroll;
          position: fixed;
          height: 100%;
          width: min-content;
        `
      }

      const customButton = document.createElement("section")
      customButton.id = "connexik-grow-section"

      parentDiv.prepend(customButton)

      const root = createRoot(customButton)
      root.render(<NetworkGrow />)
    } else {
      clearInterval(growIntervalId)
    }
  }, 1000)
}

export const render: PlasmoRender<PlasmoCSUIJSXContainer> = async () => {
  let oldURL = window.location.pathname

  const observer = new MutationObserver(() => {
    if (oldURL !== window.location.pathname) {
      oldURL = window.location.pathname

      const matched = MicroMatch.isMatch(oldURL, ["*/mynetwork/grow*"])
      if (matched) {
        networkGrowController()
      }
    }
  })
  observer.observe(document.body, { childList: true, subtree: true })

  const matched = MicroMatch.isMatch(oldURL, ["*/mynetwork/grow*"])
  if (matched) {
    networkGrowController()
  }
}

export default NetworkGrow
