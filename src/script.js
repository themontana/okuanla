document.getElementById("textForm").addEventListener("submit", async function (event) {
    event.preventDefault();

    const grade = document.getElementById("grade").value.trim();
    const theme = document.getElementById("theme").value.trim();
    const keywords = document.getElementById("keywords").value.trim();
    const questionCount = document.getElementById("questionCount").value.trim();

    if (!grade || !theme || !keywords || !questionCount) {
        return document.getElementById("output").innerHTML = "Lütfen tüm alanları doldurun.";
    }

    async function fetchImage() {
        const apiKey = '39452104-a2abbe2c27fa9cc0cb399c860';
        const query = encodeURIComponent(`${theme} cartoon vector illustration`.normalize('NFC'));
        
        try {
            const response = await fetch(`https://pixabay.com/api/?key=${apiKey}&q=${query}&image_type=illustration&per_page=3`);
            const data = await response.json();
            
            if (!data.hits?.length) {
                return { url: '/api/placeholder/300/200', alt: theme };
            }
            
            return {
                url: data.hits[0].previewURL,
                alt: data.hits[0].tags || theme
            };
        } catch (error) {
            console.error("Resim Hatası:", error);
            return { url: '/api/placeholder/300/200', alt: theme };
        }
    }

    const prompt = `
        ${grade}. sınıf öğrencileri için "${theme}" temalı öğretici bir metin oluştur.
        - Kelime sayısı: ${getWordCountRange(grade)}
        - Yaş grubuna uygun dil ve anlatım
        - Doğal şekilde "${keywords}" kelimelerini içerme
        - Sonunda ${questionCount} adet okuma sorusu ekle
        - Sorular metnin ana fikrine yönelik olmalı`;

    document.getElementById("output").innerHTML = "Oluşturuluyor...";

    try {
        const [textResponse, image] = await Promise.all([
            fetch('/api/generate-text', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt })
            }),
            fetchImage()
        ]);

        if (!textResponse.ok) throw new Error("Metin oluşturulamadı");
        const { generatedText } = await textResponse.json();
        
        if (!generatedText) throw new Error("Boş yanıt alındı");

        const [title, ...content] = generatedText.split('\n\n');
        const questions = content.filter(p => p.startsWith('Soru '));

        const htmlContent = `
            <div class="print-container">
                <div class="watermark">okuanla.net</div>
                <hr class="header-line">
                <button id="printButton">🖨️ Yazdır</button>
                <h1>${title}</h1>
                <img src="${image.url}" alt="${image.alt}" class="main-image">
                <div class="content">${content.filter(p => !p.startsWith('Soru ')).join('\n')}</div>
                <h2>Sorular</h2>
                <div class="questions-container">
                    ${questions.map(q => `
                        <div class="question-box">
                            <div class="question">${q}</div>
                            <div class="answer-space"></div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        document.getElementById("output").innerHTML = htmlContent;

        document.getElementById("printButton").addEventListener("click", () => {
            const printWindow = window.open('', 'PRINT', 'height=600,width=800');
            printWindow.document.write(`
                <html>
                    <head>
                        <style>
                            @media print {
                                .main-image { 
                                    position: absolute;
                                    top: 20px;
                                    right: 20px;
                                    max-width: 150px;
                                    max-height: 150px;
                                }
                                .questions-container { 
                                    grid-template-columns: 1fr 1fr;
                                    column-gap: 20px;
                                }
                                #printButton, .watermark, .header-line { 
                                    display: none;
                                }
                                .answer-space { 
                                    border: 1px solid #000;
                                    height: 80px;
                                }
                                .content { 
                                    margin-top: 100px;
                                }
                            }
                            body { 
                                font-family: Arial, sans-serif;
                                padding: 20px;
                                position: relative;
                            }
                            .watermark {
                                position: fixed;
                                top: 10px;
                                left: 20px;
                                font-size: 10px;
                                color: #ccc;
                                z-index: 1;
                            }
                            .header-line {
                                position: fixed;
                                top: 30px;
                                left: 0;
                                right: 0;
                                border-top: 1px solid #000;
                                margin: 0;
                            }
                            #printButton {
                                position: fixed;
                                top: 15px;
                                right: 20px;
                                background: #4CAF50;
                                color: white;
                                border: none;
                                padding: 10px 20px;
                                cursor: pointer;
                                z-index: 1000;
                            }
                            .main-image {
                                max-width: 300px;
                                margin: 20px 0;
                                float: right;
                                clear: both;
                            }
                            .questions-container {
                                display: grid;
                                grid-template-columns: 1fr 1fr;
                                gap: 20px;
                                margin-top: 30px;
                            }
                            .question-box {
                                background: #f1f1f1;
                                padding: 15px;
                                border-radius: 8px;
                                page-break-inside: avoid;
                            }
                            .answer-space {
                                height: 60px;
                                border: 1px dashed #000;
                                margin-top: 10px;
                                border-radius: 4px;
                            }
                        </style>
                    </head>
                    <body>
                        ${document.querySelector(".print-container").innerHTML}
                    </body>
                </html>
            `);
            printWindow.document.close();
            printWindow.onload = () => setTimeout(() => printWindow.print(), 500);
        });

    } catch (error) {
        console.error("Hata:", error);
        document.getElementById("output").innerHTML = `Hata: ${error.message}`;
    }
});

function getWordCountRange(grade) {
    return {
        '1': '150-200',
        '2': '200-250',
        '3': '300-350',
        '4': '400-450'
    }[grade] || '150-200';
}
