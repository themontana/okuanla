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
        const model = "deepseek-ai/DeepSeek-R1";

        // DeepSeek-R1 modeli için mesaj formatı hazırla (chat completion formatında)
        const messages = [
            {
                "role": "user", 
                "content": `İlkokul ${grade}. sınıf seviyesinde, "${theme}" temalı, içinde "${keywords}" kelimeleri geçen bir okuma metni oluştur. Ayrıca ${questionCount} tane okuduğunu anlama sorusu ekle.`
            }
        ];

        console.log("HuggingFace'e gönderilecek mesajlar:", JSON.stringify(messages));
        
        // HuggingFace API'ye istek gönder
        const response = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ 
                inputs: messages,
                parameters: {
                    max_new_tokens: 1024,
                    temperature: 0.7,
                    top_p: 0.95,
                    trust_remote_code: true
                }
            })
        });

        console.log("HuggingFace yanıt durum kodu:", response.status);

        // Yanıt gövdesini al
        const responseText = await response.text();
        console.log("HuggingFace ham yanıt:", responseText);

        // JSON parse et
        let data;
        try {
            data = JSON.parse(responseText);
        } catch (err) {
            console.error("JSON parse hatası:", err);
            return res.status(500).json({
                error: "HuggingFace API yanıtı geçersiz JSON formatında",
                rawResponse: responseText
            });
        }

        if (!response.ok) {
            console.error("HuggingFace API hatası:", data);
            return res.status(500).json({
                error: `HuggingFace API hatası: ${response.statusText}`,
                details: data
            });
        }

        // DeepSeek-R1 modelinin çıktı formatını kontrol et ve metni çıkar
        if (!data || !Array.isArray(data) || data.length === 0) {
            console.error("Geçersiz API yanıtı:", data);
            return res.status(500).json({
                error: "HuggingFace API'den beklenmeyen yanıt formatı",
                received: data
            });
        }

        // DeepSeek-R1 yanıtından metni çıkar
        // Yanıt formatı, modelin yapılandırmasına göre değişebilir
        let generatedText = "";
        
        if (typeof data[0] === 'object' && data[0].generated_text) {
            // Standard text generation output format
            generatedText = data[0].generated_text;
        } else if (typeof data[0] === 'object' && data[0].content) {
            // Chat model output format
            generatedText = data[0].content;
        } else if (typeof data[0] === 'string') {
            // Simple string output format
            generatedText = data[0];
        } else {
            console.error("Bilinmeyen API yanıt formatı:", data);
            return res.status(500).json({
                error: "HuggingFace API'den beklenmeyen yanıt formatı",
                received: data
            });
        }

        console.log("İşlem başarılı");
        return res.status(200).json({ text: generatedText });
    } catch (error) {
        console.error("Genel hata:", error);
        return res.status(500).json({
            error: error.message,
            stack: error.stack
        });
    }
}
