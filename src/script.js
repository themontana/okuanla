document.getElementById("textForm").addEventListener("submit", async function(event) {
    event.preventDefault();

    const grade = document.getElementById("grade").value;
    const theme = document.getElementById("theme").value;
    const keywords = document.getElementById("keywords").value;
    const questionCount = document.getElementById("questionCount").value;

    const prompt = `İlkokul ${grade}. sınıf seviyesinde, "${theme}" temalı, içinde "${keywords}" kelimeleri geçen bir okuma metni oluştur. Ayrıca ${questionCount} tane okuduğunu anlama sorusu ekle.`;

    document.getElementById("output").innerHTML = "<p>Metin oluşturuluyor... (Bu işlem 20-30 saniye sürebilir)</p>";

    try {
        const apiUrl = "/generate-text";
        
        const response = await fetch(apiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP hatası! Durum: ${response.status}`);
        }

        const data = await response.json();
        console.log("API yanıtı:", data);

        // Farklı API yanıt formatlarını ele al
        let generatedText = "";
        
        if (Array.isArray(data) && data.length > 0 && data[0].generated_text) {
            generatedText = data[0].generated_text;
        } else if (data && data.generated_text) {
            generatedText = data.generated_text;
        } else if (typeof data === 'string') {
            generatedText = data;
        } else {
            throw new Error("API yanıtı beklenen formatta değil.");
        }
        
        // Metni paragraflar halinde formatla
        const formattedText = generatedText
            .split('\n')
            .map(para => para.trim())
            .filter(para => para.length > 0)
            .map(para => `<p>${para}</p>`)
            .join('');
            
        document.getElementById("output").innerHTML = formattedText;
    } catch (error) {
        document.getElementById("output").innerHTML = `<p>Metin oluşturulamadı: ${error.message}</p>`;
        console.error("API hatası:", error);
    }
});
