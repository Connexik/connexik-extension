import OverlayManager from "~components/loader"
import connections from "~server/connections"
import { wait } from "~utils/common"

const commonAcceptConnections = async () => {
  OverlayManager.show("Extracting data from Pending Invitations...")

  const invitations = document.querySelectorAll("ul.mn-invitation-list>li")

  const invitationData = []
  const invitationRef = {}
  for (let invitation of invitations) {
    const newsletter = invitation.getElementsByClassName(
      "invitation-card__icon--newspaper"
    )
    if (newsletter.length) {
      continue
    }

    const invitationCard = invitation.getElementsByClassName(
      "invitation-card__details"
    )[0]

    const titleEle = invitationCard.querySelector(
      ".invitation-card__tvm-title>a"
    )
    if (!titleEle) {
      continue
    }

    const title = titleEle.textContent.trim()

    const href = titleEle.getAttribute("href")
    if (!href) {
      continue
    }
    const username = href
      .trim()
      .split("/")
      .filter((part) => part)
      .pop()

    const subtitleCard = invitationCard.getElementsByClassName(
      "invitation-card__subtitle"
    )[0]
    if (!subtitleCard) {
      continue
    }

    const subtitle = subtitleCard.textContent.trim()

    const memberInsightsCard =
      invitationCard.getElementsByClassName("member-insights")[0]
    const memberInsights = memberInsightsCard?.textContent.trim()

    const buttonsCard = invitation.querySelectorAll(
      "button.invitation-card__action-btn"
    )

    const buttons = {
      ignore: null,
      accept: null
    }

    buttonsCard.forEach((ele) => {
      const buttonText = ele.textContent.trim()
      if (buttonText === "Ignore") {
        buttons.ignore = ele
      } else {
        buttons.accept = ele
      }
    })

    if (!buttons.accept || !buttons.ignore) {
      continue
    }

    invitationData.push({
      username,
      fullName: title,
      title: subtitle,
      memberInsights
    })

    invitationRef[username] = { name: title, invitation, href, buttons }
  }

  if (!invitationData.length) {
    OverlayManager.showSuccess(`No new network connection requests to analyze`)
    await wait(2)
    OverlayManager.hide()
    return
  }

  return { invitationData, invitationRef }
}

export const acceptFilterConnections = async (connexikId, filters) => {
  const connectionsData = await commonAcceptConnections()
  if (!connectionsData) {
    return
  }

  const { invitationData, invitationRef } = connectionsData

  const filtersData = []
  if (filters.byCompany) {
    filtersData.push("company")
  }
  if (filters.bySchool) {
    filtersData.push("school")
  }
  if (filters.byMutual) {
    filtersData.push("mutualConnections")
  }
  if (filters.byAI) {
    filtersData.push("ai")
  }

  await wait(1)

  OverlayManager.show("ConnexikAI is filtering the relevent data 🔍")

  await wait(1)

  const responseData = await connections.acceptFilter(
    connexikId,
    invitationData,
    filtersData
  )

  if (responseData.message) {
    OverlayManager.showError(responseData.message)
    await wait(3)
    OverlayManager.hide()
    return
  }

  const basicMessage = [
    `🎉 Connexik AI just worked its magic on ${responseData.relevantUsers.length} invitations!`,
    responseData.remainingFilterationCount
      ? `✨ Great news! You can process ${responseData.remainingFilterationCount} more invitations today. Keep going! 🚀`
      : `😴 After this, you've hit today's filter limit. Recharge and come back tomorrow for more fun! 🌟`
  ]

  OverlayManager.showMultiple([...basicMessage])

  console.log('responseData - ', responseData);

  for (let relevantUser of responseData.relevantUsers) {
    const fullName = invitationRef[relevantUser.username].name
    const buttons = invitationRef[relevantUser.username].buttons
    const status = relevantUser.status

    const statusMessage = () => {
      if (status === "accept") {
        buttons.accept.click();
        return `✅ ConnexikAI has graciously accepted ${fullName}'s invitation because: "${relevantUser.reason}" Cheers to good reasoning! 🎉`
      } else if (status === "ignore") {
        if (filters.ignore) {
          buttons.ignore.click();
          return `❌ ConnexikAI has decided to reject ${fullName}'s invitation due to: "${relevantUser.reason}" Sometimes tough choices must be made. 💔`
        } else {
          return `⏭️ ConnexikAI skipped ${fullName}'s invitation due to: "${relevantUser.reason}" On to the next one! 🚀`
        }
      } else {
        return `🤔 ConnexikAI is pondering what to do with ${fullName}'s invitation. Stay tuned! 🕒`
      }
    }

    OverlayManager.showMultiple([...basicMessage, statusMessage()])

    await wait(2)
  }

  OverlayManager.showSuccess(
    `🙏 Thank you for choosing ConnexikAI. Come back soon to make your LinkedIn network even better! 💼✨`
  )

  await wait(2)
  OverlayManager.hide()
}

export const acceptAllConnections = async (connexikId) => {
  const connectionsData = await commonAcceptConnections()
  if (!connectionsData) {
    return
  }

  const { invitationData, invitationRef } = connectionsData

  const basicMessage = [
    `🎉 Connexik AI is going to accept ${invitationData.length} invitations!`,
    `😴 To control the LinkedIn's restrictions we are going to accept 1 call/second 🌟`
  ]

  OverlayManager.showMultiple([...basicMessage])

  for (let user of invitationData) {
     const userRef = invitationRef[user.username]

     await wait(1)

     const message = `Accepting request - ${userRef.name}`
     OverlayManager.showMultiple([...basicMessage, message])

     userRef.buttons.accept.click();
  }

  OverlayManager.showSuccess(
    `🙏 Thank you for choosing ConnexikAI. Come back soon to make your LinkedIn network even better! 💼✨`
  )

  await wait(2)
  OverlayManager.hide()
}
