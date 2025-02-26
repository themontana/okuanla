document.getElementById("textForm").addEventListener("submit", async function(event) {
    event.preventDefault();

    const grade = document.getElementById("grade").value;
    const theme = document.getElementById("theme").value;
    const keywords = document.getElementById("keywords").value;
    const questionCount = document.getElementById("questionCount").value;

    const prompt = `İlkokul ${grade}. sınıf seviyesinde, "${theme}" temalı, içinde "${keywords}" kelimeleri geçen bir okuma metni oluştur. Ayrıca ${questionCount} tane okuduğunu anlama sorusu ekle.`;

    document.getElementById("output").innerHTML = "<p>Metin oluşturuluyor... (Bu işlem 20-30 saniye sürebilir)</p>";

    try {
        const apiUrl = "/api/generate-text";
        
        console.log("İstek gönderiliyor:", apiUrl);
        const startTime = new Date();
        
        const response = await fetch(apiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt })
        });
        
        const endTime = new Date();
        console.log(`Yanıt alındı (${endTime - startTime}ms): Status ${response.status}`);
        
        // HTTP hatası varsa, yanıtın içeriğini de göster
        if (!response.ok) {
            const errorText = await response.text();
            console.error("API hata yanıtı:", errorText);
            
            document.getElementById("output").innerHTML = `
                <p>Metin oluşturulamadı: HTTP hatası! Durum: ${response.status}</p>
                <details>
                    <summary>Hata Detayları (Geliştirici için)</summary>
                    <pre>${errorText}</pre>
                </details>
            `;
            return;
        }

        const data = await response.json();
        console.log("API yanıtı:", data);

        if (data.error) {
            throw new Error(data.error + (data.details ? ": " + data.details : ""));
        }
        
        // API yanıtını işle
        if (Array.isArray(data) && data.length > 0 && data[0].generated_text) {
            // Oluşturulan metni paragraflar halinde formatlama
            const formattedText = data[0].generated_text.replace(/\n/g, '<br>');
            document.getElementById("output").innerHTML = `<div>${formattedText}</div>`;
        } else if (data && data.generated_text) {
            const formattedText = data.generated_text.replace(/\n/g, '<br>');
            document.getElementById("output").innerHTML = `<div>${formattedText}</div>`;
        } else {
            document.getElementById("output").innerHTML = "<p>Metin oluşturulamadı. API yanıtı beklenmeyen formatta.</p>";
            console.error("Beklenmeyen API yanıtı:", data);
        }
    } catch (error) {
        document.getElementById("output").innerHTML = `
            <p>Metin oluşturulamadı: ${error.message}</p>
            <details>
                <summary>Hata Detayları</summary>
                <pre>${error.stack || "Stack bilgisi yok"}</pre>
            </details>
        `;
        console.error("API hatası:", error);
    }
});
