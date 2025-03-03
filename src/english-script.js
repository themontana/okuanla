// Form dinleyicisi
document.getElementById("englishForm").addEventListener("submit", async function (event) {
    event.preventDefault(); // Sayfanın yenilenmesini önler

    // Kullanıcıdan alınan girdiler
    const englishGrade = document.getElementById("englishGrade").value.trim();
    const unit = document.getElementById("unit").value.trim();
    const unitText = document.getElementById("unit").options[document.getElementById("unit").selectedIndex].text;
    const difficulty = document.getElementById("difficulty").value.trim();
    const questionCount = document.getElementById("questionCount").value.trim();

    // Eğer kullanıcı herhangi bir alanı boş bırakırsa hata mesajı göster
    if (!englishGrade || !unit || !difficulty || !questionCount) {
        document.getElementById("output").innerHTML = "<p>Lütfen tüm alanları doldurun.</p>";
        return;
    }

    // Sınıf seviyesi ve üniteye göre uygun kelime havuzu
    function getVocabularyByGradeAndUnit(grade, unit) {
        // 2. sınıf kelime havuzu
        const grade2Vocabulary = {
            '1': ['ambulance', 'balloon', 'cake', 'café', 'camp', 'doctor', 'football', 'gorilla', 'kangaroo', 'laptop', 'lemon', 'microphone', 'note', 'picnic', 'radio', 'restaurant', 'stadium', 'television', 'train', 'university', 'wagon', 'yoghurt', 'zebra'],
            '2': ['afternoon', 'bye', 'fine', 'great', 'hello', 'hi', 'morning', 'night', 'okay', 'thanks'],
            '3': ['close', 'color', 'cut', 'draw', 'excuse', 'left', 'open', 'paint', 'right', 'say', 'sit', 'stand', 'turn'],
            '4': ['board', 'book', 'crayon', 'desk', 'eraser', 'notebook', 'paper', 'pen', 'pencil', 'school bag', 'scissors', 'table'],
            '5': ['black', 'blue', 'brown', 'color', 'green', 'like', 'orange', 'pink', 'purple', 'red', 'white', 'yellow'],
            '6': ['basketball', 'chess', 'dance', 'football', 'hide and seek', 'jump', 'play', 'run', 'rope', 'sing', 'skip', 'slide', 'walk'],
            '7': ['arm', 'close', 'ear', 'eye', 'finger', 'foot', 'hand', 'head', 'knee', 'mouth', 'nose', 'open', 'point', 'raise', 'show', 'touch'],
            '8': ['bin', 'bird', 'box', 'car', 'cat', 'dog', 'fish', 'rabbit', 'sea', 'stone', 'tree', 'turtle'],
            '9': ['apple', 'banana', 'color', 'cut', 'eat', 'fruit', 'give', 'grapefruit', 'grape', 'lemon', 'melon', 'orange', 'peach', 'touch', 'watermelon'],
            '10': ['chicken', 'cow', 'donkey', 'duck', 'elephant', 'fly', 'goat', 'horse', 'jump', 'lion', 'monkey', 'run', 'sheep', 'snake', 'spider', 'swim']
        };

        // Diğer sınıflar için boş kelime havuzları (daha sonra doldurulabilir)
        const vocabularies = {
            '2': grade2Vocabulary
            // Daha sonra diğer sınıflar eklenebilir: '3': grade3Vocabulary, ...
        };

        // İstenen sınıf ve ünite için kelime havuzunu döndür
        if (vocabularies[grade] && vocabularies[grade][unit]) {
            return {
                grade: grade,
                unit: unit,
                vocabulary: vocabularies[grade][unit]
            };
        }

        // Eğer belirtilen sınıf veya ünite bulunamazsa boş bir dizi döndür
        return {
            grade: grade,
            unit: unit,
            vocabulary: []
        };
    }

    // Zorluk seviyesine göre dil karmaşıklığı
    function getDifficultyDescription(diffLevel) {
        switch(diffLevel) {
            case 'easy':
                return 'simple sentences, basic vocabulary, present tense';
            case 'medium':
                return 'compound sentences, varied vocabulary, present and past tenses';
            case 'hard':
                return 'complex sentences, rich vocabulary, varied tenses and grammatical structures';
            default:
                return 'appropriate level English';
        }
    }

    // Metin uzunluğunu sınıf seviyesine göre ayarla
    function getWordCountByGrade(grade) {
        const wordCounts = {
            '2': '100-150',
            '3': '150-200',
            '4': '200-250',
            '5': '250-300',
            '6': '300-350',
            '7': '350-400',
            '8': '400-450'
        };
        
        return wordCounts[grade] || '200-250';
    }

    // Kullanıcı girdilerine göre prompt oluştur
    const vocabularyInfo = getVocabularyByGradeAndUnit(englishGrade, unit);
    const wordCount = getWordCountByGrade(englishGrade);
    
    // Prompt'a kelime havuzunu ekle
    const vocabularyPrompt = vocabularyInfo.vocabulary.length > 0 
        ? `- Include as many of these vocabulary words as possible: ${vocabularyInfo.vocabulary.join(', ')}`
        : '';
    
    const prompt = `
        Please create an English reading comprehension passage with ${questionCount} questions for ${englishGrade}th grade Turkish students.
        
        The passage should:
        - Be about ${unitText.split(':')[1] || 'appropriate topics for this grade level'}
        - Have ${wordCount} words
        - Use ${getDifficultyDescription(difficulty)} language complexity
        - Be educational and engaging
        - Be appropriate for the age group
        ${vocabularyPrompt}
        
        For the questions:
        - Create exactly ${questionCount} questions that test comprehension
        - Include a mix of direct and inferential questions
        - Use clear, simple instructions appropriate for Turkish students learning English
        - Don't translate questions to Turkish
        - Format with a "Questions" title before the questions section
        
        The content should be instructional, age-appropriate, and focused on language acquisition. Don't say anything else before the title or after the text, just share title, text and questions
    `;

    // Kullanıcıya metin oluşturuluyor bilgisini göster
    document.getElementById("output").innerHTML = "<p>İngilizce metin oluşturuluyor...</p>";

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
            
            // "Questions" başlığını bul ve metni ikiye böl
            const questionsIndex = generatedText.indexOf("Questions");
            
            if (questionsIndex !== -1) {
                textPart = generatedText.substring(0, questionsIndex);
                questionsPart = generatedText.substring(questionsIndex);
            } else {
                textPart = generatedText;
            }
            
            // Metin kısmını formatla
            let formattedText = "";
            
            // Başlığı bulup özel olarak formatla
            const lines = textPart.split('\n');
            let title = "";
            let contentLines = [];
            
            // İlk satırı başlık olarak al (varsa)
            if (lines.length > 0 && lines[0].trim()) {
                title = lines[0].trim();
                // Başlığı temizle (markdown işaretleri, vb.)
                title = title.replace(/^#+\s+/, '').replace(/\*\*/g, '');
                contentLines = lines.slice(1);
            } else {
                contentLines = lines;
            }
            
            // Başlığı formatla
            if (title) {
                formattedText += `<h1 style="font-size: 20px; font-weight: bold; text-align: center;">${title}</h1>`;
            }
            
            // İçeriği formatla
            formattedText += contentLines.map(line => {
                if (!line.trim()) return ""; // Boş satırları atla
                return `<p style="text-indent: 20px; margin-bottom: 15px; line-height: 1.6; font-family: Arial, sans-serif;">${line.trim()}</p>`;
            }).join('');
            
            // Sorular kısmını formatla - iki sütunlu yapı
            let formattedQuestions = "";
            
            if (questionsPart) {
                // Soruları ayır
                const questionLines = questionsPart.split('\n');
                let questions = [];
                
                // Başlık dışındaki soruları al
                let isCollecting = false;
                let currentQuestion = "";
                
                for (const line of questionLines) {
                    if (line.trim().toLowerCase().includes("questions")) {
                        isCollecting = true;
                        // ** işaretlerini kaldır
                        const cleanTitle = line.trim().replace(/\*\*/g, '').replace(/^#+\s+/, '');
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
                
                // Soruları iki sütunda göster - script.js ile aynı format
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
            
            // Sayfa düzenini oluştur - script.js ile aynı düzen
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
                const printWindow = window.open('', '_blank');
                printWindow.document.write(`
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <title>İngilizce Okuma Parçası</title>
                        <meta charset="utf-8">
                        <style>
                            body {
                                font-family: Arial, sans-serif;
                                padding: 20px;
                                margin: 0;
                            }
                            @media print {
                                @page {
                                    size: A4;
                                    margin: 1.5cm;
                                }
                            }
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
                    </head>
                    <body>
                        ${contentWithoutButton}
                        <script>
                            window.onload = function() {
                                setTimeout(function() {
                                    window.print();
                                    window.close();
                                }, 500);
                            };
                        </script>
                    </body>
                    </html>
                `);
                printWindow.document.close();
            });
            
        } else {
            document.getElementById("output").innerHTML = "<p>Metin oluşturma hatası. Lütfen tekrar deneyin.</p>";
        }
    } catch (error) {
        console.error("Hata:", error);
        document.getElementById("output").innerHTML = "<p>Bir hata oluştu: " + error.message + "</p>";
    }
});
