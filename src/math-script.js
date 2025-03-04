<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Matematik Problemleri</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            font-size: 16px;
            line-height: 1.6;
            padding: 10px;
        }

        h1 {
            font-size: 20px;
            font-weight: bold;
            text-align: center;
            margin-bottom: 20px;
        }

        .problems-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 10px; /* Boşlukları azalttık */
        }

        .problem-item {
            background-color: #f8f9fa;
            border-radius: 5px;
            padding: 6px; /* İç boşluğu küçülttük */
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .problem-text {
            font-weight: bold;
            margin-bottom: 5px;
            font-size: 14px;
        }

        .answer-box {
            border: 1px solid #ddd;
            border-radius: 3px;
            background-color: white;
            min-height: 40px; /* Cevap kutularını küçülttük */
            padding: 5px;
        }

        @media print {
            body {
                font-size: 12px; /* Yazı boyutunu küçülttük */
                line-height: 1.3;
                margin: 0.5cm;
            }

            h1 {
                font-size: 16px; /* Başlığı küçülttük */
                margin-bottom: 10px;
            }

            .problems-grid {
                grid-template-columns: repeat(2, 1fr) !important;
                gap: 8px !important; /* Kutular arasındaki boşluğu azalttık */
            }

            .problem-item {
                padding: 5px;
                page-break-inside: avoid;
            }

            .problem-text {
                font-size: 12px;
                margin-bottom: 4px;
            }

            .answer-box {
                min-height: 35px; /* Kutuların yüksekliğini azalttık */
                padding: 4px;
            }
        }
    </style>
</head>
<body>

    <form id="mathForm">
        <label for="mathGrade">Sınıf Seviyesi:</label>
        <input type="number" id="mathGrade" min="1" max="4" required><br>

        <label for="difficulty">Zorluk Seviyesi:</label>
        <select id="difficulty" required>
            <option value="kolay">Kolay</option>
            <option value="orta">Orta</option>
            <option value="zor">Zor</option>
        </select><br>

        <label for="topic">Konu:</label>
        <input type="text" id="topic" required><br>

        <label for="problemCount">Problem Sayısı:</label>
        <input type="number" id="problemCount" min="1" required><br>

        <button type="submit">Problemleri Oluştur</button>
    </form>

    <div id="output"></div>

    <script>
        document.getElementById("mathForm").addEventListener("submit", async function (event) {
            event.preventDefault();

            const mathGrade = document.getElementById("mathGrade").value.trim();
            const difficulty = document.getElementById("difficulty").value.trim();
            const topic = document.getElementById("topic").value.trim();
            const problemCount = document.getElementById("problemCount").value.trim();

            if (!mathGrade || !difficulty || !topic || !problemCount) {
                document.getElementById("output").innerHTML = "<p>Lütfen tüm alanları doldurun.</p>";
                return;
            }

            function getDifficultyDescription(grade, level) {
                const descriptions = {
                    "1": { "kolay": "tek basamaklı sayılarla basit işlemler", "orta": "iki basamaklı sayılarla temel işlemler", "zor": "iki basamaklı sayıların karışık işlemleri" },
                    "2": { "kolay": "iki basamaklı sayılarla temel işlemler", "orta": "iki ve üç basamaklı sayılarla karışık işlemler", "zor": "üç basamaklı sayılarla çeşitli problem türleri" },
                    "3": { "kolay": "iki ve üç basamaklı sayılarla temel işlemler", "orta": "üç basamaklı sayılarla çoklu adım gerektiren işlemler", "zor": "dört basamaklı sayılarla karmaşık problem çözümü" },
                    "4": { "kolay": "üç basamaklı sayılarla temel işlemler", "orta": "üç ve dört basamaklı sayılarla çoklu adım gerektiren işlemler", "zor": "dört basamaklı sayılarla mantık yürütme gerektiren işlemler" }
                };
                return descriptions[grade][level] || "temel matematik problemleri";
            }

            const prompt = `Lütfen ${mathGrade}. sınıf öğrencileri için "${topic}" konusunda ${difficulty} seviyede ${problemCount} tane matematik problemi oluştur.`;

            document.getElementById("output").innerHTML = "<p>Matematik problemleri oluşturuluyor...</p>";

            try {
                const response = await fetch('/api/generate-text', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ prompt })
                });

                if (!response.ok) throw new Error(`HTTP hatası! Durum: ${response.status}`);

                const data = await response.json();

                if (data.generatedText) {
                    let generatedText = data.generatedText.replace(/##\s+/g, '').replace(/\*\*/g, '');

                    const lines = generatedText.split('\n');
                    let title = "";
                    let problems = [];
                    let currentProblem = "";

                    for (let line of lines) {
                        line = line.trim();
                        if (!title && line) {
                            title = line;
                            continue;
                        }
                        if (/^\d+[\.:]/.test(line)) {
                            if (currentProblem) problems.push(currentProblem);
                            currentProblem = line;
                        } else if (line) {
                            currentProblem += " " + line;
                        }
                    }
                    if (currentProblem) problems.push(currentProblem);

                    let formattedTitle = `<h1>${title}</h1>`;
                    let formattedProblems = '<div class="problems-grid">';

                    problems.forEach(problem => {
                        const match = problem.match(/^(\d+[\.:])\s*(.*)/);
                        let problemNumber = match ? match[1] : "";
                        let problemText = match ? match[2] : problem;

                        formattedProblems += `
                            <div class="problem-item">
                                <p class="problem-text">${problemNumber} ${problemText}</p>
                                <div class="answer-box"></div>
                            </div>
                        `;
                    });

                    formattedProblems += '</div>';
                    document.getElementById("output").innerHTML = formattedTitle + formattedProblems;
                } else {
                    document.getElementById("output").innerHTML = "<p>Matematik problemleri oluşturulamadı.</p>";
                }
            } catch (error) {
                document.getElementById("output").innerHTML = `<p>Hata: ${error.message}</p>`;
            }
        });
    </script>
</body>
</html>