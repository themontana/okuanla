export default async function handler(req, res) {
    try {
        console.log("Fonksiyon çalışıyor, gelen metod:", req.method);
        console.log("Gelen headers:", req.headers);
        console.log("Gelen body:", req.body);

        if (req.method === "OPTIONS") {
            res.setHeader("Allow", "POST");
            return res.status(200).end();
        }
        if (req.method !== "POST") {
            return res.status(405).json({ 
                error: "Sadece POST istekleri destekleniyor", 
                details: { method: req.method, headers: req.headers } 
            });
        }

        const API_KEY = process.env.HF_API_KEY || "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";
        
        const { prompt } = req.body;
        
        if (!prompt) {
            return res.status(400).json({ error: "prompt parametresi gereklidir" });
        }

        console.log("Hugging Face API'ye istek gönderiliyor...");
        console.log("Prompt:", prompt);

        const response = await fetch("https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.1", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ 
                inputs: `<s>[INST] ${prompt} [/INST]`,
                parameters: {
                    max_new_tokens: 500,
                    temperature: 0.7,
                    top_p: 0.95,
                    return_full_text: false
                }
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Hugging Face API hatası:", response.status, errorText);
            return res.status(500).json({ 
                error: "Hugging Face API hatası", 
                details: `Status ${response.status}: ${errorText}` 
            });
        }

        const data = await response.json();
        
        console.log("Hugging Face yanıtı:", data);
        
        if (data.error) {
            return res.status(500).json({ error: data.error });
        }
        
        if (Array.isArray(data) && data.length > 0 && data[0].generated_text) {
            return res.status(200).json(data);
        } else if (typeof data === 'string') {
            return res.status(200).json([{ generated_text: data }]);
        } else if (data.generated_text) {
            let cleanedText = data.generated_text;
            const instEndIndex = cleanedText.indexOf("[/INST]");
            if (instEndIndex !== -1) {
                cleanedText = cleanedText.substring(instEndIndex + 7).trim();
            }
            return res.status(200).json([{ generated_text: cleanedText }]);
        } else {
            return res.status(200).json([{ generated_text: "Metin oluşturulamadı. Lütfen farklı bir tema veya anahtar kelimeler deneyin." }]);
        }
    } catch (error) {
        console.error("Genel hata:", error);
        return res.status(500).json({ 
            error: "Bir hata oluştu", 
            details: error.message, 
            stack: error.stack 
        });
    }
}
