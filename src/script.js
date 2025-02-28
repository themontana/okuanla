const apiKey = "AIzaSyB_x9426cjJle2hNCtcl-fs9hbR8eTRiwM"; // Google Gemini API anahtarınız
const apiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" + apiKey;

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

    // Kullanıcı girdilerine göre geliştirilmiş prompt
    const prompt = `
    Lütfen ${grade}. sınıf öğrencileri için "${theme}" temalı, içerisinde "${keywords}" kelimelerini içeren anlamlı bir okuma metni oluştur.
    - Metnin uzunluğu yaklaşık 150-250 kelime olmalı.
    - Metin, ${grade}. sınıf seviyesinde, yaşa uygun ve anlaşılır olmalı.
    - Metin eğitici, öğretici olmalı ve çocukların gelişimine katkı sağlamak için uygun dil kullanılmalıdır.
    - Metnin sonunda ${questionCount} adet, öğrencilerin anlamalarını test edecek şekilde, açık uçlu ve basit okuma sorusu oluştur.
    Sorular, metne dayalı olarak sorulmalı ve soruların cevapları metinde yer almalıdır.
    Ayrıca, metnin içerisinde geçen ${keywords} kelimelerinin anlamını öğreten sorulara yer verilebilir.
    Metnin ve soruların her ikisi de çocuklar için anlaşılır ve motive edici olmalıdır.`;

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

// Google Gemini API'yi kullanarak metin oluşturma fonksiyonu
async function generateText(prompt) {
    try {
        const response = await fetch(apiUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }]
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP hatası! Durum: ${response.status}`);
        }

        const data = await response.json();
        console.log("API Yanıtı:", data);

        // API yanıtını işleme
        if (data && data.contents && data.contents.length > 0) {
            return data.contents[0].parts[0].text;
        }

        return "Metin oluşturulamadı.";
    } catch (error) {
        console.error("Hata:", error);
        return `Metin oluşturulamadı: ${error.message}`;
    }
}
