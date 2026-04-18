import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { File } from 'expo-file-system';

const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

const prepareImage = async (uri: string) => {
  const manipulated = await manipulateAsync(
    uri,
    [{ resize: { width: 720 } }], 
    { compress: 0.7, format: SaveFormat.JPEG }
  );
  const file = new File(manipulated.uri);
  const base64 = await file.base64();
  
  return {
    inlineData: { data: base64, mimeType: "image/jpeg" },
  };
};

export const analyzePhysique = async (frontUri: string, backUri: string, apiKey: string) => {
  const frontPart = await prepareImage(frontUri);
  const backPart = await prepareImage(backUri);

  const promptText = `
     You are a professional physique competition judge and coach.

    Analyze the provided front and back photos, legs do not matter now.



    CRITICAL RULE: If the photos are blurry, too dark, do not show a human upper body,

    or are otherwise unusable for a physique review, start your response ONLY with

    the word "REJECTED" followed by the reason why, but if the subject is wearing tight clothes start with a warning about how it is hard to judge with clothes but try and give an assessment

    if the clothes are to baggy then reject.



    also take note that a lot of photos will be of people posing so make sure you do not get tricked by it

    If valid, provide the review in this format:

   

    OVERALL REVIEW:

    [2-3 sentences summarizing the user's current physique, try mentioning 1-2 strong points like "broad clavicles" or "good lat width" only if they actually exist do not lie.]



    LAGGING GROUPS:

    - [Muscle Group]: [Blunt reason why it's lagging].

   

    ACTION PLAN:

    - [Exercise 1]: [Specific cue for improvement].

    - [Exercise 2]: [Specific cue for improvement].



    Tone: Professional, blunt, and encouraging. No fluff.

  `;


  const response = await fetch(`${API_URL}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: promptText }, frontPart, backPart] }]
    })
  });

  const data = await response.json();
  return data.candidates[0].content.parts[0].text;
};