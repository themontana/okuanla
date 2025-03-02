// Formu dinleyerek işlem yapmak
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

    // Kullanıcı girdilerine göre geliştirilmiş prompt
    // Grade seçeneğine göre kelime sayısı aralığını ayarlayan fonksiyon
    function getWordCountRange(grade) {
        switch(grade) {
            case '1':
                return '150-200'; // 1. sınıf için kelime sayısı 150-200 arası
            case '2':
                return '200-250'; // 2. sınıf için kelime sayısı 200-250 arası
            case '3':
                return '300-350'; // 3. sınıf için kelime sayısı 250-300 arası
            case '4':
                return '400-450'; // 4. sınıf için kelime sayısı 300-350 arası
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
            - Bu kısmın başlığı Sorular olmalı
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
            
            // Metni ve soruları ayır
            let textPart = "";
            let questionsPart = "";
            
            // "Sorular" başlığını bul ve metni ikiye böl
            const questionsIndex = generatedText.indexOf("Sorular");
            
            if (questionsIndex !== -1) {
                textPart = generatedText.substring(0, questionsIndex);
                questionsPart = generatedText.substring(questionsIndex);
            } else {
                textPart = generatedText;
            }
            
            // Metin kısmını formatla
            let formattedText = textPart.replace(/^(.*?)(\n|$)/gm, (match, p1) => {
                // Başlık olan kısmı bulup stil ekleyelim
                if (p1.trim().endsWith(':')) {
                    return `<h2 style="font-size: 24px; font-weight: bold; text-align: center;">${p1.trim()}</h2>`;
                } else if (p1.trim().startsWith("**") && p1.trim().endsWith("**")) {
                    const title = p1.replace(/\*\*/g, '').trim();
                    return `<h1 style="font-size: 32px; font-weight: bold; text-align: center;">${title}</h1>`;
                } else {
                    return `<p style="text-indent: 20px; margin-bottom: 15px; line-height: 1.6; font-family: Arial, sans-serif;">${p1.trim()}</p>`;
                }
            });
            
            // Sorular kısmını formatla - iki sütunlu yapı oluştur
            let formattedQuestions = "";
            
            if (questionsPart) {
                // Soruları ayır
                const questionLines = questionsPart.split('\n');
                let questions = [];
                
                // Başlık dışındaki soruları al
                let isCollecting = false;
                let currentQuestion = "";
                
                for (const line of questionLines) {
                    if (line.trim().toLowerCase().includes("sorular")) {
                        isCollecting = true;
                        // ** işaretlerini kaldır
                        const cleanTitle = line.trim().replace(/\*\*/g, '');
                        formattedQuestions += `<h2 style="font-size: 24px; font-weight: bold; text-align: center; width: 100%;">${cleanTitle}</h2>`;
                    } else if (isCollecting && line.trim()) {
                        // Sayıyla başlıyorsa yeni soru
                        if (/^\d+[\.\)]\s/.test(line.trim())) {
                            if (currentQuestion) {
                                questions.push(currentQuestion);
                            }
                            currentQuestion = line.trim();
                        } else if (currentQuestion) {
                            currentQuestion += " " + line.trim();
                        }
                    }
                }
                
                // Son soruyu ekle
                if (currentQuestion) {
                    questions.push(currentQuestion);
                }
                
                // Soruları iki sütunda göster - daha küçük kutucuklar
                formattedQuestions += '<div class="question-grid">';
                
                questions.forEach((question, index) => {
                    // RegEx ile soru numarasını al, eğer bulunamazsa boş string kullan
                    const questionNumberMatch = question.match(/^\d+[\.\)]\s/);
                    const questionNumber = questionNumberMatch ? questionNumberMatch[0] : '';
                    const questionText = questionNumberMatch ? question.replace(/^\d+[\.\)]\s/, '') : question;
                    
                    formattedQuestions += `
                        <div class="question-item">
                            <p class="question-text">${questionNumber}${questionText}</p>
                            <div class="answer-box"></div>
                        </div>
                    `;
                });
                
                formattedQuestions += '</div>';
            }
            
            // Sayfa düzenini oluştur - sadece üst çizgi
            const pageContent = `
                <div style="position: relative; font-family: Arial, sans-serif; font-size: 16px; line-height: 1.6; padding: 10px;">
                    <button id="printButton" style="position: absolute; top: 0; right: 0; padding: 5px 10px; background-color: #4CAF50; color: white; border: none; cursor: pointer; font-size: 14px;">Yazdır</button>
                    
                    <!-- Üst çizgi - olabildiğince yukarıda -->
                    <div style="border-bottom: 2px solid #333; margin-bottom: 15px; margin-top: 0;"></div>
                    
                    <!-- Ana içerik -->
                    <div>
                        ${formattedText}
                    </div>
                    
                    <!-- Alt bilgi çizgisi -->
                    <div style="border-top: 2px solid #333; padding-top: 10px; margin-top: 20px;"></div>
                    
                    <!-- Sorular bölümü -->
                    <div style="margin-top: 15px;">
                        ${formattedQuestions}
                    </div>

                    <style>
                        .question-grid {
                            display: flex;
                            flex-wrap: wrap;
                            justify-content: space-between;
                            gap: 10px;
                        }
                        .question-item {
                            width: 48%;
                            margin-bottom: 12px;
                            background-color: #f8f9fa;
                            border-radius: 8px;
                            padding: 10px;
                            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                        }
                        .question-text {
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
                    </style>
                </div>
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
                
                // Yazdırma sayfasının içeriğini ayarla
                printWindow.document.write(`
                    <html>
                    <head>
                        <title>OkuAnla - Metin Yazdır</title>
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
                                
                                h2 {
                                    font-size: 20px;
                                    font-weight: bold;
                                    text-align: center;
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
                                
                                .question-grid {
                                    display: grid;
                                    grid-template-columns: 48% 48%;
                                    column-gap: 4%;
                                    width: 100%;
                                }
                                
                                .question-item {
                                    background-color: #f8f9fa;
                                    border-radius: 8px;
                                    padding: 8px;
                                    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                                    margin-bottom: 10px;
                                    break-inside: avoid;
                                }
                                
                                .question-text {
                                    font-weight: bold;
                                    margin-bottom: 6px;
                                    font-size: 14px;
                                }
                                
                                .answer-box {
                                    border: 1px solid #ddd;
                                    border-radius: 5px;
                                    background-color: white;
                                    min-height: 50px;
                                    padding: 6px;
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
                        <div>${contentWithoutButton}</div>
                    </body>
                    </html>
                `);
                
                printWindow.document.close();
                
                // Sayfanın yüklenmesini bekleyip yazdır
                printWindow.onload = function() {
                    setTimeout(function() {
                        printWindow.print();
                        // printWindow.close();
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
