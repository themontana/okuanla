export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Sadece POST istekleri destekleniyor" });
    }

    const API_KEY = "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";
    
    const { prompt } = req.body;

    try {
        const response = await fetch("https://api-inference.huggingface.co/models/facebook/bart-large-cnn", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ inputs: prompt })
        });

        const data = await response.json();
        
        // API yanıtını kontrol et ve doğru formata dönüştür
        console.log("Hugging Face yanıtı:", data);
        
        if (data.error) {
            return res.status(500).json({ error: data.error });
        }
        
        // Eğer yanıt array değilse array'e dönüştür
        if (!Array.isArray(data)) {
            if (data.generated_text) {
                return res.status(200).json([{ generated_text: data.generated_text }]);
            } else {
                return res.status(200).json([{ generated_text: data }]);
            }
        }
        
        return res.status(200).json(data);
    } catch (error) {
        console.error("API Hatası:", error);
        return res.status(500).json({ error: "Bir hata oluştu: " + error.message });
    }
}
