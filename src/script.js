// Metin oluşturma fonksiyonu (Çeviri kısmı dışında, text generation)
async function generateText(prompt) {
    const modelName = "mistralai/Mistral-7B-Instruct-v0.3"; // Metin oluşturma modeli
    const apiUrl = `https://api-inference.huggingface.co/models/${modelName}`; // Metin oluşturma API URL'si

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
                    max_new_tokens: 500, // Çıktı uzunluğu
                    temperature: 0.7, // Yaratıcılığı ayarlamak için
                    return_full_text: true // Soruları dahil et
                }
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP hatası! Durum: ${response.status}`);
        }

        const data = await response.json();
        console.log("Metin Oluşturma Yanıtı:", data);

        // Yanıtı kontrol et
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

// Formu dinlemek ve işlem yapmak için
document.getElementById("textForm").addEventListener("submit", async function (event) {
    event.preventDefault(); // Sayfanın yenilenmesini önler

    // Formdan değerleri al
    const grade = document.getElementById("grade").value;
    const theme = document.getElementById("theme").value;
    const keywords = document.getElementById("keywords").value;
    const questionCount = document.getElementById("questionCount").value;

    // İngilizce Prompt oluştur (cevapları dahil etme)
    const prompt = `
    Create a meaningful reading comprehension text in English for a ${grade} grade student, with the theme "${theme}" and using the words "${keywords}". 
    Include ${questionCount} simple and clear questions related to the text at the end of the story, but do not provide answers to the questions. 
    Make sure the text is appropriate for children and the questions are simple and clear.
    `;

    // Sayfada metin oluşturuluyor olduğunu göster
    document.getElementById("output").innerHTML = "<p>Generating text...</p>";

    try {
        // Metni oluştur
        const generatedText = await generateText(prompt);

        // İngilizce metni Türkçeye çevir
        const translatedText = await translateText(generatedText, "en_XX", "tr_TR");

        // Çevrilen metni sayfada göster
        document.getElementById("output").innerHTML = `<p>${translatedText}</p>`;
    } catch (error) {
        // Hata oluşursa kullanıcıya göster
        document.getElementById("output").innerHTML = `<p>Metin oluşturulamadı: ${error.message}</p>`;
    }
});
