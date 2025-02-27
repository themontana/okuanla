const apiKey = "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"; // Hugging Face API anahtarı
const modelName = "mistralai/Mistral-7B-Instruct-v0.3"; // Metin oluşturma model adı
const translationModel = "Helsinki-NLP/opus-mt-en-trk"; // Çeviri modeli (İngilizce -> Türkçe)
const apiUrl = `https://api-inference.huggingface.co/models/${modelName}`; // Metin oluşturma API URL'si
const translationApiUrl = `https://api-inference.huggingface.co/models/${translationModel}`; // Çeviri API URL'si

// Metin oluşturma fonksiyonu
async function generateText(prompt) {
    try {
        // Metni oluşturma isteği gönder
        const response = await fetch(apiUrl, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                inputs: prompt,
                parameters: {
                    max_new_tokens: 400, // Çıktı uzunluğu
                    temperature: 0.5, // Yaratıcılığı ayarlamak için
                    return_full_text: false // Sadece oluşturulan metni almak
                }
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP hatası! Durum: ${response.status}`);
        }

        const data = await response.json();
        console.log("Metin Oluşturma Yanıtı:", data);

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

// Çeviri fonksiyonu
async function translateText(text) {
    try {
        // İngilizce metni Türkçeye çevirme isteği gönder
        const response = await fetch(translationApiUrl, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                inputs: text
            })
        });

        if (!response.ok) {
            throw new Error(`Çeviri hatası! Durum: ${response.status}`);
        }

        const data = await response.json();
        console.log("Çeviri Yanıtı:", data);

        if (data && data.length > 0 && data[0].translation_text) {
            return data[0].translation_text;
        } else {
            return "Çeviri yapılamadı.";
        }
    } catch (error) {
        console.error("Hata:", error);
        return `Çeviri yapılamadı: ${error.message}`;
    }
}

// Formu dinlemek ve işlem yapmak için
document.getElementById("textForm").addEventListener("submit", async function (event) {
    event.preventDefault(); // Sayfanın yenilenmesini önler

    // Formdan değerleri al
    const grade = document.getElementById("grade").value;
    const theme = document.getElementById("theme").value;
    const keywords = document.getElementById("keywords").value;
    const questionCount = document.getElementById("questionCount").value;

    // İngilizce Prompt oluştur (cevapları dahil etme)
    const prompt = `Create a meaningful reading comprehension text in English for a ${grade} grade student, with the theme "${theme}" and using the words "${keywords}". Include ${questionCount} questions related to the text, but do not provide answers to the questions. Make sure the text is appropriate for children and the questions are simple and clear.`;

    // Sayfada metin oluşturuluyor olduğunu göster
    document.getElementById("output").innerHTML = "<p>Generating text...</p>";

    try {
        // İngilizce metni oluştur
        const generatedText = await generateText(prompt);

        // Türkçeye çevir
        const translatedText = await translateText(generatedText);

        // Çevrilen metni sayfada göster
        document.getElementById("output").innerHTML = `<p>${translatedText}</p>`;
    } catch (error) {
        // Hata oluşursa kullanıcıya göster
        document.getElementById("output").innerHTML = `<p>Metin oluşturulamadı: ${error.message}</p>`;
    }
});
