// Form validation and error handling
function validateForm() {
    console.log('Validating form...');
    
    const grade = document.getElementById("grade").value.trim();
    const difficulty = document.getElementById("difficulty").value.trim();
    const questionCount = document.getElementById("questionCount").value.trim();

    console.log('Form values:', { grade, difficulty, questionCount });

    if (!grade || !difficulty || !questionCount) {
        console.log('Validation failed: Missing required fields');
        showError("Lütfen tüm zorunlu alanları doldurun.");
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
    document.querySelector('.loading-spinner p').textContent = 'Problemler oluşturuluyor, lütfen bekleyin...';
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
    const difficulty = document.getElementById("difficulty").value.trim();
    const questionCount = document.getElementById("questionCount").value.trim();

    console.log('Form values:', { grade, theme, difficulty, questionCount });

    // Create cache key
    const cacheKey = `${grade}-${theme}-${difficulty}-${questionCount}`;
    
    // Check cache first
    const cachedResponse = getCachedResponse(cacheKey);
    if (cachedResponse) {
        console.log('Using cached response');
        displayContent(cachedResponse);
        return;
    }

    showLoading();

    try {
        let prompt = `Lütfen matematik problemleri oluştur.

ÖNEMLİ FORMAT:
- Direkt 1. problem ile başla, başlık veya giriş yazma
- Her problemi sadece numara ve içerik olarak yaz (Örnek: "1. Ali'nin 5 kalemi var...")
- Toplam ${questionCount} problem olacak
- ${grade}. sınıf seviyesinde olacak
- Zorluk seviyesi: ${difficulty === 'easy' ? 'KOLAY' : difficulty === 'medium' ? 'ORTA' : 'ZOR'}
- Her problem tek cümle olacak
- Çözümleri yazma
- Açıklama ekleme
- Başlık ekleme
- Giriş cümlesi ekleme
- Sadece problemleri yaz`;
        
        if (theme) {
            prompt += `\n- Konu: ${theme}`;
        }

        prompt += `\n\nÖRNEK FORMAT:
1. [Problem metni]
2. [Problem metni]
(böyle devam edecek)`;

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
    
    // Get theme if exists
    const theme = document.getElementById("theme")?.value?.trim() || '';
    
    // Clean up the text: remove intro/outro text and solutions
    let cleanedText = generatedText;
    
    // Remove any introductory text patterns
    const introPatterns = [
        /^\d+\.\s*sınıf.*?(?=1\.)/i,
        /^(?:kolay|orta|zor).*?(?=1\.)/i,
        /^.*?(?:problem|matematik).*?(?=1\.)/i,
        /^.*?(?:tane|adet).*?(?=1\.)/i,
        /^.*?(?:seviye|zorluk).*?(?=1\.)/i,
        /^[^1]*1\./   // Removes everything before the first "1."
    ];
    
    // Apply each pattern
    introPatterns.forEach(pattern => {
        cleanedText = cleanedText.replace(pattern, '1.');
    });
    
    // Remove solutions (anything after "Çözüm" or similar keywords)
    cleanedText = cleanedText.split(/\bÇözüm\b|\bÇözümü\b|:[\s]*$/i)[0];
    
    // Clean up extra spaces and newlines
    cleanedText = cleanedText.replace(/\s+/g, ' ').trim();
    
    // Split into problems and clean them
    const problems = cleanedText.split(/(\d+\.)/)
        .filter(text => text.trim())
        .reduce((acc, curr, i, arr) => {
            if (curr.endsWith('.')) {
                // This is a number, make it bold
                const nextText = (arr[i + 1] || '').trim();
                acc.push(`<strong>${curr}</strong> ${nextText}\n\n<div class="solution-space"></div>`);
            }
            return acc;
        }, []);

    // Format problems into cards with proper print layout
    const formattedProblems = problems.map(problem => `
        <div class="col-6 mb-3">
            <div class="card problem-card">
                <div class="card-body py-2 px-3">
                    <div class="problem-text">${problem.trim()}</div>
                </div>
            </div>
                    </div>
    `).join('');

    // Capitalize first letter of theme and set page title
    const capitalizedTheme = theme ? theme.charAt(0).toUpperCase() + theme.slice(1).toLowerCase() : '';
    const pageTitle = theme ? `${capitalizedTheme} Problemleri` : 'Problemler';

    // Combine all content
    output.innerHTML = `
        <div class="main-wrapper">
            <div class="main-container">
                <h4 class="text-center mb-4">${pageTitle}</h4>
                <div class="action-buttons text-center mb-4 d-print-none">
                    <button id="printButton" class="btn btn-primary">
                        <i class="fas fa-print me-2"></i>Yazdır
                    </button>
                </div>
                <div class="row g-3">
                    ${formattedProblems}
                </div>
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
            max-width: 1000px;
        }
        .problem-card {
            border: 1px solid #ddd;
            border-radius: 6px;
            background: white;
            font-size: 1rem;
            margin-bottom: 0;
            min-height: 120px;
        }
        .card-body {
            padding: 0.8rem 1rem;
        }
        .problem-text {
            color: #333;
            white-space: pre-wrap;
            line-height: 1.5;
        }
        .solution-space {
            height: 100px;
            margin-top: 12px;
        }
        @media (max-width: 768px) {
            .main-wrapper {
                padding: 5px;
            }
            .main-container {
                padding: 5px;
            }
            .col-6 {
                width: 100% !important;
                max-width: 100% !important;
                flex: 0 0 100% !important;
            }
            .problem-card {
                min-height: 100px;
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
            .col-6 {
                width: 100% !important;
                max-width: 100% !important;
                padding: 0 !important;
                page-break-inside: avoid !important;
                break-inside: avoid !important;
            }
            .problem-card {
                border: 1px solid #ddd !important;
                margin-bottom: 0.5rem !important;
                page-break-inside: avoid !important;
                height: auto !important;
                min-height: 130px !important;
            }
            .card-body {
                padding: 0.8rem 1rem !important;
            }
            .problem-text {
                font-size: 11pt !important;
                line-height: 1.5 !important;
            }
            .solution-space {
                height: 120px !important;
                border-top: 1px dashed #ddd !important;
                margin-top: 15px !important;
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

    // Add event listeners for buttons after they are created
    const printButton = document.getElementById("printButton");

    if (printButton) {
        printButton.addEventListener("click", function() {
            const printContent = document.querySelector('.main-container').cloneNode(true);
            const actionButtons = printContent.querySelector('.action-buttons');
            if (actionButtons) actionButtons.remove();
            
            const printWindow = window.open('', '', 'height=600,width=800');
            
            printWindow.document.write(`
                <html>
                <head>
                    <title>OkuAnla - Matematik Problemleri</title>
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
                            max-width: 1000px;
                            margin: 0 auto;
                            padding: 15px;
                        }
                        .card {
                            height: 100%;
                            border: 1px solid #ddd;
                            border-radius: 6px;
                            background: white;
                            break-inside: avoid;
                            margin-bottom: 15px;
                        }
                        .card-body {
                            padding: 0.75rem;
                        }
                        .card-title {
                            font-size: 1.1rem;
                            font-weight: bold;
                            color: #333;
                            margin-bottom: 1rem;
                        }
                        .problem-text {
                            font-size: 0.95rem;
                            color: #444;
                            white-space: pre-wrap;
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
    }
}

// Initialize tooltips
document.addEventListener('DOMContentLoaded', function() {
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
});

// Update the button text in the form submission handler
document.addEventListener('DOMContentLoaded', function() {
    const submitButton = document.querySelector('#textForm button[type="submit"]');
    if (submitButton) {
        submitButton.innerHTML = '<i class="fas fa-calculator me-2"></i>Problemleri Oluştur';
    }
});