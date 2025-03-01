// Remove the direct reference to process.env
// Instead, we'll make API calls through our backend
document.getElementById("textForm").addEventListener("submit", async function (event) {
    event.preventDefault(); // Prevents page refresh

    // Get user inputs
    const grade = document.getElementById("grade").value.trim();
    const theme = document.getElementById("theme").value.trim();
    const keywords = document.getElementById("keywords").value.trim();
    const questionCount = document.getElementById("questionCount").value.trim();

    // Show error if any field is empty
    if (!grade || !theme || !keywords || !questionCount) {
        document.getElementById("output").innerHTML = "<p>Lütfen tüm alanları doldurun.</p>";
        return;
    }

    // Function to determine word count range based on grade
    function getWordCountRange(grade) {
        switch(grade) {
            case '1':
                return '150-200'; // Grade 1: 150-200 words
            case '2':
                return '200-250'; // Grade 2: 200-250 words
            case '3':
                return '250-300'; // Grade 3: 250-300 words
            case '4':
                return '300-350'; // Grade 4: 300-350 words
            default:
                return '150-200'; // Default to Grade 1 range
        }
    }

    const prompt = `
        Lütfen ${grade}. sınıf öğrencileri için "${theme}" temalı, içerisinde "${keywords}" kelimelerini içeren, öğretici ve eğlenceli bir okuma metni oluştur.
        - Metnin uzunluğu yaklaşık ${getWordCountRange(grade)} kelime olmalı.
        - Metin, ${grade}. sınıf seviyesinde, yaşa uygun ve kolayca anlaşılır olmalı.
        - Metnin amacı çocukların dil gelişimini ve genel okuma becerilerini desteklemek olmalıdır.
        - Metin, dikkat çekici ve motive edici bir dil kullanarak çocukların ilgisini çekecek şekilde yazılmalıdır.
        - Metnin sonunda ${questionCount} adet okuma sorusu oluşturulmalı. Sorular:
            - Öğrencilerin metni anlama düzeyini ölçmeli.
            - Sorular, metnin ana fikrine dayalı olmalı.
            - Her soru, çocukların metni doğru bir şekilde anlamalarını sağlamak için net olmalı.
        Metnin ve soruların tonu, çocuklar için anlaşılır ve motive edici olmalıdır.`;

    // Show "generating text" message
    document.getElementById("output").innerHTML = "<p>Metin oluşturuluyor...</p>";

    try {
        // Call our own API endpoint instead of directly calling Gemini
        const response = await fetch('/api/generate-text', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ prompt })
        });

        if (!response.ok) {
            throw new Error(`HTTP hatası! Durum: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.generatedText) {
            // Format the text with headings and paragraphs
            let formattedText = data.generatedText.replace(/^(.*?)(\n|$)/gm, (match, p1) => {
                // Style for headings ending with colon
                if (p1.trim().endsWith(':')) {
                    return `<h2 style="font-size: 24px; font-weight: bold; text-align: center;">${p1.trim()}</h2>`;
                } else if (p1.trim().startsWith("**") && p1.trim().endsWith("**")) {
                    // Style for markdown headings
                    const title = p1.replace(/\*\*/g, '').trim();
                    return `<h1 style="font-size: 32px; font-weight: bold; text-align: center;">${title}</h1>`;
                } else {
                    // Normal paragraph style
                    return `<p style="text-indent: 20px; margin-bottom: 15px; line-height: 1.6; font-family: Arial, sans-serif;">${p1.trim()}</p>`;
                }
            });

            // Add print button
            document.getElementById("output").innerHTML = `
                <div style="position: relative; font-family: Arial, sans-serif; font-size: 16px; line-height: 1.6;">
                    <button id="printButton" style="position: absolute; top: 0; right: 0; padding: 5px 10px; background-color: #4CAF50; color: white; border: none; cursor: pointer; font-size: 14px;">Yazdır</button>
                    ${formattedText}
                </div>
            `;

            // Add print functionality
            document.getElementById("printButton").addEventListener("click", function () {
                const printContent = document.getElementById("output").innerHTML;

                // Create print window with watermark
                const printWindow = window.open('', '', 'height=600,width=800');
                printWindow.document.write('<html><head><title>Yazdır</title><style>body { font-family: Arial, sans-serif; font-size: 16px; line-height: 1.6; }</style></head><body>');
                printWindow.document.write('<div>' + printContent + '</div>');
                printWindow.document.write('<div style="position: fixed; top: 10px; right: 10px; font-size: 20px; color: #d3d3d3; font-weight: bold;">OkuAnla.net</div>');
                printWindow.document.write('</body></html>');
                printWindow.document.close();
                printWindow.print();
            });
        } else {
            document.getElementById("output").innerHTML = "<p>Metin oluşturulamadı: API yanıtı geçersiz.</p>";
        }
    } catch (error) {
        console.error("Hata:", error);
        document.getElementById("output").innerHTML = `<p>Metin oluşturulamadı: ${error.message}</p>`;
    }
});
