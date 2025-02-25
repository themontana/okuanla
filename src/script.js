document.getElementById("textForm").addEventListener("submit", async function(event) {
    event.preventDefault(); // Sayfanın yenilenmesini önler

    const grade = document.getElementById("grade").value;
    const theme = document.getElementById("theme").value;
    const keywords = document.getElementById("keywords").value;
    const questionCount = document.getElementById("questionCount").value;

    const prompt = `İlkokul ${grade}. sınıf seviyesinde, "${theme}" temalı, içinde "${keywords}" kelimeleri geçen bir okuma metni oluştur. Ayrıca ${questionCount} tane okuduğunu anlama sorusu ekle.`;

    document.getElementById("output").innerHTML = "<p>Metin oluşturuluyor...</p>";

    const apiKey = "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";  // Hugging Face API anahtarınızı buraya ekledik
    const apiUrl = `https://api-inference.huggingface.co/models/gpt2`;  // Kullanmak istediğiniz modelin API URL'si

    try {
        const response = await fetch(apiUrl, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                inputs: prompt
            })
        });

        if (!response.ok) {
            throw new Error(`API hatası: ${response.statusText}`);
        }

        const data = await response.json();
        console.log(data); // Yanıtı kontrol et

        if (data && data[0].generated_text) {
            document.getElementById("output").innerHTML = `<p>${data[0].generated_text}</p>`;
        } else {
            document.getElementById("output").innerHTML = "<p>Metin oluşturulamadı.</p>";
        }
    } catch (error) {
        document.getElementById("output").innerHTML = `<p>Metin oluşturulamadı: ${error.message}</p>`;
        console.error("API hatası:", error);
    }
});
