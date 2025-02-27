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

        // Gemini API için gerekli değişkenler
        const apiKey = process.env.GEMINI_API_KEY;
        // Güncellenmiş model adı ve API endpoint'i
        const geminiApiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";
        
        // Gemini API formatında prompt hazırla
        const prompt = `İlkokul ${grade}. sınıf seviyesinde, "${theme}" temalı, içinde "${keywords}" kelimeleri geçen bir okuma metni oluştur. Ayrıca ${questionCount} tane okuduğunu anlama sorusu ekle.`;

        // Gemini API isteği için gövde 
        const requestBody = {
            contents: [
                {
                    parts: [
                        {
                            text: prompt
                        }
                    ]
                }
            ],
            generationConfig: {
                temperature: 0.7,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 2048
            }
        };

        console.log("Gemini API'ye gönderilecek prompt:", prompt);
        console.log("Gemini API URL:", `${geminiApiUrl}?key=${apiKey}`);
        
        // Gemini API'ye istek at
        const response = await fetch(`${geminiApiUrl}?key=${apiKey}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(requestBody)
        });

        console.log("Gemini API yanıt durum kodu:", response.status);

        // Yanıt gövdesini al
        const responseText = await response.text();
        console.log("Gemini API ham yanıt:", responseText);

        // JSON parse et
        let data;
        try {
            data = JSON.parse(responseText);
        } catch (err) {
            console.error("JSON parse hatası:", err);
            return res.status(500).json({
                error: "Gemini API yanıtı geçersiz JSON formatında",
                rawResponse: responseText
            });
        }

        if (!response.ok) {
            console.error("Gemini API hatası:", data);
            return res.status(500).json({
                error: `Gemini API hatası: ${response.statusText}`,
                details: data
            });
        }

        // Gemini API yanıt formatı kontrolü ve metin çıkarma
        if (!data || !data.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) {
            console.error("Geçersiz API yanıtı:", data);
            return res.status(500).json({
                error: "Gemini API'den beklenmeyen yanıt formatı",
                received: data
            });
        }

        // Gemini API yanıtından metni çıkar
        const generatedText = data.candidates[0].content.parts[0].text;

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
