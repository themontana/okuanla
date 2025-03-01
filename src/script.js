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
            
            // Metni bölümlere ayır: başlık, ana metin ve sorular
            let sections = processGeneratedText(generatedText);
            
            // HTML içeriğini oluştur
            let contentHTML = `
                <h1 style="font-size: 20px; font-weight: bold; text-align: center; margin-bottom: 20px;">${sections.title}</h1>
                <div style="text-align: left; margin-bottom: 20px;">
                    ${sections.mainText}
                </div>
                <div style="text-align: left;">
                    <strong>${sections.questionsTitle}</strong>
                    ${sections.questions}
                </div>
            `;
            
            // Yazdırma butonunu ekle
            document.getElementById("output").innerHTML = `
                <div style="position: relative; font-family: Arial, sans-serif; font-size: 16px; line-height: 1.6;">
                    <button id="printButton" style="position: absolute; top: 0; right: 0; padding: 5px 10px; background-color: #4CAF50; color: white; border: none; cursor: pointer; font-size: 14px;">Yazdır</button>
                    ${contentHTML}
                </div>
            `;
            
            // Yazdırma butonunu işlevsel hale getir
            document.getElementById("printButton").addEventListener("click", function () {
                // Yazdırma sayfası oluştur
                const printWindow = window.open('', '', 'height=600,width=800');
                
                // Yazdırma sayfasının içeriğini ayarla
                printWindow.document.write(`
                    <html>
                    <head>
                        <title>OkuAnla - Metin Yazdır</title>
                        <style>
                            @media print {
                                @page {
                                    margin: 1.5cm;
                                }
                            }
                            
                            body {
                                font-family: Arial, sans-serif;
                                font-size: 12pt;
                                line-height: 1.5;
                                margin: 0;
                                padding: 0;
                            }
                            
                            .container {
                                max-width: 19cm;
                                margin: 0 auto;
                            }
                            
                            h1 {
                                font-size: 16pt;
                                font-weight: bold;
                                text-align: left;
                                margin-top: 0;
                                margin-bottom: 12pt;
                            }
                            
                            .text-content {
                                text-align: left;
                                margin-bottom: 12pt;
                            }
                            
                            .text-content p {
                                margin: 0 0 10pt 0;
                                text-indent: 1.5em;
                            }
                            
                            .questions-title {
                                font-weight: bold;
                                margin-bottom: 8pt;
                            }
                            
                            .questions p {
                                margin: 4pt 0;
                            }
                            
                            .footer {
                                text-align: right;
                                margin-top: 20pt;
                                font-size: 10pt;
                                color: #666;
                            }
                            
                            .yazdır-footer {
                                position: fixed;
                                bottom: 20px;
                                right: 20px;
                                font-size: 10pt;
                                color: #666;
                            }
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <h1>${sections.title}</h1>
                            <div class="text-content">
                                ${sections.mainText.replace(/<p>/g, '<p>').replace(/<\/p>/g, '</p>')}
                            </div>
                            <div class="questions-title">
                                ${sections.questionsTitle}
                            </div>
                            <div class="questions">
                                ${sections.questions}
                            </div>
                            <div class="yazdır-footer">
                                Yazdır<br>OkuAnla.net
                            </div>
                        </div>
                    </body>
                    </html>
                `);
                
                printWindow.document.close();
                
                // Sayfanın yüklenmesini bekleyip yazdır
                printWindow.onload = function() {
                    setTimeout(function() {
                        printWindow.print();
                        printWindow.close(); // Yazdırma işleminden sonra pencereyi kapat
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

// Oluşturulan metni bölümlere ayıran fonksiyon
function processGeneratedText(text) {
    // Satırlara ayır
    const lines = text.split('\n').filter(line => line.trim() !== '');

    let title = "";
    let mainTextLines = [];
    let questionsTitle = "Okuma Soruları:";
    let questionsLines = [];
    let inQuestionsSection = false;
    
    // Başlığı ve metni işle
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        // Başlık tespiti (genellikle ilk satırda veya ** işaretleri arasında olur)
        if (i === 0 || line.startsWith('**') && line.endsWith('**')) {
            title = line.replace(/\*\*/g, '').trim();
            continue;
        }
        
        // Soru bölümü başlığını tespit et
        if (line.includes("Okuma Soruları") || line.includes("Sorular:") || /^Sorular\s*:?$/.test(line)) {
            inQuestionsSection = true;
            questionsTitle = line;
            continue;
        }
        
        // Soru bölümü içinde miyiz?
        if (inQuestionsSection) {
            // Eğer satır numara ile başlıyorsa veya numara+nokta ile başlıyorsa (1. , 2. gibi)
            if (/^\d+[\.\)]/.test(line)) {
                questionsLines.push(`<p>${line}</p>`);
            } else {
                // Eğer soru başlığından sonra numara olmayan bir şey varsa ana metne ekle
                mainTextLines.push(`<p>${line}</p>`);
            }
        } else {
            mainTextLines.push(`<p>${line}</p>`);
        }
    }
    
    // Eğer soru bölümü tespit edilemezse, son 3-7 satırı soru olarak kabul et
    if (questionsLines.length === 0 && mainTextLines.length > 7) {
        const questionCount = parseInt(document.getElementById("questionCount").value.trim()) || 5;
        questionsTitle = "Okuma Soruları:";
        inQuestionsSection = true;
        
        // Son birkaç satırı soruları olarak işaretle
        const potentialQuestions = mainTextLines.slice(-questionCount);
        mainTextLines = mainTextLines.slice(0, -questionCount);
        
        // Soruları numaralandır ve ekle
        potentialQuestions.forEach((line, index) => {
            questionsLines.push(`<p>${index + 1}. ${line.replace(/<\/?p>/g, '')}</p>`);
        });
    }
    
    return {
        title: title,
        mainText: mainTextLines.join('\n'),
        questionsTitle: questionsTitle,
        questions: questionsLines.join('\n')
    };
}
