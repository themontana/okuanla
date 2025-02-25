document.getElementById("textForm").addEventListener("submit", async function(event) {
    event.preventDefault(); // Sayfanın yenilenmesini önler

    const grade = document.getElementById("grade").value;
    const theme = document.getElementById("theme").value;
    const keywords = document.getElementById("keywords").value;
    const questionCount = document.getElementById("questionCount").value;

    const prompt = `İlkokul ${grade}. sınıf seviyesinde, "${theme}" temalı, içinde "${keywords}" kelimeleri geçen bir okuma metni oluştur. Ayrıca ${questionCount} tane okuduğunu anlama sorusu ekle.`;

    document.getElementById("output").innerHTML = "<p>Metin oluşturuluyor...</p>";

    // API endpoint ve anahtarını güncelle
    const apiKey = "AIzaSyCFwMNF-VkH0vUgIuTAvYEGm0IN1qjYFRo";  // Buraya kendi API anahtarını yapıştır
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            contents: [{
                parts: [{ text: prompt }]
            }]
        })
    });

    const data = await response.json();
    if (data.candidates) {
        document.getElementById("output").innerHTML = `<p>${data.candidates[0].content.parts[0].text}</p>`;
    } else {
        document.getElementById("output").innerHTML = "<p>Metin oluşturulamadı.</p>";
    }
});
