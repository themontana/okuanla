export default async function handler(req, res) {
    // CORS için basit headers ayarlayın
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    // OPTIONS isteğine yanıt verin (preflight request için)
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    // Sadece POST metodu kontrolü
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Yalnızca POST istekleri kabul edilir" });
    }

    console.log("API isteği alındı", req.body); // Log ekleyin

    const { grade, theme, keywords, questionCount } = req.body;

    if (!grade || !theme || !keywords || !questionCount) {
        return res.status(400).json({ error: "Tüm alanlar gereklidir", received: req.body });
    }

    const apiKey = process.env.HF_API_KEY || "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";
    const model = "mistralai/Mistral-7B-Instruct-v0.1";

    const prompt = `İlkokul ${grade}. sınıf seviyesinde, "${theme}" temalı, içinde "${keywords}" kelimeleri geçen bir okuma metni oluştur. Ayrıca ${questionCount} tane okuduğunu anlama sorusu ekle.`;

    try {
        console.log("Hugging Face API'ye istek gönderiliyor"); // Log ekleyin
        
        const response = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ inputs: prompt })
        });

        console.log("Hugging Face API yanıt durum kodu:", response.status); // Log ekleyin

        if (!response.ok) {
            throw new Error(`Hugging Face API hatası: ${response.statusText}`);
        }

        const data = await response.json();
        console.log("Hugging Face API yanıtı alındı"); // Log ekleyin
        
        return res.status(200).json({ text: data[0]?.generated_text || "Yanıt alınamadı." });
    } catch (error) {
        console.error("Metin oluşturma hatası:", error);
        return res.status(500).json({ error: error.message });
    }
}
