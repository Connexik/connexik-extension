const scrapper = async () => {
    console.log("Extracting LinkedIn profile data...");

    // Extract the username from the URL
    const username = window.location.pathname.split("/")[2];
    console.log("Username:", username);

    const mainHTML = Array.from(document.querySelectorAll("main")).find((main) => {
      return main.querySelectorAll("section.artdeco-card").length > 1;
    }).outerHTML;

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

    const response = await fetch(geminiApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: promptForCard,
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
    }

    // Parse the JSON response from Gemini
    const data = await response.json();

    console.log("Usage - ", JSON.stringify(data.usageMetadata));

    // Extract the generated text from the response
    const generatedText = data.candidates[0].content.parts[0].text;

    console.log(generatedText);

    const finalData = generatedText.replaceAll('```json\n', '').replaceAll('```', '').trim()
    console.log(finalData)

    console.log("Gemini API Result for card:", JSON.parse(finalData));

    // Optionally, do something with the result
    alert("Profile data processed successfully!");
}

export default {
    scrapper
}