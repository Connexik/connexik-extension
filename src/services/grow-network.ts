import OverlayManager from "~components/loader"
import connections from "~server/connections"
import type { ConnexikUser } from "~server/types/user.type"
import { wait } from "~utils/common"

import { showConfirmationDialog } from "../components/confirmation"
import { extractLoggedInUserDetails } from "./user"

const processAIFiltering = async (
  loggedInUser: ConnexikUser,
  filter: string,
  cardsObj: object,
  cardsArr: any[]
) => {
  OverlayManager.show("ConnexikAI is filtering the relevent data 🔍")

  await wait(1)

  const responseData = await connections.growFilter(
    loggedInUser.connexikId,
    cardsArr,
    filter
  )

  if (responseData.message) {
    OverlayManager.showError(responseData.message)
    await wait(3)
    OverlayManager.hide()
    return
  }

  const basicMessage = [
    `🎉 Connexik AI just worked its magic on ${responseData.relevantUsers.length} users!`,
  ]

  OverlayManager.showMultiple([...basicMessage])

  for (let relevantUser of responseData.relevantUsers) {
    const fullName = cardsObj[relevantUser.username].fullName
    const button = cardsObj[relevantUser.username].button
    const status = relevantUser.status

    const statusMessage = () => {
      if (status === "accept") {
        console.log("statusMessage - ")
        console.log(fullName, button, status, relevantUser, cardsObj)
        button.click();
        return [
          `🤝 ConnexikAI is firing off a connection request to ${fullName}`, 
          `because: "${relevantUser.reason}"`, 
          `Here's to building bridges and making waves! 🌊✨`
        ]
      } else if (status === "ignore") {
        return [
          `🚫 ConnexikAI opted to skip connecting with ${fullName}`,
          `due to: "${relevantUser.reason}"`,
          `No hard feelings, just keeping it moving! 🚀`
        ]
      } else {
        return [
          `🤔 ConnexikAI is in deep thought about connecting with ${fullName}.`,
          `Big decisions take time, so hang tight! 🕒`
        ]
      }
    }

    OverlayManager.showMultiple([...basicMessage, ...statusMessage()])

    await wait(2)
  }
}

const processAllConnextions = async (
  remainingCount: number,
  cardsObj: object
) => {
  const basicMessage = [
    `🎉 Connexik AI is ready to grow your network!`,
    `😴 To comply with LinkedIn's restrictions, we will send requests at a rate of 1 call per second 🌟`
  ]

  OverlayManager.showMultiple([...basicMessage])

  const cards = Object.values(cardsObj)

  for (let card of cards) {
    if (remainingCount < 1) {
      break
    }

    const message = `Accepting request - ${card.fullName}, Remaining ${--remainingCount}`

    await wait(1)

    card.button.click();

    OverlayManager.showMultiple([...basicMessage, message])
  }
}

const processCohortCards =
  (ele, loggedInUser, filter) => (type, remainingCount) =>
    new Promise((res) => {
      const intervalProcessCohortId = setInterval(async () => {
        OverlayManager.show(
          type === "ai"
            ? "✨ Connexik AI is hard at work finding the best profiles for you. Hang tight! 🔍🤝"
            : "⏳ Connexik is processing profiles to secure the best matches for you. Please wait! 🤖💼"
        )

        const cards = ele.querySelectorAll('[data-view-name="cohort-card"]')
        if (!cards.length) {
          return
        }

        if (cards.length < remainingCount) {
          const buttonEle =
            cards[0].parentElement?.lastElementChild?.firstElementChild
          if (buttonEle.tagName === "BUTTON") {
            buttonEle.click()
          }

          return
        }

        clearInterval(intervalProcessCohortId)

        let userArr = []
        let userObj = {}

        for (let card of cards) {
          const username = card
            .querySelector("a")
            .href?.trim()
            .split("/")
            .filter((part) => part)
            .pop()
          if (!username) {
            continue
          }

          const userRefs = card.querySelectorAll("p")
          const userButton = card.querySelector('div[data-view-name="edge-creation-connect-action"] button');

          userArr.push({
            username: username,
            fullName: userRefs?.[0]?.textContent,
            title: userRefs?.[1]?.textContent,
            memberInsights: userRefs?.[2]?.textContent
          })

          userObj[username] = {
            username: username,
            fullName: userRefs?.[0]?.textContent,
            title: userRefs?.[1]?.textContent,
            memberInsights: userRefs?.[2]?.textContent,
            button: userButton
          }
        }

        if (userArr.length) {
          if (type === "ai") {
            await processAIFiltering(loggedInUser, filter, userObj, userArr)
          } else {
            await processAllConnextions(remainingCount, userObj)
          }

          OverlayManager.showSuccess(
            `🙏 Thank you for choosing ConnexikAI. Come back soon to make your LinkedIn network even better! 💼✨`
          )
        } else {
          OverlayManager.showSuccess(
            `🙏 No valid connection available! Please try again later 💼✨`
          )
        }

        await wait(2)
        OverlayManager.hide()

        res(null)
      }, 1000)
    })

export const processGrowNetwork = async (ele, filter) => {
  const loggedInUser = await extractLoggedInUserDetails()

  showConfirmationDialog(
    ele,
    loggedInUser,
    processCohortCards(ele, loggedInUser, filter)
  )
}
