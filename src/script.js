document.getElementById("textForm").addEventListener("submit", async function (event) {
    event.preventDefault(); // Sayfanın yenilenmesini önler

    // Kullanıcıdan alınan girdiler
    const grade = document.getElementById("grade").value.trim();
    const theme = document.getElementById("theme").value.trim();
    const keywords = document.getElementById("keywords").value.trim();
    const questionCount = document.getElementById("questionCount").value.trim();

    // Eğer kullanıcı herhangi bir alanı boş bırakırsa hata mesajı göster
    if (!grade || !theme || !keywords || !questionCount) {
        document.getElementById("output").innerHTML = "<p>Lütfen tüm alanları doldurun.</p>";
        return;
    }

    // Grade seçeneğine göre kelime sayısı aralığını ayarlayan fonksiyon
    function getWordCountRange(grade) {
        switch(grade) {
            case '1':
                return '150-200'; // 1. sınıf için kelime sayısı 150-200 arası
            case '2':
                return '200-250'; // 2. sınıf için kelime sayısı 200-250 arası
            case '3':
                return '250-300'; // 3. sınıf için kelime sayısı 250-300 arası
            case '4':
                return '300-350'; // 4. sınıf için kelime sayısı 300-350 arası
            default:
                return '150-200'; // Varsayılan olarak 1. sınıf aralığı
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

    // Kullanıcıya metin oluşturuluyor bilgisini göster
    document.getElementById("output").innerHTML = "<p>Metin oluşturuluyor...</p>";

    try {
        // Metni oluştur ve kullanıcıya göster
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
            const generatedText = data.generatedText;

            // Metin biçimlendirme
            // 1. Başlıkları ve soruları tespit et
            let formattedText = generatedText.replace(/^(.*?)(\n|$)/gm, (match, p1) => {
                // Sorular bölümü başlığını tespit et ve ortala
                if (p1.trim().includes("Sorular") || p1.trim().includes("Okuma Soruları") || p1.trim().includes("Sorular:")) {
                    return `<h2 style="font-size: 24px; font-weight: bold; text-align: center;">${p1.trim()}</h2>`;
                }
                // Soru numaralarını tespit et ve ortala
                else if (/^\d+[\.\)]/.test(p1.trim())) { // Soru numarası ile başlıyorsa (1., 2., vs. veya 1), 2) vs.)
                    return `<p style="text-align: center; margin-bottom: 15px; line-height: 1.6; font-family: Arial, sans-serif;">${p1.trim()}</p>`;
                }
                // Metin başlığını tespit et ve ortala
                else if (p1.trim().startsWith("**") && p1.trim().endsWith("**")) {
                    const title = p1.replace(/\*\*/g, '').trim();
                    return `<h1 style="font-size: 32px; font-weight: bold; text-align: center;">${title}</h1>`;
                }
                // Başlık olarak tespit edilen diğer satırları ortala
                else if (p1.trim().endsWith(':')) {
                    return `<h2 style="font-size: 24px; font-weight: bold; text-align: center;">${p1.trim()}</h2>`;
                }
                // Normal paragraflar
                else {
                    return `<p style="text-indent: 20px; margin-bottom: 15px; line-height: 1.6; font-family: Arial, sans-serif;">${p1.trim()}</p>`;
                }
            });

            // Yazdırma butonunu ekle
            document.getElementById("output").innerHTML = `
                <div style="position: relative; font-family: Arial, sans-serif; font-size: 16px; line-height: 1.6;">
                    <button id="printButton" style="position: absolute; top: 0; right: 0; padding: 5px 10px; background-color: #4CAF50; color: white; border: none; cursor: pointer; font-size: 14px;">Yazdır</button>
                    ${formattedText}
                </div>
            `;

            // Yazdırma butonunu işlevsel hale getir
            document.getElementById("printButton").addEventListener("click", function () {
                // Mevcut içeriği al (Yazdır butonu dahil)
                const originalContent = document.getElementById("output").innerHTML;
                
                // İçeriği, yazdır butonu olmadan işleyecek şekilde temizle
                const contentWithoutButton = originalContent.replace(/<button.*?printButton.*?Yazdır<\/button>/gs, '');
                
                // Yazdırma sayfası oluştur
                const printWindow = window.open('', '', 'height=600,width=800');
                
                // Yazdırma sayfasının içeriğini ayarla
                printWindow.document.write(`
                    <html>
                    <head>
                        <title>OkuAnla - Metin Yazdır</title>
                        <style>
                            body {
                                font-family: Arial, sans-serif;
                                font-size: 16px;
                                line-height: 1.6;
                                margin: 20px;
                                position: relative;
                            }
                            h1 {
                                font-size: 32px;
                                font-weight: bold;
                                text-align: center;
                                margin-bottom: 20px;
                            }
                            h2 {
                                font-size: 24px;
                                font-weight: bold;
                                text-align: center;
                                margin-bottom: 15px;
                            }
                            p {
                                text-indent: 20px;
                                margin-bottom: 15px;
                            }
                            /* Soru paragrafları için özel stil */
                            p:has(~ h2:contains("Sorular")) {
                                text-align: center;
                                text-indent: 0;
                            }
                            .watermark {
                                position: fixed;
                                bottom: 20px;
                                right: 20px;
                                font-size: 14px;
                                color: #d3d3d3;
                                font-weight: bold;
                                z-index: -1; /* Su damgasını içeriğin arkasına yerleştir */
                            }
                        </style>
                    </head>
                    <body>
                        <div>${contentWithoutButton}</div>
                        <div class="watermark">OkuAnla.net</div>
                    </body>
                    </html>
                `);
                
                printWindow.document.close();
                
                // Sayfanın yüklenmesini bekleyip yazdır
                printWindow.onload = function() {
                    setTimeout(function() {
                        printWindow.print();
                        // printWindow.close(); // Yazdırma işlemi tamamlandıktan sonra pencereyi kapatmak isterseniz bunu etkinleştirebilirsiniz
                    }, 500);
                };
            });

        } else {
            document.getElementById("output").innerHTML = "<p>Metin oluşturulamadı: API yanıtı geçersiz.</p>";
        }
    } catch (error) {
        console.error("Hata:", error);
        document.getElementById("output").innerHTML = `<p>Metin oluşturulamadı: ${error.message}</p>`;
    }
});
