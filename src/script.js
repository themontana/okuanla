document.getElementById("textForm").addEventListener("submit", async function(event) {
    event.preventDefault();

    const grade = document.getElementById("grade").value;
    const theme = document.getElementById("theme").value;
    const keywords = document.getElementById("keywords").value;
    const questionCount = document.getElementById("questionCount").value;

    // Debug bilgisi ekleyin (debug modunda görünecek)
    if (document.getElementById("debugInfo")) {
        document.getElementById("debugInfo").innerHTML = `
            <p>Gönderilen veriler:</p>
            <pre>${JSON.stringify({ grade, theme, keywords, questionCount }, null, 2)}</pre>
        `;
    }

    document.getElementById("output").innerHTML = "<p>Metin oluşturuluyor...</p>";

    try {
        // Tam URL ile istek yapın
        const baseUrl = window.location.origin;
        const response = await fetch(`${baseUrl}/api/generate-text`, {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                // CORS sorunlarını önlemek için ekstra güvenlik önlemleri
                "Accept": "application/json"
            },
            body: JSON.stringify({ grade, theme, keywords, questionCount })
        });

        // Yanıt içeriğini ve durum kodunu debug ekranına ekleyin
        if (document.getElementById("debugInfo")) {
            document.getElementById("debugInfo").innerHTML += `
                <p>Yanıt durum kodu: ${response.status}</p>
                <p>Yanıt durum mesajı: ${response.statusText}</p>
            `;
        }

        if (!response.ok) {
            throw new Error(`HTTP hatası! Durum: ${response.status}`);
        }

        const data = await response.json();
        document.getElementById("output").innerHTML = `<p>${data.text}</p>`;
        
        // Yanıtı debug ekranına ekleyin
        if (document.getElementById("debugInfo")) {
            document.getElementById("debugInfo").innerHTML += `
                <p>Yanıt verisi:</p>
                <pre>${JSON.stringify(data, null, 2)}</pre>
            `;
        }
    } catch (error) {
        document.getElementById("output").innerHTML = `<p>Metin oluşturulamadı: ${error.message}</p>`;
        console.error("API hatası:", error);
        
        // Hatayı debug ekranına ekleyin
        if (document.getElementById("debugInfo")) {
            document.getElementById("debugInfo").innerHTML += `
                <p>Hata:</p>
                <pre>${error.toString()}</pre>
            `;
        }
    }
});

// Debug modunu her zaman açın (geliştirme sırasında)
document.getElementById('debug').style.display = 'block';
