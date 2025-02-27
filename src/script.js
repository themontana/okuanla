document.getElementById("textForm").addEventListener("submit", async function(event) {
    event.preventDefault(); // Sayfanın yenilenmesini önler

    const grade = document.getElementById("grade").value;
    const theme = document.getElementById("theme").value;
    const keywords = document.getElementById("keywords").value;
    const questionCount = document.getElementById("questionCount").value;

    document.getElementById("output").innerHTML = "<p>Metin oluşturuluyor...</p>";

    try {
        const response = await fetch("/api/generate-text", { // **Burada API path'ini düzelttim**
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ grade, theme, keywords, questionCount })
        });

        if (!response.ok) {
            throw new Error(`HTTP hatası! Durum: ${response.status}`);
        }

        const data = await response.json();
        document.getElementById("output").innerHTML = `<p>${data.text}</p>`;
    } catch (error) {
        document.getElementById("output").innerHTML = `<p>Metin oluşturulamadı: ${error.message}</p>`;
        console.error("API hatası:", error);
    }
});