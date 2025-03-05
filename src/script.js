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

    function getWordCountRange(grade) {
        switch(grade) {
            case '1': return '150-200';
            case '2': return '200-250';
            case '3': return '300-350';
            case '4': return '400-450';
            default: return '150-200';
        }
    }

    async function fetchUnsplashImage(theme, keywords) {
        const pixabayAccessKey = '39452104-a2abbe2c27fa9cc0cb399c860';
        const safeTheme = encodeURIComponent(theme.normalize('NFC'));
        const safeKeywords = encodeURIComponent(keywords.normalize('NFC'));
        const query = `${safeTheme} ${safeKeywords}`;
        
        try {
            const response = await fetch(`https://pixabay.com/api/?key=${pixabayAccessKey}&q=${query}&image_type=photo&per_page=3&safesearch=true`);
            
            if (!response.ok) {
                const errorBody = await response.text();
                console.error(`Pixabay API Hatası! Durum: ${response.status}, Yanıt: ${errorBody}`);
                throw new Error(`Pixabay API hatası! Durum: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (!data.hits || data.hits.length === 0) {
                return {
                    url: '/api/placeholder/300/200',
                    alt: `${theme} ve ${keywords} resmi`
                };
            }
            
            const selectedImage = data.hits[0];
            return {
                url: selectedImage.webformatURL,
                alt: selectedImage.tags || `${theme} ve ${keywords} resmi`
            };
        } catch (error) {
            console.error("Pixabay resmi alınamadı:", error);
            return {
                url: '/api/placeholder/300/200',
                alt: `${theme} ve ${keywords} resmi`
            };
        }
    }

    const prompt = `
        Lütfen ${grade}. sınıf öğrencileri için "${theme}" temalı, içerisinde "${keywords}" kelimelerini içeren, öğretici ve eğlenceli bir okuma metni oluştur.
        - Metnin uzunluğu yaklaşık ${getWordCountRange(grade)} kelime olmalı.
        - Metin, ${grade}. sınıf seviyesinde, yaşa uygun ve kolayca anlaşılır olmalıdır.
        - Metnin amacı çocukların dil gelişimini ve genel okuma becerilerini desteklemek olmalıdır.
        - Metin, dikkat çekici ve motive edici bir dil kullanarak çocukların ilgisini çekecek şekilde yazılmalıdır.
        - Metnin sonunda ${questionCount} adet okuma sorusu oluşturulmalı. Sorular:
            - Bu kısmın başlığı Sorular olmalı
            - Öğrencilerin metni anlama düzeyini ölçmeli.
            - Sorular, metnin ana fikrine dayalı olmalı.
            - Her soru, çocukların metni doğru bir şekilde anlamalarını sağlamak için net olmalı.
        Metnin ve soruların tonu, çocuklar için anlaşılır ve motive edici olmalıdır.`;

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

        if (!textResponse.ok) {
            throw new Error(`HTTP hatası! Durum: ${textResponse.status}`);
        }

        const data = await textResponse.json();
        
        if (data.generatedText) {
            const generatedText = data.generatedText;
            let textPart = "";
            let questionsPart = "";
            const questionsIndex = generatedText.indexOf("Sorular");
            
            if (questionsIndex !== -1) {
                textPart = generatedText.substring(0, questionsIndex);
                questionsPart = generatedText.substring(questionsIndex);
            } else {
                textPart = generatedText;
            }

            let formattedText = textPart.replace(/^(.*?)(\n|$)/gm, (match, p1) => {
                if (p1.trim().endsWith(':')) {
                    return `<div class='section-title'>${p1.trim()}</div>`;
                } else if (p1.trim().startsWith("**") && p1.trim().endsWith("**")) {
                    const title = p1.replace(/\*\*/g, '').trim();
                    return `<h2>${title}</h2>`;
                }
                return `<p>${p1.trim()}</p>`;
            });

            let formattedQuestions = "";
            if (questionsPart) {
                const questionLines = questionsPart.split('\n');
                let questions = [];
                let isCollecting = false;
                let currentQuestion = "";

                for (const line of questionLines) {
                    if (line.trim().toLowerCase().includes("sorular")) {
                        isCollecting = true;
                        const cleanTitle = line.trim().replace(/\*\*/g, '');
                        formattedQuestions += `<h3>${cleanTitle}</h3>`;
                    } else if (isCollecting && line.trim()) {
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

                if (currentQuestion) {
                    questions.push(currentQuestion);
                }

                formattedQuestions += '<div class="questions-container">';
                questions.forEach((question) => {
                    const questionNumberMatch = question.match(/^\d+[\.\)]\s/);
                    const questionNumber = questionNumberMatch ? questionNumberMatch[0] : '';
                    const questionText = questionNumberMatch ? question.replace(/^\d+[\.\)]\s/, '') : question;
                    formattedQuestions += `<div class="question-box">${questionNumber}${questionText}</div>`;
                });
                formattedQuestions += '</div>';
            }

            const pageContent = `
                <div class="print-container">
                    <button id="printButton">Yazdır</button>
                    <div class="content">
                        <img src="${imageData.url}" alt="${imageData.alt}" class="main-image">
                        ${formattedText}
                        ${formattedQuestions}
                    </div>
                </div>
            `;

            document.getElementById("output").innerHTML = pageContent;

            document.getElementById("printButton").addEventListener("click", function () {
                const originalContent = document.querySelector(".content").innerHTML;
                const printWindow = window.open('', '', 'height=600,width=800');
                printWindow.document.write(`
                    <html>
                        <head><title>OkuAnla.net Yazdır</title></head>
                        <body>
                            <h1>OkuAnla.net</h1>
                            <div>${originalContent}</div>
                        </body>
                    </html>
                `);
                printWindow.document.close();
                printWindow.onload = function() {
                    setTimeout(() => printWindow.print(), 500);
                };
            });

        } else {
            document.getElementById("output").innerHTML = "Metin oluşturulamadı: API yanıtı geçersiz.";
        }
    } catch (error) {
        console.error("Hata:", error);
        document.getElementById("output").innerHTML = `Metin oluşturulamadı: ${error.message}`;
    }
});
