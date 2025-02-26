import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
app.use(cors());
app.use(express.json());

const API_KEY = "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"; // Hugging Face API Anahtarın

app.post("/api/generate-text", async (req, res) => {
    try {
        const { prompt } = req.body;
        
        const response = await fetch("https://api-inference.huggingface.co/models/facebook/bart-large-cnn", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ inputs: prompt })
        });

        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error("API Hatası:", error);
        res.status(500).json({ error: "Bir hata oluştu" });
    }
});

export default app;
