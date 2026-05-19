import express from 'express';
import multer from 'multer';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const upload = multer({ storage: multer.memoryStorage() }); 

// The wildcard model string for free testing
const MODEL = "openrouter/free";

app.post('/analyze', upload.fields([{ name: 'front' }, { name: 'back' }]), async (req, res) => {
    try {
    // FIX 1: Look for your correct OpenRouter key
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return res.status(500).send("Server configuration error: Missing OPENROUTER_API_KEY.");
    }

    if (!req.files || !req.files['front'] || !req.files['back']) {
      return res.status(400).send("Both front and back images are required.");
    }

    const frontBase64 = req.files['front'][0].buffer.toString('base64');
    const backBase64 = req.files['back'][0].buffer.toString('base64');

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

    // FIX 2: Hit OpenRouter's actual endpoint and pass the OpenAI-compliant layout
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:3000", 
        "X-Title": "FitBuddy Testing"            
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: promptText },
              { type: "image_url", image_url: { url: `data:image/jpeg;base64,${frontBase64}` } },
              { type: "image_url", image_url: { url: `data:image/jpeg;base64,${backBase64}` } }
            ]
          }
        ]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenRouter Gateway Error:", errorText);
      return res.status(502).send("Upstream OpenRouter model returned an error.");
    }

    const data = await response.json();
    
    // FIX 3: Parse the OpenAI format response, not the Gemini candidate format
    const critiqueText = data.choices[0].message.content;

    return res.status(200).send(critiqueText);

  } catch (error) {
    console.error("Internal Server Error:", error);
    return res.status(500).send("Internal server error processing physique data.");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Secure AI Backend running on port ${PORT}`));