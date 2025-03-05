document.getElementById("textForm").addEventListener("submit", async function (event) {
    event.preventDefault();

    const grade = document.getElementById("grade").value.trim();
    const theme = document.getElementById("theme").value.trim();
    const keywords = document.getElementById("keywords").value.trim();
    const questionCount = document.getElementById("questionCount").value.trim();

    if (!grade || !theme || !keywords || !questionCount) {
        document.getElementById("output").innerHTML = "Lütfen tüm alanları doldurun.";
        return;
    }

    async function fetchUnsplashImage(theme, keywords) {
        const pixabayAccessKey = '39452104-a2abbe2c27fa9cc0cb399c860';
        const query = encodeURIComponent(`${theme} cartoon vector illustration`.normalize('NFC'));
        
        try {
            const response = await fetch(`https://pixabay.com/api/?key=${pixabayAccessKey}&q=${query}&image_type=illustration&per_page=3&safesearch=true`);
            
            if (!response.ok) {
                const errorBody = await response.text();
                console.error(`Pixabay API Hatası! Durum: ${response.status}, Yanıt: ${errorBody}`);
                throw new Error(`Pixabay API hatası! Durum: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (!data.hits || data.hits.length === 0) {
                return {
                    url: '/api/placeholder/300/200',
                    alt: `${theme} resmi`
                };
            }
            
            const selectedImage = data.hits[0];
            return {
                url: selectedImage.previewURL, // Daha küçük resim boyutu
                alt: selectedImage.tags || `${theme} resmi`
            };
        } catch (error) {
            console.error("Resim alınamadı:", error);
            return {
                url: '/api/placeholder/300/200',
                alt: `${theme} resmi`
            };
        }
    }

    const prompt = `
        Lütfen ${grade}. sınıf öğrencileri için "${theme}" temalı, öğretici ve eğlenceli bir okuma metni oluştur.
        - Metnin uzunluğu yaklaşık ${getWordCountRange(grade)} kelime olmalı
        - Metin, ${grade}. sınıf seviyesinde ve yaşa uygun olmalı
        - "${keywords}" kelimelerini doğal bir şekilde içermeli
        - Metnin sonunda ${questionCount} adet okuma sorusu ekle
        - Sorular metnin ana fikrine dayalı ve net olmalı`;

    document.getElementById("output").innerHTML = "Metin oluşturuluyor...";

    try {
        const [textResponse, imageData] = await Promise.all([
            fetch('/api/generate-text', { 
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt }) 
            }),
            fetchUnsplashImage(theme, keywords)
        ]);

        if (!textResponse.ok) throw new Error(`HTTP hatası! Durum: ${textResponse.status}`);
        const data = await textResponse.json();
        
        if (data.generatedText) {
            const [title, ...contentParts] = data.generatedText.split('\n\n');
            const formattedText = contentParts.join('\n\n').replace(/^(.*?)(\n|$)/gm, (match, p1) => {
                return `<p>${p1.trim()}</p>`;
            });

            const questions = data.generatedText.split("Sorular")[1]
                .split('\n')
                .filter(q => q.trim().match(/^\d+\./))
                .map(q => q.replace(/^\d+\.\s*/, ''));

            const pageContent = `
                <div class="print-container">
                    <div class="header">
                        <button id="printButton">🖨️ Yazdır</button>
                        <img src="${imageData.url}" alt="${imageData.alt}" class="main-image">
                    </div>
                    <h1 class="main-title">${title}</h1>
                    <div class="content-body">${formattedText}</div>
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

            document.getElementById("output").innerHTML = pageContent;

            document.getElementById("printButton").addEventListener("click", () => {
                const printWindow = window.open('', '', 'height=600,width=800');
                printWindow.document.write(`
                    <html>
                        <head>
                            <style>
                                @media print {
                                    .main-image { max-width: 150px !important; position: absolute; top: 20px; right: 20px; }
                                    .questions-container { grid-template-columns: 1fr 1fr !important; }
                                    #printButton { display: none !important; }
                                    .answer-space { border: 1px solid #000 !important; }
                                }
                                body { font-family: Arial, sans-serif; padding: 20px; }
                                .main-title { margin-top: 60px; }
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
                                }
                                .answer-space {
                                    height: 60px;
                                    border: 1px dashed #000;
                                    margin-top: 10px;
                                    border-radius: 4px;
                                }
                                .main-image { max-width: 300px; margin: 20px 0; }
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

        } else {
            document.getElementById("output").innerHTML = "Metin oluşturulamadı: API yanıtı geçersiz.";
        }
    } catch (error) {
        console.error("Hata:", error);
        document.getElementById("output").innerHTML = `Metin oluşturulamadı: ${error.message}`;
    }
});

function getWordCountRange(grade) {
    switch(grade) {
        case '1': return '150-200';
        case '2': return '200-250';
        case '3': return '300-350';
        case '4': return '400-450';
        default: return '150-200';
    }
}
