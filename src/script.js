document.getElementById("textForm").addEventListener("submit", async function(event) {
    event.preventDefault(); // Sayfanın yenilenmesini önler

    const grade = document.getElementById("grade").value;
    const theme = document.getElementById("theme").value;
    const keywords = document.getElementById("keywords").value;
    const questionCount = document.getElementById("questionCount").value;

    const prompt = `İlkokul ${grade}. sınıf seviyesinde, "${theme}" temalı, içinde "${keywords}" kelimeleri geçen bir okuma metni oluştur. Ayrıca ${questionCount} tane okuduğunu anlama sorusu ekle.`;

    document.getElementById("output").innerHTML = "<p>Metin oluşturuluyor...</p>";

    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=AIzaSyAuEjJ-mFZ_bbdAZM1p8lbFaNFXbR1K6RQ", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }]
        })
    });

    const data = await response.json();
    if (data.candidates) {
        document.getElementById("output").innerHTML = `<p>${data.candidates[0].content.parts[0].text}</p>`;
    } else {
        document.getElementById("output").innerHTML = "<p>Metin oluşturulamadı.</p>";
    }
});
