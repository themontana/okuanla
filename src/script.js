document.getElementById("textForm").addEventListener("submit", async function (event) {
    event.preventDefault(); // Sayfanın yenilenmesini önler

    // Formdan değerleri al
    const grade = document.getElementById("grade").value;
    const theme = document.getElementById("theme").value;
    const keywords = document.getElementById("keywords").value;
    const questionCount = document.getElementById("questionCount").value;

    // Prompt oluştur
    const prompt = `İlkokul ${grade}. sınıf seviyesinde, "${theme}" temalı, içinde "${keywords}" kelimeleri geçen bir okuma metni oluştur. Ayrıca ${questionCount} tane okuduğunu anlama sorusu ekle.`;

    document.getElementById("output").innerHTML = "<p>Metin oluşturuluyor...</p>";

    try {
        // Hugging Face API'ye istek gönder
        const response = await fetch('https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.3', {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer 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',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                inputs: prompt,
                parameters: {
                    max_tokens: 500
                }
            })
        });

        const data = await response.json();
        console.log(data); // API yanıtını kontrol et

        // Yanıtı ekrana yazdır
        if (data && data.choices && data.choices.length > 0) {
            document.getElementById("output").innerHTML = `<p>${data.choices[0].text}</p>`;
        } else {
            document.getElementById("output").innerHTML = "<p>Metin oluşturulamadı.</p>";
        }

    } catch (error) {
        document.getElementById("output").innerHTML = `<p>Metin oluşturulamadı: ${error.message}</p>`;
        console.error("API hatası:", error);
    }
});
