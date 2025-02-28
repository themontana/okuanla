const apiKey = "Bearer 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"; // Hugging Face API anahtarınız
const apiUrl = "https://api-inference.huggingface.co/models/mistralai/Mixtral-8x7B-Instruct-v0.1";
// Formu dinleyerek işlem yapmak
document.getElementById("textForm").addEventListener("submit", async function (event) {
    event.preventDefault(); // Sayfanın yenilenmesini önler

    // Kullanıcıdan alınan girdiler
    const grade = document.getElementById("grade").value.trim();
    const theme = document.getElementById("theme").value.trim();
    const keywords = document.getElementById("keywords").value.trim();
    const questionCount = document.getElementById("questionCount").value.trim();

    // Eğer kullanıcı herhangi bir alanı boş bırakırsa hata mesajı göster
    if (!grade || !theme || !keywords || !questionCount) {
        document.getElementById("output").innerHTML = "<p>Lütfen tüm alanları doldurun.</p>";
        return;
    }

    // Kullanıcı girdilerine göre prompt oluştur
    const prompt = `Lütfen ${grade}. sınıf öğrencileri için "${theme}" temalı, içerisinde "${keywords}" kelimelerini içeren anlamlı bir okuma metni oluştur. 
    Metnin sonunda ${questionCount} adet basit ve net okuduğunu anlama sorusu ekleyin. Soruların cevaplarını vermeyin. 
    Metnin çocuklara uygun ve eğitici olmasını sağlayın.`;

    // Kullanıcıya metin oluşturuluyor bilgisini göster
    document.getElementById("output").innerHTML = "<p>Metin oluşturuluyor...</p>";

    try {
        // Metni oluştur ve kullanıcıya göster
        const generatedText = await generateText(prompt);
        document.getElementById("output").innerHTML = `<p>${generatedText}</p>`;
    } catch (error) {
        // Hata durumunda kullanıcıya mesaj göster
        document.getElementById("output").innerHTML = `<p>Metin oluşturulamadı: ${error.message}</p>`;
    }
});

// Hugging Face API'yi kullanarak metin oluşturma fonksiyonu
async function generateText(prompt) {
    try {
        const response = await fetch(apiUrl, {
            method: "POST",
            headers: {
                "Authorization": apiKey,
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
        console.log("API Yanıtı:", data);

        // API yanıtı "generated_text" yerine farklı bir formatta olabilir, bu yüzden kontrol ekledim.
        if (data && typeof data === "object") {
            if (data.generated_text) {
                return data.generated_text;
            } else if (Array.isArray(data) && data.length > 0 && data[0].generated_text) {
                return data[0].generated_text;
            }
        }
        
        return "Metin oluşturulamadı.";
    } catch (error) {
        console.error("Hata:", error);
        return `Metin oluşturulamadı: ${error.message}`;
    }
}
