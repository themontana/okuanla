// Form validation and error handling
function validateForm() {
    console.log('Validating form...');
    
    const grade = document.getElementById("grade").value.trim();
    const textLength = document.getElementById("textLength").value.trim();
    const questionCount = document.getElementById("questionCount").value.trim();

    console.log('Form values:', { grade, textLength, questionCount });

    if (!grade || !textLength || !questionCount) {
        console.log('Validation failed: Missing required fields');
        showError("Lütfen sınıf seviyesi, metin uzunluğu ve soru sayısını seçin.");
        return false;
    }

    console.log('Form validation passed');
    return true;
}

// Error display function
function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'alert alert-danger alert-dismissible fade show';
    errorDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    document.getElementById("textForm").insertBefore(errorDiv, document.getElementById("textForm").firstChild);
    
    // Auto dismiss after 5 seconds
    setTimeout(() => {
        errorDiv.remove();
    }, 5000);
}

// Loading indicator functions
function showLoading() {
    document.querySelector('.loading-spinner').style.display = 'block';
    document.getElementById('output').style.display = 'none';
    // Scroll to loading spinner
    document.querySelector('.loading-spinner').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function hideLoading() {
    document.querySelector('.loading-spinner').style.display = 'none';
}

// Cache management
const cache = new Map();
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour

function getCachedResponse(key) {
    const cached = cache.get(key);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        return cached.data;
    }
    return null;
}

function setCachedResponse(key, data) {
    cache.set(key, {
        data,
        timestamp: Date.now()
    });
}

// Rate limiting
let lastRequestTime = 0;
const RATE_LIMIT_DELAY = 2000; // 2 seconds between requests

function checkRateLimit() {
    const now = Date.now();
    if (now - lastRequestTime < RATE_LIMIT_DELAY) {
        showError(`Lütfen ${Math.ceil((RATE_LIMIT_DELAY - (now - lastRequestTime)) / 1000)} saniye bekleyin.`);
        return false;
    }
    lastRequestTime = now;
    return true;
}

// Form submission handler
document.getElementById("textForm").addEventListener("submit", async function (event) {
    console.log('Form submitted');
    event.preventDefault();

    if (!validateForm() || !checkRateLimit()) {
        console.log('Form validation failed or rate limit exceeded');
        return;
    }

    const grade = document.getElementById("grade").value.trim();
    const theme = document.getElementById("theme")?.value?.trim() || '';
    const keywords = document.getElementById("keywords")?.value?.trim() || '';
    const textLength = document.getElementById("textLength").value.trim();
    const questionCount = document.getElementById("questionCount").value.trim();

    // Convert text length to actual word count ranges
    let wordCountRange;
    switch(textLength) {
        case 'short':
            wordCountRange = '150-200';
            break;
        case 'medium':
            wordCountRange = '250-300';
            break;
        case 'long':
            wordCountRange = '350-400';
            break;
        default:
            wordCountRange = '200-250';
    }

    console.log('Form values:', { grade, theme, keywords, textLength, questionCount, wordCountRange });

    // Create cache key
    const cacheKey = `${grade}-${theme}-${keywords}-${textLength}-${questionCount}`;
    
    // Check cache first
    const cachedResponse = getCachedResponse(cacheKey);
    if (cachedResponse) {
        console.log('Using cached response');
        displayContent(cachedResponse);
        return;
    }

    showLoading();

    try {
        let prompt = `Lütfen ${grade}. sınıf seviyesinde bir okuma metni oluştur.

ÖNEMLİ: Metin uzunluğu kesinlikle ${textLength} kelime arasında olmalıdır. Bu kural kesinlikle değişmez ve en önemli kuraldır.

Soru sayısı: ${questionCount}

Kurallar:
1. KELİME SAYISI: Metin kesinlikle ${textLength} kelime arasında olmalıdır. Bu sayıya uymayan metinler kabul edilmeyecektir.
2. Başlık kalın olmalı ve hiçbir özel işaret içermemeli (##, **, vs. kullanma)
3. Metin tamamen Türkçe olmalı, parantez içinde İngilizce kelimeler olmamalı
4. Sorular "Sorular:" başlığı altında olmalı
5. Her soru numaralı olmalı (1., 2., vs.)
6. Metin çocukların anlayabileceği sade bir dille yazılmalı
7. Metinde ** veya başka özel işaretler kullanma`;
        
        if (theme) {
            prompt += `\n\nKonu: "${theme}"`;
        }
        
        if (keywords) {
            prompt += `\n\nMetinde şu kelimeleri kullan: ${keywords}`;
        }

        prompt += `\n\nSON HATIRLATMA: Metin uzunluğu kesinlikle ${textLength} kelime arasında olmalıdır. Lütfen kelime sayısını dikkatli hesaplayın.`;
        
        console.log('Sending prompt:', prompt);
        
        const response = await fetch('/api/generate-text', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ prompt })
        });

        console.log('Response status:', response.status);

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Response data:', data);
        
        if (data.error) {
            throw new Error(data.error);
        }

        // Cache the response
        setCachedResponse(cacheKey, data.generatedText);
        
        // Display the content
        displayContent(data.generatedText);

    } catch (error) {
        console.error('Error:', error);
        showError(`Bir hata oluştu: ${error.message}`);
        hideLoading();
    }
});

