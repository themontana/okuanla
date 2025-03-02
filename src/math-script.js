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
                "zor": "üç basamaklı sayılarla çeşitli problem türleri, yaratıcı düşünme ve mantık yürütme gerektiren işlemler"
            },
            "3": {
                "kolay": "iki ve üç basamaklı sayılarla temel işlemler",
                "orta": "üç basamaklı sayılarla çoklu adım gerektiren işlemler",
                "zor": "üç ve dört basamaklı sayılarla karmaşık problem çözümü, yaratıcı düşünme ve mantık yürütme gerektiren işlemler"
            },
            "4": {
                "kolay": "üç basamaklı sayılarla temel işlemler",
                "orta": "üç ve dört basamaklı sayılarla çoklu adım gerektiren işlemler",
                "zor": "dört basamaklı sayılarla karmaşık problem çözümü, yaratıcı düşünme ve mantık yürütme gerektiren işlemler"
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
        - Her problem arasında öğrencilerin kalem ile işlem yapabilmesi için en az 3 satır boşluk bırak.
        - Başlık ve 1. soru arasında boşluk olmasın.
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
            let problems = []; // Problemleri bir diziye yerleştiriyoruz
            
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i].trim();
                
                if (line === '') continue; // Boş satırları atla
                
                if (isTitle) {
                    formattedText += `<h1 style="font-size: 32px; font-weight: bold; text-align: center;">${line}</h1>`;
                    isTitle = false;
                } else if (/^\d+\./.test(line)) {
                    // Problem numarası
                    problems.push(`<h3 class="problem">Problem ${line}</h3>`);
                } else {
                    // Problem metni
                    problems.push(`<p class="problem-text">${line}</p>`);
                }
            }

            // Problemleri iki sütuna yerleştir
            let columns = ['<div class="page-content">'];
            for (let i = 0; i < problems.length; i++) {
                if (i % 2 === 0 && i !== 0) {
                    columns.push('</div><div class="page-content">');
                }
                columns.push(problems[i]);
            }
            columns.push('</div>');

            // Sayfa içeriğini oluştur
            const pageContent = `
                <div class="page-content">
                    <button id="printButton" style="position: absolute; top: 0; right: 0; padding: 5px 10px; background-color: #4CAF50; color: white; border: none; cursor: pointer; font-size: 14px;">Yazdır</button>
                    
                    <!-- Üst çizgi -->
                    <div style="border-bottom: 2px solid #333; margin-bottom: 15px;"></div>
                    
                    <!-- Ana içerik -->
                    <div>
                        ${columns.join('')}
                    </div>
                    
                    <!-- Alt bilgi çizgisi -->
                    <div style="border-top: 2px solid #333; padding-top: 10px; margin-top: 20px;"></div>
                </div>
            `;

            // İçeriği sayfaya ekle
            document.getElementById("output").innerHTML = pageContent;

            // Yazdırma butonunu işlevsel hale getir
            document.getElementById("printButton").addEventListener("click", function () {
                const originalContent = document.getElementById("output").innerHTML;
                const contentWithoutButton = originalContent.replace(/<button.*?printButton.*?Yazdır<\/button>/gs, '');
                
                const printWindow = window.open('', '', 'height=600,width=800');
                
                printWindow.document.write(`
                    <html>
                    <head>
                        <title>OkuAnla - Matematik Problemi Yazdır</title>
                        <style>
                            @media print {
                                body {
                                    font-family: Arial, sans-serif;
                                    font-size: 14px;
                                    line-height: 1.5;
                                    margin: 0.5cm;
                                }
                                
                                h1 {
                                    font-size: 24px;
                                    font-weight: bold;
                                    text-align: center;
                                    margin-bottom: 15px;
                                }
                                
                                h3 {
                                    font-size: 18px;
                                    font-weight: bold;
                                    margin-top: 20px;
                                    margin-bottom: 12px;
                                }
                                
                                p {
                                    text-indent: 20px;
                                    margin-bottom: 10px;
                                }
                                
                                .watermark {
                                    position: fixed;
                                    top: 5px;
                                    left: 5px;
                                    font-size: 14px;
                                    color: #d3d3d3;
                                    font-weight: bold;
                                }
                                
                                .header-divider {
                                    border-bottom: 2px solid #333;
                                    margin-bottom: 15px;
                                    margin-top: 0;
                                }
                                
                                .footer-divider {
                                    border-top: 2px solid #333;
                                    padding-top: 10px;
                                    margin-top: 15px;
                                }
                            }
                        </style>
                    </head>
                    <body>
                        <div class="watermark">OkuAnla.net</div>
                        <div class="header-divider"></div>
                        <div>${contentWithoutButton}</div>
                    </body>
                    </html>
                `);
                
                printWindow.document.close();
                
                printWindow.onload = function() {
                    setTimeout(function() {
                        printWindow.print();
                    }, 500);
                };
            });
        }
    } catch (error) {
        console.error("Hata oluştu:", error);
        document.getElementById("output").innerHTML = "<p>Bir hata oluştu. Lütfen tekrar deneyin.</p>";
    }
});
