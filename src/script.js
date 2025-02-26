document.getElementById("textForm").addEventListener("submit", async function(event) {
    event.preventDefault();

    const grade = document.getElementById("grade").value;
    const theme = document.getElementById("theme").value;
    const keywords = document.getElementById("keywords").value;
    const questionCount = document.getElementById("questionCount").value;

    const prompt = `İlkokul ${grade}. sınıf seviyesinde, "${theme}" temalı, içinde "${keywords}" kelimeleri geçen bir okuma metni oluştur. Ayrıca ${questionCount} tane okuduğunu anlama sorusu ekle.`;

    document.getElementById("output").innerHTML = "<p>Metin oluşturuluyor...</p>";

    try {
        // Try with the updated path
        const apiUrl = "/generate-text";
        console.log("Sending request to:", apiUrl);
        
        const response = await fetch(apiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt })
        });

        console.log("Response status:", response.status);
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Response data:", data);

        if (data.length > 0 && data[0].generated_text) {
            document.getElementById("output").innerHTML = `<p>${data[0].generated_text}</p>`;
        } else if (data.generated_text) {
            // Handle different response format
            document.getElementById("output").innerHTML = `<p>${data.generated_text}</p>`;
        } else {
            document.getElementById("output").innerHTML = "<p>Metin oluşturulamadı. API yanıtı beklenen formatta değil.</p>";
            console.error("Unexpected API response format:", data);
        }
    } catch (error) {
        document.getElementById("output").innerHTML = `<p>Metin oluşturulamadı: ${error.message}</p>`;
        console.error("API hatası:", error);
    }
});
