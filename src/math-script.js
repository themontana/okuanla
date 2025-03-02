// Form dinleyicisi
document.getElementById("mathForm").addEventListener("submit", async function (event) {
    event.preventDefault(); // Sayfanın yenilenmesini önler

    // Kullanıcıdan alınan girdiler
    const mathGrade = document.getElementById("mathGrade").value.trim();
    const difficulty = document.getElementById("difficulty").value.trim();
    const topic = document.getElementById("topic").value.trim();
    const problemCount = document.getElementById("problemCount").value.trim();

    // Eğer kullanıcı herhangi bir alanı boş bırakırsa hata mesajı göster
    if (!mathGrade || !difficulty || !topic || !problemCount) {
        document.getElementById("output").innerHTML = "<p>Lütfen tüm alanları doldurun.</p>";
        return;
    }

    // Sınıf seviyesine göre içerik karmaşıklığını ayarla
    function getDifficultyDescription(grade, level) {
        const descriptions = {
            "1": {
                "kolay": "tek basamaklı sayılarla basit işlemler",
                "orta": "iki basamaklı sayılarla temel işlemler",
                "zor": "iki basamaklı sayıların karışık işlemleri"
            },
            "2": {
                "kolay": "iki basamaklı sayılarla temel işlemler",
                "orta": "iki ve üç basamaklı sayılarla karışık işlemler",
                "zor": "üç basamaklı sayılarla çeşitli problem türleri"
            },
            "3": {
                "kolay": "iki ve üç basamaklı sayılarla temel işlemler",
                "orta": "üç basamaklı sayılarla çoklu adım gerektiren işlemler",
                "zor": "üç ve dört basamaklı sayılarla karmaşık problem çözümü"
            },
            "4": {
                "kolay": "üç basamaklı sayılarla temel işlemler",
                "orta": "üç ve dört basamaklı sayılarla çoklu adım gerektiren işlemler",
                "zor": "dört basamaklı sayılarla karmaşık problem çözümü, kesirler ve ondalık sayılar"
            }
        };
        
        return descriptions[grade][level] || "temel matematik problemleri";
    }

    // Kullanıcı girdilerine göre prompt oluştur
    const prompt = `
        Lütfen ${mathGrade}. sınıf öğrencileri için "${topic}" konusunda ${difficulty} seviyede ${problemCount} tane matematik problemi oluştur.
        
        Problemler şu şekilde olmalı:
        - ${mathGrade}. sınıf seviyesine uygun ve ${getDifficultyDescription(mathGrade, difficulty)} içermeli.
        - Her problem net ve anlaşılır olmalı.
        - Her problemin çözümü adım adım gösterilmeli.
        - Problemler günlük hayattan örnekler içerebilir.
        - İçerik Türkçe olmalı ve dil yanlışları içermemeli.
        
        Format şu şekilde olmalı:
        - Başlık: "${mathGrade}. Sınıf ${topic} Problemleri (${difficulty} seviye)"
        - Her problem numaralandırılmış olmalı (1, 2, 3...)
        - Tüm problemler gösterildikten sonra "Çözümler" başlığı altında her problemin adım adım çözümü verilmeli
        - Çözüm kısmında her problemin adım adım nasıl çözüleceği açıkça gösterilmeli ve son cevap belirtilmeli.
    `;

    // Kullanıcıya problem oluşturuluyor bilgisini göster
    document.getElementById("output").innerHTML = "<p>Matematik problemleri oluşturuluyor...</p>";

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

            // Başlıkları büyütme ve formatı düzenleme
            let formattedText = generatedText.replace(/^(.*?)(\n|$)/gm, (match, p1) => {
                // Başlık olan kısmı bulup stil ekleyelim
                if (p1.trim().endsWith(':') || p1.trim() === "Çözümler") {
                    // Alt başlıkları
                    return `<h2 style="font-size: 24px; font-weight: bold; text-align: center; margin-top: 30px;">${p1.trim()}</h2>`;
                } else if (/^\d+\./.test(p1.trim()) || /^Problem \d+/.test(p1.trim())) {
                    // Problem numaraları için stil
                    return `<h3 style="font-size: 18px; font-weight: bold; margin-top: 20px; margin-bottom: 10px;">${p1.trim()}</h3>`;
                } else if (p1.trim().includes("Sınıf") && p1.trim().includes("Problemleri")) {
                    // Ana başlık
                    return `<h1 style="font-size: 32px; font-weight: bold; text-align: center; margin-bottom: 30px;">${p1.trim()}</h1>`;
                } else {
                    // Diğer metinler normal kalacak
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
                        <title>OkuAnla - Matematik Problemi Yazdır</title>
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
                                margin-bottom: 30px;
                            }
                            h2 {
                                font-size: 24px;
                                font-weight: bold;
                                text-align: center;
                                margin-top: 30px;
                                margin-bottom: 20px;
                            }
                            h3 {
                                font-size: 18px;
                                font-weight: bold;
                                margin-top: 20px;
                                margin-bottom: 10px;
                            }
                            p {
                                text-indent: 20px;
                                margin-bottom: 15px;
                            }
                            .watermark {
                                position: fixed;
                                bottom: 20px;
                                right: 20px;
                                font-size: 20px;
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
            document.getElementById("output").innerHTML = "<p>Matematik problemleri oluşturulamadı: API yanıtı geçersiz.</p>";
        }
    } catch (error) {
        console.error("Hata:", error);
        document.getElementById("output").innerHTML = `<p>Matematik problemleri oluşturulamadı: ${error.message}</p>`;
    }
});
