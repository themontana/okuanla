document.getElementById("textForm").addEventListener("submit", async function(event) {
    event.preventDefault();

    const grade = document.getElementById("grade").value;
    const theme = document.getElementById("theme").value;
    const keywords = document.getElementById("keywords").value;
    const questionCount = document.getElementById("questionCount").value;

    const prompt = `İlkokul ${grade}. sınıf seviyesinde, "${theme}" temalı, içinde "${keywords}" kelimeleri geçen bir okuma metni oluştur. Ayrıca ${questionCount} tane okuduğunu anlama sorusu ekle.`;

    document.getElementById("output").innerHTML = "<p>Metin oluşturuluyor...</p>";

    try {
        const apiUrl = "/generate-text";
        console.log("Gönderilen istek:", { prompt });
        
        const response = await fetch(apiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt })
        });

        console.log("Yanıt durumu:", response.status);
        
        if (!response.ok) {
            throw new Error(`HTTP hatası! Durum: ${response.status}`);
        }

        const data = await response.json();
        console.log("Ham API yanıtı:", data);

        // API yanıtını daha açık görelim
        document.getElementById("output").innerHTML = `
            <p><strong>API Yanıtı:</strong></p>
            <pre>${JSON.stringify(data, null, 2)}</pre>
        `;
        
        // Eğer doğru format gelirse metni göster
        if (data && Array.isArray(data) && data.length > 0 && data[0].generated_text) {
            document.getElementById("output").innerHTML = `<p>${data[0].generated_text}</p>`;
        } else if (data && data.generated_text) {
            document.getElementById("output").innerHTML = `<p>${data.generated_text}</p>`;
        }
    } catch (error) {
        document.getElementById("output").innerHTML = `<p>Metin oluşturulamadı: ${error.message}</p>`;
        console.error("API hatası:", error);
    }
});
