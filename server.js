import express from "express";
import cors from "cors";
import axios from "axios";
import fs from "fs";
import Tesseract from "tesseract.js";

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));

// Read API key from "env" file
const envData = fs.readFileSync("env", "utf8");
const OPENAI_API_KEY = envData.split("=")[1].trim();

//  Chat + Image Generate Endpoint
app.post("/chat", async (req, res) => {
  try {
    const { message, imagePrompt } = req.body;

    if (imagePrompt) {
      const imgRes = await axios.post(
        "https://api.openai.com/v1/images/generations",
        {
          model: "gpt-image-1",
          prompt: imagePrompt,
          size: "512x512",
        },
        {
          headers: {
            Authorization: `Bearer ${OPENAI_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );
      return res.json({ image: imgRes.data.data[0].url });
    }

    const aiRes = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: message }],
      },
      {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    res.json({ reply: aiRes.data.choices[0].message.content });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ reply: " Sorry, kuch error hua." });
  }
});

//  Image Analyze (Normal OCR)
app.post("/analyze", async (req, res) => {
  try {
    const { imageBase64 } = req.body;
    const buffer = Buffer.from(imageBase64.split(",")[1], "base64");

    const result = await Tesseract.recognize(buffer, "eng");
    res.json({ text: result.data.text });
  } catch (error) {
    res.status(500).json({ text: "Image analyze me error aaya" });
  }
});

app.listen(3000, () => console.log(" Faiyaz AI backend running on port 3000"));