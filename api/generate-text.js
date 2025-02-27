export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Yalnızca POST istekleri kabul edilir" });
    }

    const { grade, theme, keywords, questionCount } = req.body;

    if (!grade || !theme || !keywords || !questionCount) {
        return res.status(400).json({ error: "Tüm alanlar gereklidir" });
    }

    const apiKey = "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"; // Hugging Face API anahtarın
    const model = "mistralai/Mistral-7B-Instruct-v0.1"; // Hugging Face modeli

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
        res.status(500).json({ error: error.message });
    }
}