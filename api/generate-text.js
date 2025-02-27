export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Yalnızca POST istekleri desteklenir." });
    }

    const { grade, theme, keywords, questionCount } = req.body;

    const prompt = `İlkokul ${grade}. sınıf seviyesinde, "${theme}" temalı, içinde "${keywords}" kelimeleri geçen bir okuma metni oluştur. Ayrıca ${questionCount} tane okuduğunu anlama sorusu ekle.`;

    const apiKey = "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";  // Hugging Face API anahtarın
    const apiUrl = "https://api-inference.huggingface.co/models/facebook/blenderbot-400M-distill"; // Örnek bir model

    try {
        const response = await fetch(apiUrl, {
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
        return res.status(200).json({ text: data.generated_text || "Yanıt alınamadı." });

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}