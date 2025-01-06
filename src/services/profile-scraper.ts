import OverlayManager from "~components/loader";
import type { ConnexikUser } from "~server/types/user.type";
import { extractLoggedInUserDetails, saveUserDetails } from "./user";

const processor = async () =>  {    
    const userDetails: ConnexikUser = await extractLoggedInUserDetails();

    const mainHTML = Array.from(document.querySelectorAll("main")).find((main) => {
      return main.querySelectorAll("section.artdeco-card").length > 1;
    }).outerHTML;

    OverlayManager.show("Convex AI is now analysing the profile...");

    // 3. Define improved instructions for the LLM
    const baseInstruction = `Your job is to extract the person's:
  - Name
  - Job title
  - Location
  - Current company name
  - Summary/About section
  
Return the result as JSON like this:
{"name":"Jane Doe","jobTitle":"Software Engineer","location":"San Francisco Bay Area","company":"Tech Corp","summary":"Some short professional summary"}

If a field is missing or cannot be determined, leave it blank, but keep the JSON keys. Additionally, include other relevant data about the person such as about, experience (as an array for all the companies the person has worked in the past), education, skills, recommendations, interests, causes, etc.

**Important:** 
- Do **not** include any markdown formatting, code fences, or additional text. 
- Return **only** valid JSON.
-------------------
`;
    const GEMINI_API_KEY = "AIzaSyAHQiOVM_Cd4APn5KMs9bVGh-Xi3mw447w";

    const geminiApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

    const promptForCard = `${baseInstruction}\n\nHTML snippet:\n\n${mainHTML}\n\n`;

    console.log(promptForCard);

    // const response = await fetch(geminiApiUrl, {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/json",
    //   },
    //   body: JSON.stringify({
    //     contents: [
    //       {
    //         parts: [
    //           {
    //             text: promptForCard,
    //           },
    //         ],
    //       },
    //     ],
    //   }),
    // });

    // if (!response.ok) {
    //   throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
    // }

    // // Parse the JSON response from Gemini
    // const data = await response.json();

    // console.log("Usage - ", JSON.stringify(data.usageMetadata));

    // // Extract the generated text from the response
    // const generatedText = data.candidates[0].content.parts[0].text;

    // console.log(generatedText);

    // const finalData = generatedText.replaceAll('```json\n', '').replaceAll('```', '').trim()
    // console.log(finalData)

    // console.log("Gemini API Result for card:", JSON.parse(finalData));

    const response = userDetails;
    response.isScanned = true;

    saveUserDetails(response);
    
    const wait = (time: number) => new Promise(res => setTimeout(res, time * 1000));

    await wait(3);
    OverlayManager.showSuccess();

    await wait(3);
    OverlayManager.hide();
}

const scrapper = () => new Promise((res) => {
  OverlayManager.show("Extracting data from LinkedIn...");

  setTimeout(async () => res(await processor()), 0);
})

export default {
    scrapper
}