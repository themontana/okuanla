// Basit fetch polyfill - node-fetch 3.x ESM-only olduğu için
import fetch from 'node-fetch';

export default async function handler(req, res) {
    // CORS için headers
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Yalnızca POST istekleri kabul edilir" });
    }

    try {
        console.log("API isteği alındı:", JSON.stringify(req.body));

        const { grade, theme, keywords, questionCount } = req.body;

        if (!grade || !theme || !keywords || !questionCount) {
            return res.status(400).json({
                error: "Tüm alanlar gereklidir",
                received: req.body
            });
        }

        const apiKey = process.env.HF_API_KEY || "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";
        const model = "mistralai/Mistral-7B-Instruct-v0.1";

        const prompt = `İlkokul ${grade}. sınıf seviyesinde, "${theme}" temalı, içinde "${keywords}" kelimeleri geçen bir okuma metni oluştur. Ayrıca ${questionCount} tane okuduğunu anlama sorusu ekle.`;

        console.log("Hugging Face'e gönderilecek prompt:", prompt);
        
        // fetch API'si farklı platformlarda farklı davranabilir
        // node-fetch kullanmayı düşünün (package.json'a ekleyin)
        const response = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ inputs: prompt })
        });

        console.log("Hugging Face yanıt durum kodu:", response.status);

        // Yanıt gövdesini al
        const responseText = await response.text();
        console.log("Hugging Face ham yanıt:", responseText);

        // JSON parse et
        let data;
        try {
            data = JSON.parse(responseText);
        } catch (err) {
            console.error("JSON parse hatası:", err);
            return res.status(500).json({
                error: "Hugging Face API yanıtı geçersiz JSON formatında",
                rawResponse: responseText
            });
        }

        if (!response.ok) {
            console.error("Hugging Face API hatası:", data);
            return res.status(500).json({
                error: `Hugging Face API hatası: ${response.statusText}`,
                details: data
            });
        }

        // Yanıtı kontrol et
        if (!data || !Array.isArray(data) || !data[0]?.generated_text) {
            console.error("Geçersiz API yanıtı:", data);
            return res.status(500).json({
                error: "Hugging Face API'den beklenmeyen yanıt formatı",
                received: data
            });
        }

        console.log("İşlem başarılı");
        return res.status(200).json({ text: data[0].generated_text });
    } catch (error) {
        console.error("Genel hata:", error);
        return res.status(500).json({
            error: error.message,
            stack: error.stack
        });
    }
}
