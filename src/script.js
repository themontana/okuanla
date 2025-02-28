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
        document.getElementById("output").innerHTML = `
            <div style="position: relative;">
                <button id="printButton" style="position: absolute; top: 0; right: 0; padding: 5px 10px; background-color: #4CAF50; color: white; border: none; cursor: pointer;">Yazdır</button>
                <p id="generatedText">${generatedText}</p>
            </div>
        `;

        // Yazdır butonunu işlevsel hale getir
        document.getElementById("printButton").addEventListener("click", function () {
            const printContent = document.getElementById("generatedText").innerHTML;
            const printWindow = window.open('', '', 'height=600,width=800');
            printWindow.document.write('<html><head><title>Yazdır</title></head><body>');
            printWindow.document.write('<p>' + printContent + '</p>');
            printWindow.document.write('</body></html>');
            printWindow.document.close();
            printWindow.print(); // Yazdırma işlemi
        });

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

        // API yanıtını kontrol et ve metni çıkart
        if (data && data.candidates && data.candidates.length > 0 && 
            data.candidates[0].content && data.candidates[0].content.parts && 
            data.candidates[0].content.parts.length > 0) {
            
            // Doğru yol: content.parts[0].text
            const generatedText = data.candidates[0].content.parts[0].text;
            
            if (generatedText) {
                return generatedText;
            }
        }

        return "Metin oluşturulamadı: API yanıt formatı beklendiği gibi değil.";
    } catch (error) {
        console.error("Hata:", error);
        return `Metin oluşturulamadı: ${error.message}`;
    }
}
