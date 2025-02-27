const apiKey = "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"; // Hugging Face API anahtarı
const modelName = "mistralai/Mistral-7B-Instruct-v0.3"; // Model adı
const apiUrl = `https://api-inference.huggingface.co/models/${modelName}`; // API URL'si

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
                    max_new_tokens: 400, // Daha uzun metinler için artırdık
                    temperature: 0.5, // Daha tutarlı metinler için düşürdük
                    return_full_text: false // Yalnızca metni döndür
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

document.getElementById("textForm").addEventListener("submit", async function (event) {
    event.preventDefault(); // Sayfanın yenilenmesini önler

    // Formdan değerleri al
    const grade = document.getElementById("grade").value;
    const theme = document.getElementById("theme").value;
    const keywords = document.getElementById("keywords").value;
    const questionCount = document.getElementById("questionCount").value;

    // Prompt oluştur
    const prompt = `İlkokul ${grade}. sınıf seviyesinde, "${theme}" temalı, içinde "${keywords}" kelimeleri geçen anlamlı bir okuma metni oluştur. Metnin sonunda okuduğunu anlama soruları olsun. Lütfen metnin Türkçe olmasına ve dilbilgisel olarak doğru olmasına özen göster. Soruların içinde İngilizce kullanma. Ayrıca metin, açıklayıcı ve basit olmalıdır.`;
    
    document.getElementById("output").innerHTML = "<p>Metin oluşturuluyor...</p>";

    try {
        // Metin oluşturma isteği gönder
        const result = await generateText(prompt);

        // Yanıtı ekrana yazdır
        document.getElementById("output").innerHTML = `<p>${result}</p>`;
    } catch (error) {
        document.getElementById("output").innerHTML = `<p>Metin oluşturulamadı: ${error.message}</p>`;
    }
});
