document.getElementById("textForm").addEventListener("submit", async function(event) {
    event.preventDefault();

    const grade = document.getElementById("grade").value;
    const theme = document.getElementById("theme").value;
    const keywords = document.getElementById("keywords").value;
    const questionCount = document.getElementById("questionCount").value;

    const prompt = `İlkokul ${grade}. sınıf seviyesinde, "${theme}" temalı, içinde "${keywords}" kelimeleri geçen bir okuma metni oluştur. Ayrıca ${questionCount} tane okuduğunu anlama sorusu ekle.`;

    document.getElementById("output").innerHTML = "<p>Metin oluşturuluyor...</p>";

    try {
        const response = await fetch("/api/generate-text", { // Backend API'yi çağır
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt }) // Prompt'u backend'e gönder
        });

        const data = await response.json();
        if (data.result) {
            document.getElementById("output").innerHTML = `<p>${data.result}</p>`;
        } else {
            document.getElementById("output").innerHTML = "<p>Metin oluşturulamadı.</p>";
        }
    } catch (error) {
        document.getElementById("output").innerHTML = `<p>Hata oluştu: ${error.message}</p>`;
    }
});
