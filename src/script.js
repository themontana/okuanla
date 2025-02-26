document.getElementById("textForm").addEventListener("submit", async function(event) {
    event.preventDefault();

    const grade = document.getElementById("grade").value;
    const theme = document.getElementById("theme").value;
    const keywords = document.getElementById("keywords").value;
    const questionCount = document.getElementById("questionCount").value;

    const prompt = `İlkokul ${grade}. sınıf seviyesinde, "${theme}" temalı, içinde "${keywords}" kelimeleri geçen bir okuma metni oluştur. Ayrıca ${questionCount} tane okuduğunu anlama sorusu ekle.`;

    document.getElementById("output").innerHTML = "<p>Metin oluşturuluyor...</p>";

    try {
        const response = await fetch("/api/generate-text", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt })
        });

        const data = await response.json();

        if (data.length > 0) {
            document.getElementById("output").innerHTML = `<p>${data[0].generated_text}</p>`;
        } else {
            document.getElementById("output").innerHTML = "<p>Metin oluşturulamadı.</p>";
        }
    } catch (error) {
        document.getElementById("output").innerHTML = `<p>Metin oluşturulamadı: ${error.message}</p>`;
        console.error("API hatası:", error);
    }
});
