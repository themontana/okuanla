const apiKey = "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"; // Hugging Face API anahtarı
const modelName = "mistralai/Pixtral-12B-2409"; // Güncellenmiş model
const apiUrl = `https://api-inference.huggingface.co/models/${modelName}`; // API URL

// Formu dinlemek ve işlem yapmak için
document.getElementById("textForm").addEventListener("submit", async function (event) {
    event.preventDefault(); // Sayfanın yenilenmesini önler

    // Formdan değerleri al
    const grade = document.getElementById("grade").value;
    const theme = document.getElementById("theme").value;
    const keywords = document.getElementById("keywords").value;
    const questionCount = document.getElementById("questionCount").value;

    // Türkçe Prompt oluştur
    const prompt = `Lütfen ${grade}. sınıf öğrencileri için "${theme}" temalı, içerisinde "${keywords}" kelimelerini içeren anlamlı bir okuma metni oluştur. 
Metnin sonunda ${questionCount} adet basit ve net okuduğunu anlama sorusu ekleyin. Soruların cevaplarını vermeyin. 
Metnin çocuklara uygun ve eğitici olmasını sağlayın.`;

    // Sayfada metin oluşturuluyor olduğunu göster
    document.getElementById("output").innerHTML = "<p>Metin oluşturuluyor...</p>";

    try {
        // Metni oluştur
        const generatedText = await generateText(prompt);

        // Çıktıyı sayfada göster
        document.getElementById("output").innerHTML = `<p>${generatedText}</p>`;
    } catch (error) {
        // Hata oluşursa kullanıcıya göster
        document.getElementById("output").innerHTML = `<p>Metin oluşturulamadı: ${error.message}</p>`;
    }
});

// Metin oluşturma fonksiyonu
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