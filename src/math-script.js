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

            // Metni parçalayalım: başlık ve problemler
            const lines = generatedText.split('\n');
            let title = "";
            let problems = [];
            let currentProblem = "";
            let isCollecting = false;
            
            // Başlık ve problemleri ayır
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i].trim();
                
                if (line === '') continue; // Boş satırları atla
                
                // İlk anlamlı satırı başlık olarak kabul edelim
                if (!title && line) {
                    title = line;
                    continue;
                }
                
                // Problem numarası ile başlayan satırları bul
                if (/^\d+[\.:]/.test(line)) {
                    if (currentProblem) {
                        problems.push(currentProblem);
                    }
                    currentProblem = line;
                    isCollecting = true;
                } else if (isCollecting && line) {
                    // Devam eden problem metni
                    currentProblem += " " + line;
                }
            }
            
            // Son problemi ekle
            if (currentProblem) {
                problems.push(currentProblem);
            }
            
            // Başlığı formatla - 20px font büyüklüğünde
            let formattedTitle = `<h1 style="font-size: 20px; font-weight: bold; text-align: center; margin-bottom: 20px;">${title}</h1>`;
            
            // Problemleri iki sütun grid olarak formatla
            let formattedProblems = '<div class="problems-grid">';
            
            problems.forEach((problem, index) => {
                // Regex ile problem numarasını ayır
                const match = problem.match(/^(\d+[\.:])\s*(.*)/);
                let problemNumber = "";
                let problemText = problem;
                
                if (match) {
                    problemNumber = match[1];
                    problemText = match[2];
                }
                
                formattedProblems += `
                    <div class="problem-item">
                        <p class="problem-text">${problemNumber} ${problemText}</p>
                        <div class="answer-box"></div>
                    </div>
                `;
            });
            
            formattedProblems += '</div>';

            // Sayfa düzenini oluştur
            const pageContent = `
                <div style="position: relative; font-family: Arial, sans-serif; font-size: 16px; line-height: 1.6; padding: 10px;">
                    <button id="printButton" style="position: absolute; top: 0; right: 0; padding: 5px 10px; background-color: #4CAF50; color: white; border: none; cursor: pointer; font-size: 14px;">Yazdır</button>
                    
                    <!-- Üst çizgi - olabildiğince yukarıda -->
                    <div style="border-bottom: 2px solid #333; margin-bottom: 15px; margin-top: 0;"></div>
                    
                    <!-- Ana içerik -->
                    <div>
                        ${formattedTitle}
                        ${formattedProblems}
                    </div>
                    
                    <!-- Alt bilgi çizgisi -->
                    <div style="border-top: 2px solid #333; padding-top: 10px; margin-top: 20px;"></div>
                </div>

                <style>
                    .problems-grid {
                        display: grid;
                        grid-template-columns: repeat(2, 1fr);
                        gap: 15px;
                    }
                    .problem-item {
                        background-color: #f8f9fa;
                        border-radius: 8px;
                        padding: 10px;
                        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                    }
                    .problem-text {
                        font-weight: bold;
                        margin-bottom: 8px;
                        font-size: 14px;
                    }
                    .answer-box {
                        border: 1px solid #ddd;
                        border-radius: 5px;
                        background-color: white;
                        min-height: 60px;
                        padding: 8px;
                    }
                    
                    @media print {
                        .problems-grid {
                            display: grid !important;
                            grid-template-columns: repeat(2, 1fr) !important;
                            gap: 15px !important;
                            width: 100% !important;
                        }
                        .problem-item {
                            width: auto !important;
                            page-break-inside: avoid !important;
                        }
                    }
                </style>
            `;
            
            // İçeriği sayfaya ekle
            document.getElementById("output").innerHTML = pageContent;

            // Yazdırma butonunu işlevsel hale getir
            document.getElementById("printButton").addEventListener("click", function () {
                // Mevcut içeriği al (Yazdır butonu dahil)
                const originalContent = document.getElementById("output").innerHTML;
                
                // İçeriği, yazdır butonu olmadan işleyecek şekilde temizle
                const contentWithoutButton = originalContent.replace(/<button.*?printButton.*?Yazdır<\/button>/gs, '');
                
                // Yazdırma sayfası oluştur
                const printWindow = window.open('', '', 'height=600,width=800');
                
                // Yazdırma sayfasının içeriğini ayarla - script.js ile uyumlu
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
                                    font-size: 20px;
                                    font-weight: bold;
                                    text-align: center;
                                    margin-bottom: 15px;
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
                                
                                /* Yeni grid yapısı - yazdırma için optimize edilmiş */
                                .problems-grid {
                                    display: grid !important;
                                    grid-template-columns: repeat(2, 1fr) !important;
                                    gap: 15px !important;
                                    width: 100% !important;
                                }
                                
                                .problem-item {
                                    background-color: #f8f9fa;
                                    border-radius: 8px;
                                    padding: 10px;
                                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                                    page-break-inside: avoid;
                                    width: auto !important;
                                }
                                
                                .problem-text {
                                    font-weight: bold;
                                    margin-bottom: 8px;
                                    font-size: 14px;
                                }
                                
                                .answer-box {
                                    border: 1px solid #ddd;
                                    border-radius: 5px;
                                    background-color: white;
                                    min-height: 60px;
                                    padding: 8px;
                                }
                            }
                        </style>
                    </head>
                    <body>
                        <div class="watermark">OkuAnla.net</div>
                        <div class="header-divider"></div>
                        ${contentWithoutButton}
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