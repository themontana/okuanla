const apiKey = "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"; // Hugging Face API anahtarını ekle
const modelName = "mistralai/Mistral-7B-Instruct-v0.3"; // Güncellenmiş model ismi
const apiUrl = `https://api-inference.huggingface.co/models/${modelName}`;

async function generateText(prompt) {
    try {
        const response = await fetch(apiUrl, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                inputs: prompt,
                parameters: {
                    max_new_tokens: 200, // Çıktı uzunluğu
                    temperature: 0.7, // Yaratıcılığı ayarlar
                    return_full_text: false // Sadece oluşturulan metni al
                }
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP hatası! Durum: ${response.status}`);
        }

        const data = await response.json();
        console.log("API Yanıtı:", data);

        if (data && data.length > 0 && data[0].generated_text) {
            return data[0].generated_text;
        } else {
            return "Metin oluşturulamadı.";
        }
    } catch (error) {
        console.error("Hata:", error);
        return `Metin oluşturulamadı: ${error.message}`;
    }
}

// Test et
generateText("Merhaba dünya, bugün hava nasıl?").then(result => console.log(result));
