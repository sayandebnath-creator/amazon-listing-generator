import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
app.use(cors());
app.use(express.json());

app.post("/generate", async (req, res) => {
  const { name, features, audience } = req.body;

  const prompt = `
    You are an expert Amazon listing copywriter.

    Generate:
    1. SEO optimized title
    2. 5 bullet points
    2. Product description
    4. 3 ad copies for A/B testing

    Product Name: ${name}
    Features: ${features}
    Target Audience: ${audience}

    Return ONLY valid JSON. No extra text.

    {
    "title": "",
    "bullets": [],
    "description": "",
    "ads": []
    }
    `;

  try {
    const response = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama3",
        prompt,
        options:{
            temperature: 0.7,
        },
        stream: false,
      }),
    });

    const data = await response.json();

    let parsed;
    try {
      parsed = JSON.parse(data.response);
    } catch {
      // fallback if JSON is messy
    //   parsed = { raw: data.response };
    // }

    // res.json(parsed);

    // Extract JSON from messy LLM output
    const match = data.response.match(/\{[\s\S]*\}/);
        if (match) {
            try {
            parsed = JSON.parse(match[0]);
            } catch {
            parsed = { raw: data.response };
            }
        } else {
            parsed = { raw: data.response };
        }
    }
    res.json(parsed);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(3000, () => console.log("Server running on port 3000"));