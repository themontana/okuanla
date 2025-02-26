export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Sadece POST istekleri destekleniyor" });
    }

    const API_KEY = "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";
    
    const { prompt } = req.body;

    try {
        // Metin oluşturmak için daha uygun bir model kullanın
        const response = await fetch("https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.1", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${API_KEY}`,
                "Content-Type": "application/json"
            },
            // Mistral modeli için formatı düzenleme
            body: JSON.stringify({ 
                inputs: `<s>[INST] ${prompt} [/INST]`,
                parameters: {
                    max_new_tokens: 500,
                    temperature: 0.7,
                    top_p: 0.95
                }
            })
        });

        const data = await response.json();
        
        console.log("Hugging Face yanıtı:", data);
        
        if (data.error) {
            return res.status(500).json({ error: data.error });
        }
        
        // Mistral modeli yanıtını formatla
        if (typeof data === 'string') {
            return res.status(200).json([{ generated_text: data }]);
        } else if (data.generated_text) {
            // Instruction kısmını yanıttan temizle
            let cleanedText = data.generated_text;
            // "[/INST]" sonrasını al
            const instEndIndex = cleanedText.indexOf("[/INST]");
            if (instEndIndex !== -1) {
                cleanedText = cleanedText.substring(instEndIndex + 7).trim();
            }
            return res.status(200).json([{ generated_text: cleanedText }]);
        } else if (Array.isArray(data) && data.length > 0) {
            return res.status(200).json(data);
        } else {
            return res.status(200).json([{ generated_text: "Metin oluşturulamadı. Lütfen farklı bir tema veya anahtar kelimeler deneyin." }]);
        }
    } catch (error) {
        console.error("API Hatası:", error);
        return res.status(500).json({ error: "Bir hata oluştu: " + error.message });
    }
}
