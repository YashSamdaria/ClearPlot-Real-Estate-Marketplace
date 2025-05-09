const express = require("express");
const router = express.Router();
const fetch = require("node-fetch");
const dotenv = require('dotenv');

const COHERE_API_KEY = process.env.COHERE_API_KEY; // Replace with your real key

router.post("/", async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: "Missing prompt" });

  try {
    const response = await fetch("https://api.cohere.ai/v1/chat", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${COHERE_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "command-r-plus",
        message: `Rewrite this property description to be more detailed, appealing, and professional:\n\n${prompt}`,
        temperature: 0.7,
        max_tokens: 300
      })
    });

    const data = await response.json();
    const enhanced = data.text || data.generation || data.message?.content;

    res.json({ enhanced });
  } catch (err) {
    console.error("Enhancement error:", err);
    res.status(500).json({ error: "Failed to enhance", detail: err.message });
  }
});

module.exports = router;
