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
        - Problemler günlük hayattan örnekler içerebilir.
        - İçerik Türkçe olmalı ve dil yanlışları içermemeli.
        - Çözümleri EKLEME, sadece problemleri yaz.
        
        Format şu şekilde olmalı:
        - Başlık: "${mathGrade}. Sınıf ${topic} Problemleri" olmalı (zorluk seviyesini başlıkta belirtme)
        - "##" veya başka format işaretleyicilerini kullanma, sadece düz metin olarak yaz
        - Her problem numaralandırılmış olmalı (1, 2, 3...)
        - Her problem arasında öğrencilerin kalem ile işlem yapabilmesi için en az 4 satır boşluk bırak.
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
            // Markdown işaretlerini (##, **, vb.) temizle
            let generatedText = data.generatedText
                .replace(/##\s+/g, '')   // ## işaretlerini kaldır
                .replace(/\*\*/g, '');   // ** işaretlerini kaldır

            // Problem arasındaki boşlukları artır ve formatı düzenle
            let formattedText = '';
            const lines = generatedText.split('\n');
            let isTitle = true; // İlk satırın başlık olduğunu varsayıyoruz
            
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i].trim();
                
                if (line === '') continue; // Boş satırları atla
                
                if (isTitle) {
                    // Başlık için özel stil
                    formattedText += `<h1 style="font-size: 32px; font-weight: bold; text-align: center; margin-bottom: 20px;">${line}</h1>`;
                    isTitle = false;
                } else if (/^\d+\./.test(line)) {
                    // Problem numarası tespit edildi
                    // Önceki problem ile arasına boşluk ekle (ikinci problemden itibaren)
                    if (formattedText.includes('Problem') && !line.includes('Problem 1')) {
                        formattedText += `<div style="height: 150px;"></div>`;
                    }
                    
                    formattedText += `<h3 style="font-size: 18px; font-weight: bold; margin-top: 20px; margin-bottom: 10px;">Problem ${line}</h3>`;
                } else {
                    // Normal metin
                    formattedText += `<p style="text-indent: 20px; margin-bottom: 15px; line-height: 1.6; font-family: Arial, sans-serif;">${line}</p>`;
                }
            }

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
                            .problem-space {
                                height: 150px;
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
