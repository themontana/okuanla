document.getElementById("textForm").addEventListener("submit", async function(event) {
    event.preventDefault(); // Sayfanın yenilenmesini önler

    const grade = document.getElementById("grade").value;
    const theme = document.getElementById("theme").value;
    const keywords = document.getElementById("keywords").value;
    const questionCount = document.getElementById("questionCount").value;

    const prompt = `İlkokul ${grade}. sınıf seviyesinde, "${theme}" temalı, içinde "${keywords}" kelimeleri geçen bir okuma metni oluştur. Ayrıca ${questionCount} tane okuduğunu anlama sorusu ekle.`;

    document.getElementById("output").innerHTML = "<p>Metin oluşturuluyor...</p>";

    try {
        const response = await fetch("/api/generate-text", { // API'nin doğru yolunu kontrol et
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ grade, theme, keywords, questionCount })
        });

        console.log("API'ye istek gönderildi."); // Kontrol amaçlı log ekledik

        if (!response.ok) {
            throw new Error(`HTTP hatası! Durum: ${response.status}`);
        }

        const data = await response.json();
        console.log("API yanıtı:", data); // Yanıtı konsola yazdır

        if (data.text) {
            document.getElementById("output").innerHTML = `<p>${data.text}</p>`;
        } else {
            document.getElementById("output").innerHTML = "<p>Metin oluşturulamadı.</p>";
        }
    } catch (error) {
        document.getElementById("output").innerHTML = `<p>Metin oluşturulamadı: ${error.message}</p>`;
        console.error("API hatası:", error);
    }
});