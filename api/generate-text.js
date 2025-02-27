// api/generate-text.js - Vercel Serverless Function olarak kullanın
export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Yalnızca POST istekleri kabul edilir" });
    }

    const { grade, theme, keywords, questionCount } = req.body;

    if (!grade || !theme || !keywords || !questionCount) {
        return res.status(400).json({ error: "Tüm alanlar gereklidir" });
    }

    const apiKey = process.env.HF_API_KEY || "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"; // Güvenlik için env'den almaya çalışın
    const model = "mistralai/Mistral-7B-Instruct-v0.1";

    const prompt = `İlkokul ${grade}. sınıf seviyesinde, "${theme}" temalı, içinde "${keywords}" kelimeleri geçen bir okuma metni oluştur. Ayrıca ${questionCount} tane okuduğunu anlama sorusu ekle.`;

    try {
        const response = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ inputs: prompt })
        });

        if (!response.ok) {
            throw new Error(`API hatası: ${response.statusText}`);
        }

        const data = await response.json();
        res.status(200).json({ text: data[0]?.generated_text || "Yanıt alınamadı." });
    } catch (error) {
        console.error("Hugging Face API hatası:", error);
        res.status(500).json({ error: error.message });
    }
}
