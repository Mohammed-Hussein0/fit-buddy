import express from 'express';
import multer from 'multer';
import dotenv from 'dotenv';
import cors from 'cors';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
app.use(cors());
const upload = multer({ storage: multer.memoryStorage() });

// FIX: Initialize correctly. Leaving the constructor empty lets it natively pull GEMINI_API_KEY from process.env
const ai = new GoogleGenAI({});
app.post('/analyze', upload.fields([{ name: 'front' }, { name: 'back' }]), async (req, res) => {
  console.log("🚀 [BACKEND]: Received incoming analysis request payload.");
  
  try {
    if (!process.env.GEMINI_API_KEY) {
      console.error("❌ [BACKEND ERROR]: GEMINI_API_KEY environment variable is completely missing.");
      return res.status(500).send("Server configuration error: Missing GEMINI_API_KEY.");
    }

    if (!req.files || !req.files['front'] || !req.files['back']) {
      return res.status(400).send("Both front and back images are required.");
    }

    const frontBase64 = req.files['front'][0].buffer.toString('base64');
    const backBase64 = req.files['back'][0].buffer.toString('base64');

    const promptText = `
      You are a professional physique competition judge and coach.
      Analyze the provided front and back photos. Legs do not matter now.

      CRITICAL RULE: If the photos are blurry, too dark, do not show a human upper body,
      or are otherwise unusable for a physique review, start your response ONLY with
      the word "REJECTED" followed by the reason why. If the subject is wearing tight clothes, 
      start with a warning about how it is hard to judge with clothes but try to give an assessment.
      If the clothes are too baggy, then reject.

      Take note that a lot of photos will be of people posing, so do not get tricked by it.
      If valid, provide the review in this format:

      OVERALL REVIEW:
      [2-3 sentences summarizing the user's current physique, mentioning 1-2 strong points only if they actually exist.]

      LAGGING GROUPS:
      - [Muscle Group]: [Blunt reason why it's lagging].

      ACTION PLAN:
      - [Exercise 1]: [Specific cue for improvement].
      - [Exercise 2]: [Specific cue for improvement].

      Tone: Professional, blunt, and encouraging. No fluff.
    `;

    // FIX: Using the correct direct SDK method call
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        promptText,
        {
          inlineData: {
            mimeType: 'image/jpeg',
            data: frontBase64
          }
        },
        {
          inlineData: {
            mimeType: 'image/jpeg',
            data: backBase64
          }
        }
      ],
    });

    const critiqueText = response.text;
    console.log("✅ [BACKEND]: Response successfully processed from Google API.");
    return res.status(200).send(critiqueText);

  } catch (error) {
    console.error("❌ [BACKEND ERROR]: Direct Gemini compilation failed:", error);
    return res.status(500).send("Internal server error processing physique data.");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Direct Gemini Backend running on port ${PORT}`));