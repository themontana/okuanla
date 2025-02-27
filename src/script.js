document.getElementById("textForm").addEventListener("submit", async function(event) {
    event.preventDefault();

    const grade = document.getElementById("grade").value;
    const theme = document.getElementById("theme").value;
    const keywords = document.getElementById("keywords").value;
    const questionCount = document.getElementById("questionCount").value;

    // Debug bilgisi
    if (document.getElementById("debugInfo")) {
        document.getElementById("debugInfo").innerHTML = `
            <p>Gönderilen veriler:</p>
            <pre>${JSON.stringify({ grade, theme, keywords, questionCount }, null, 2)}</pre>
        `;
    }

    document.getElementById("output").innerHTML = "<p>Metin oluşturuluyor...</p>";

    try {
        const baseUrl = window.location.origin;
        const response = await fetch(`${baseUrl}/api/generate-text`, {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify({ grade, theme, keywords, questionCount })
        });

        // Yanıt durum bilgisi
        if (document.getElementById("debugInfo")) {
            document.getElementById("debugInfo").innerHTML += `
                <p>Yanıt durum kodu: ${response.status}</p>
                <p>Yanıt durum mesajı: ${response.statusText}</p>
            `;
        }

        // Hata durumunda bile yanıt gövdesini almaya çalışalım
        const responseText = await response.text();
        
        if (document.getElementById("debugInfo")) {
            document.getElementById("debugInfo").innerHTML += `
                <p>Yanıt içeriği:</p>
                <pre>${responseText}</pre>
            `;
        }

        if (!response.ok) {
            // Yanıt içeriğini JSON olarak parse etmeyi deneyelim
            try {
                const errorData = JSON.parse(responseText);
                throw new Error(`HTTP hatası! Durum: ${response.status}, Mesaj: ${errorData.error || 'Bilinmeyen hata'}`);
            } catch (e) {
                // JSON parse hatası durumunda ham metni kullan
                throw new Error(`HTTP hatası! Durum: ${response.status}, Yanıt: ${responseText}`);
            }
        }

        // Başarılı yanıt
        const data = JSON.parse(responseText);
        document.getElementById("output").innerHTML = `<p>${data.text}</p>`;
    } catch (error) {
        document.getElementById("output").innerHTML = `<p>Metin oluşturulamadı: ${error.message}</p>`;
        console.error("API hatası:", error);
        
        if (document.getElementById("debugInfo")) {
            document.getElementById("debugInfo").innerHTML += `
                <p>Hata:</p>
                <pre>${error.toString()}</pre>
                <p>Stack:</p>
                <pre>${error.stack || 'Stack bilgisi yok'}</pre>
            `;
        }
    }
});

// Debug modunu aç
document.getElementById('debug').style.display = 'block';
