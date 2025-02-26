export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Only POST requests allowed" });
    }

    const apiKey = "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"; // Hugging Face API anahtarın
    const apiUrl = "https://api-inference.huggingface.co/models/facebook/bart-large-cnn"; // Hugging Face model URL'si

    const { prompt } = req.body; // Kullanıcıdan gelen prompt

    try {
        const response = await fetch(apiUrl, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ inputs: prompt })
        });

        const data = await response.json();

        if (data.error) {
            return res.status(500).json({ error: data.error });
        }

        return res.status(200).json({ result: data[0].summary_text || "Metin oluşturulamadı." });
    } catch (error) {
        return res.status(500).json({ error: "API çağrısı başarısız oldu." });
    }
}
