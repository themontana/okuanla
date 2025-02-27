const HUGGINGFACE_API_KEY = "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"; // Senin API Key'in

const model = "mistralai/Mistral-7B-Instruct";  // Küçük model seçildi
const apiUrl = `https://api-inference.huggingface.co/models/${model}`;

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Sadece POST metodu destekleniyor" });
    }

    const { grade, theme, keywords, questionCount } = req.body;

    const prompt = `İlkokul ${grade}. sınıf seviyesinde, "${theme}" temalı, içinde "${keywords}" kelimeleri geçen bir okuma metni oluştur. Ayrıca ${questionCount} tane okuduğunu anlama sorusu ekle.`;

    try {
        const response = await fetch(apiUrl, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${HUGGINGFACE_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ inputs: prompt })
        });

        if (!response.ok) {
            throw new Error(`HuggingFace API hatası: ${response.statusText}`);
        }

        const data = await response.json();

        if (!data || !data.length || !data[0].generated_text) {
            throw new Error("HuggingFace'den geçerli bir yanıt alınamadı.");
        }

        return res.status(200).json({ text: data[0].generated_text });
    } catch (error) {
        console.error("Hata:", error);
        return res.status(500).json({ error: error.message });
    }
}