// Content display function
function displayContent(generatedText) {
    hideLoading();
    
    const output = document.getElementById("output");
    output.style.display = "block";
    
    // Split text and questions
            let textPart = "";
            let questionsPart = "";
            
    const questionsIndex = generatedText.indexOf("Sorular:");
            if (questionsIndex !== -1) {
                textPart = generatedText.substring(0, questionsIndex);
                questionsPart = generatedText.substring(questionsIndex);
            } else {
                textPart = generatedText;
            }
            
    // Clean up the text first
    const cleanedText = textPart
        .replace(/^##\s*/gm, '')
        .replace(/\*\*/g, '')
        .replace(/\([^)]*\)/g, '');

    // Split into lines and format
    const lines = cleanedText.split('\n');
    const formattedLines = [];
    let hasTitle = false;

    for (const line of lines) {
        const cleanText = line.trim();
        if (!cleanText) continue;

        if (!hasTitle) {
            formattedLines.push(`<h1 class="text-center mb-4">${cleanText}</h1>`);
            hasTitle = true;
                } else {
            formattedLines.push(`<p class="text-block">${cleanText}</p>`);
        }
                }
            
    // Format questions part
            let formattedQuestions = "";
            if (questionsPart) {
                const questionLines = questionsPart.split('\n');
                let questions = [];
                let currentQuestion = "";
                
                for (const line of questionLines) {
            const cleanLine = line.trim().replace(/\*\*/g, '');
            if (!cleanLine || cleanLine.toLowerCase() === "sorular:") continue;
            
            if (/^\d+[\.\)]\s/.test(cleanLine)) {
                            if (currentQuestion) {
                                questions.push(currentQuestion);
                            }
                currentQuestion = cleanLine;
                        } else if (currentQuestion) {
                currentQuestion += " " + cleanLine;
                    }
                }
                
                if (currentQuestion) {
                    questions.push(currentQuestion);
                }
                
        formattedQuestions = '<div class="questions-section">';
        formattedQuestions += '<h2>Sorular</h2>';
        formattedQuestions += '<div class="row">';
                questions.forEach((question, index) => {
                    const questionNumberMatch = question.match(/^\d+[\.\)]\s/);
            const questionNumber = questionNumberMatch ? questionNumberMatch[0] : `${index + 1}. `;
                    const questionText = questionNumberMatch ? question.replace(/^\d+[\.\)]\s/, '') : question;
                    
                    formattedQuestions += `
                <div class="col-md-6 mb-4">
                    <div class="card h-100">
                        <div class="card-body d-flex flex-column">
                            <p class="card-text mb-3"><strong>${questionNumber}</strong>${questionText}</p>
                            <div class="answer-box mt-auto"></div>
                        </div>
                    </div>
                </div>`;
        });
        formattedQuestions += '</div></div>';
    }
    
    // Create action buttons
    const actionButtons = `
        <div class="action-buttons text-center mb-4">
            <button id="printButton" class="btn btn-primary mx-2">
                <i class="fas fa-print me-2"></i>Yazdır
            </button>
            <button id="pdfButton" class="btn btn-success mx-2">
                <i class="fas fa-file-pdf me-2"></i>PDF Olarak Kaydet
            </button>
            <button id="shareButton" class="btn btn-info text-white mx-2">
                <i class="fas fa-share-alt me-2"></i>Paylaş
            </button>
        </div>
    `;
    
    // Combine all content
    output.innerHTML = `
        <div class="main-wrapper">
            <div class="main-container">
                <div class="action-buttons text-center mb-4">
                    <button id="printButton" class="btn btn-primary mx-2">
                        <i class="fas fa-print me-2"></i>Yazdır
                    </button>
                    <button id="pdfButton" class="btn btn-success mx-2">
                        <i class="fas fa-file-pdf me-2"></i>PDF Olarak Kaydet
                    </button>
                    <button id="shareButton" class="btn btn-info text-white mx-2">
                        <i class="fas fa-share-alt me-2"></i>Paylaş
                    </button>
                </div>
                <div class="text-section">
                    ${formattedLines.join('\n')}
                </div>
                        ${formattedQuestions}
                    </div>
        </div>
    `;

    // Add styles to the head
    const styleElement = document.createElement('style');
    styleElement.textContent = `
        .main-wrapper {
            width: 100%;
            display: flex;
            justify-content: center;
            padding: 10px;
        }
        .main-container {
            width: 100%;
            max-width: 800px;
            margin: 0 auto;
            padding: 15px;
        }
        .text-section {
            width: 100%;
            margin-bottom: 1rem;
        }
        .text-block {
            display: block;
            width: 100%;
            text-align: justify;
            margin-bottom: 0.5rem;
            line-height: 1.4;
            text-indent: 2em;
            color: #444;
        }
        .questions-section {
            width: 100%;
            margin-top: 1rem;
            padding-top: 1rem;
            border-top: 1px solid #eee;
        }
        .questions-section h2 {
            text-align: center;
            margin-bottom: 1rem;
            font-weight: bold;
            color: #333;
            width: 100%;
            font-size: 1.3rem;
        }
        .row {
            display: flex;
            flex-wrap: wrap;
            margin: -5px;
            width: 100%;
        }
        .col-md-6 {
            flex: 0 0 50%;
            max-width: 50%;
            padding: 5px;
            break-inside: avoid;
        }
        .card {
            height: 100%;
            border: 1px solid #ddd;
            border-radius: 6px;
            background: white;
            break-inside: avoid;
        }
        .card-body {
            padding: 0.75rem;
        }
        .card-text {
            margin-bottom: 0.5rem;
            color: #444;
            font-size: 0.95rem;
        }
        .answer-box {
            border: 1px solid #ddd;
            border-radius: 4px;
            min-height: 50px;
            padding: 8px;
            background: #f8f9fa;
        }
        @media (max-width: 768px) {
            .main-wrapper {
                padding: 5px;
            }
            .main-container {
                padding: 5px;
            }
            .text-section {
                padding: 0 10px;
            }
            .text-block {
                font-size: 14px;
                line-height: 1.5;
            }
            .questions-section {
                padding: 0 10px;
            }
            .col-md-6 {
                flex: 0 0 100%;
                max-width: 100%;
                padding: 5px;
            }
            .card {
                margin-bottom: 10px;
            }
            .card-body {
                padding: 0.6rem 0.8rem;
            }
            .action-buttons {
                display: flex;
                flex-direction: column;
                gap: 10px;
                align-items: stretch;
            }
            .action-buttons .btn {
                margin: 0 !important;
                width: 100%;
            }
        }
        @media print {
            @page {
                size: A4;
                margin: 1.5cm;
            }
            body { 
                padding: 0;
                font-size: 11pt;
            }
            .main-container {
                max-width: 100%;
                padding: 0;
            }
            .action-buttons, h4 {
                display: none !important;
            }
            .row {
                display: grid !important;
                grid-template-columns: repeat(2, 1fr) !important;
                gap: 1rem !important;
                margin: 0 !important;
            }
            .col-md-6 {
                width: 100% !important;
                max-width: 100% !important;
                padding: 0 !important;
                page-break-inside: avoid !important;
                break-inside: avoid !important;
            }
            .card {
                border: 1px solid #ddd !important;
                margin-bottom: 0.5rem !important;
                page-break-inside: avoid !important;
                height: auto !important;
            }
            .card-body {
                padding: 0.8rem 1rem !important;
            }
            .card-text {
                font-size: 11pt !important;
                line-height: 1.5 !important;
            }
            .watermark {
                position: fixed !important;
                top: 10px !important;
                left: 15px !important;
                font-size: 8pt !important;
                color: #999 !important;
            }
        }
    `;
    document.head.appendChild(styleElement);

    // Add auto-scroll to the output section
    output.scrollIntoView({ behavior: 'smooth', block: 'start' });

    // Update print styles
    document.getElementById("printButton").addEventListener("click", function() {
        const printContent = document.querySelector('.main-container').cloneNode(true);
        const actionButtons = printContent.querySelector('.action-buttons');
        if (actionButtons) actionButtons.remove();
        
                const printWindow = window.open('', '', 'height=600,width=800');
                
                printWindow.document.write(`
                    <html>
                    <head>
                        <title>OkuAnla - Metin Yazdır</title>
                        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
                        <style>
                            @page {
                                margin: 1cm;
                            }
                                body {
                                padding: 15px;
                                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                                background: white;
                            }
                            .watermark {
                                position: fixed;
                                top: 10px;
                                left: 15px;
                                font-size: 11px;
                                color: #999;
                                font-weight: 500;
                                opacity: 0.7;
                                z-index: 1000;
                            }
                            .header-line {
                                position: relative;
                                border-top: 1px solid #000;
                                margin: 35px 15px 20px;
                            }
                            .main-wrapper {
                                width: 100%;
                                display: flex;
                                justify-content: center;
                            }
                            .main-container {
                                width: 100%;
                                max-width: 800px;
                                margin: 0 auto;
                                padding: 15px;
                            }
                            .text-section {
                                width: 100%;
                                margin-bottom: 1rem;
                            }
                            h1 {
                                font-size: 1.5rem;
                                    font-weight: bold;
                                color: #333;
                                    text-align: center;
                                margin: 0.5rem 0 1rem 0;
                                width: 100%;
                            }
                            .text-block {
                                display: block;
                                width: 100%;
                                text-align: justify;
                                margin-bottom: 0.5rem;
                                line-height: 1.4;
                                text-indent: 2em;
                                color: #444;
                            }
                            .questions-section {
                                width: 100%;
                                margin-top: 1rem;
                                padding-top: 1rem;
                                border-top: 1px solid #eee;
                            }
                            .questions-section h2 {
                                text-align: center;
                                margin-bottom: 1rem;
                                    font-weight: bold;
                                color: #333;
                                width: 100%;
                                font-size: 1.3rem;
                                }
                            .row {
                                    display: flex;
                                    flex-wrap: wrap;
                                margin: -5px;
                                    width: 100%;
                                }
                            .col-md-6 {
                                flex: 0 0 50%;
                                max-width: 50%;
                                padding: 5px;
                            }
                            .card {
                                height: 100%;
                                border: 1px solid #ddd;
                                border-radius: 6px;
                                background: white;
                            }
                            .card-body {
                                padding: 0.75rem;
                            }
                            .card-text {
                                margin-bottom: 0.5rem;
                                color: #444;
                                font-size: 0.95rem;
                            }
                                .answer-box {
                                    border: 1px solid #ddd;
                                border-radius: 4px;
                                    min-height: 50px;
                                padding: 8px;
                                background: #f8f9fa;
                            }
                            @media print {
                                body { padding: 0; }
                                .page-break { page-break-before: always; }
                                .col-md-6 { break-inside: avoid; }
                                .watermark { position: fixed; }
                            }
                        </style>
                    </head>
                    <body>
                <div class="watermark">okuanla.net</div>
                <div class="header-line"></div>
                <div class="main-wrapper">
                    <div class="main-container">
                        ${printContent.innerHTML}
                    </div>
                </div>
                    </body>
                    </html>
                `);
                
                printWindow.document.close();
        printWindow.focus();
                
        setTimeout(() => {
                        printWindow.print();
                    }, 500);
    });
    
    // PDF button
    const pdfButton = document.getElementById("pdfButton");
    if (pdfButton) {
        pdfButton.addEventListener("click", async function() {
            try {
                const mainContainer = document.querySelector('.main-container');
                const clone = mainContainer.cloneNode(true);
                
                // Remove action buttons from the clone
                const actionButtons = clone.querySelectorAll('.action-buttons');
                actionButtons.forEach(btn => btn.remove());

                // Create PDF content with proper encoding
                const pdfContent = `
<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>OkuAnla - PDF Çıktısı</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <style>
        @page {
            margin: 1.5cm;
            size: A4;
        }
        body {
            padding: 0;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: white;
            font-size: 11pt;
            line-height: 1.5;
        }
        .watermark {
            position: fixed;
            top: 10px;
            left: 15px;
            font-size: 8pt;
            color: #999;
            opacity: 0.7;
        }
        .main-wrapper {
            width: 100%;
            display: flex;
            justify-content: center;
        }
        .main-container {
            width: 100%;
            max-width: 100%;
            margin: 0 auto;
            padding: 0;
        }
        .text-section {
            width: 100%;
            margin-bottom: 1rem;
        }
        .text-block {
            display: block;
            width: 100%;
            text-align: justify;
            margin-bottom: 0.5rem;
            line-height: 1.5;
            text-indent: 2em;
            color: #444;
        }
        .questions-section {
            width: 100%;
            margin-top: 2rem;
            padding-top: 1.5rem;
            border-top: 1px solid #eee;
        }
        .row {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 1rem;
            margin: 0;
        }
        .col-6 {
            width: 100%;
            padding: 0;
            break-inside: avoid;
        }
        .problem-card {
            border: 1px solid #ddd;
            border-radius: 6px;
            background: white;
            margin-bottom: 0.5rem;
            break-inside: avoid;
        }
        .card-body {
            padding: 0.8rem 1rem;
        }
        .problem-text {
            font-size: 11pt;
            color: #444;
            margin-bottom: 0;
        }
        .solution-space {
            height: 120px;
            border-top: 1px dashed #ddd;
            margin-top: 15px;
        }
    </style>
</head>
<body>
    <div class="watermark">okuanla.net</div>
    <div class="main-wrapper">
        <div class="main-container">
            ${clone.innerHTML}
        </div>
    </div>
</body>
</html>`;
            
            // Make POST request to generate PDF
            const response = await fetch('/api/generate-pdf', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/pdf'
                },
                body: JSON.stringify({ content: pdfContent })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'PDF oluşturma hatası');
            }

            // Create blob and download
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'okuanla-content.pdf';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('PDF oluşturulurken bir hata oluştu: ' + error.message);
        }
    });
}

// Initialize tooltips
document.addEventListener('DOMContentLoaded', function() {
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
});

