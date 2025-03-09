// Form validation and error handling
function validateForm() {
    console.log('Validating form...');
    
    const grade = document.getElementById("grade").value.trim();
    const unit = document.getElementById("unit").value.trim();
    const difficulty = document.getElementById("difficulty").value.trim();
    const structure = document.getElementById("structure").value.trim();

    console.log('Form values:', { grade, unit, difficulty, structure });

    if (!grade || !unit || !difficulty) {
        console.log('Validation failed: Missing required fields');
        showError("Lütfen gerekli alanları doldurun.");
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
    document.querySelector('.loading-spinner p').textContent = 'Generating text, please wait...';
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
        showError(`Please wait ${Math.ceil((RATE_LIMIT_DELAY - (now - lastRequestTime)) / 1000)} seconds.`);
        return false;
    }
    lastRequestTime = now;
    return true;
}

// Vocabulary lists
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

        const grade3Vocabulary = {
            '1': ['bye!', 'day', 'good afternoon!', 'good bye!', 'good evening!', 'good morning!', 'good night!', 'hello!', 'hi', 'nice', 'weekend', 'see you (soon)', 'spell', 'take care'],
            '2': ['aunt', 'brother', 'cousin', 'dad', 'daughter', 'family', 'father', 'grandfather', 'grandma', 'grandmother', 'grandpa', 'kinship', 'mom', 'mother', 'sister', 'son', 'uncle'],
            '3': ['beautiful', 'big', 'fast', 'fat', 'old', 'short', 'slim', 'slow', 'small', 'strong', 'tall', 'ugly', 'weak', 'young'],
            '4': ['angry', 'bad', 'cook', 'dance', 'drink', 'eat', 'energetic', 'good', 'go', 'happy', 'hungry', 'listen', 'okay', 'play', 'read', 'ride', 'run', 'sad', 'sleep', 'surprised', 'study', 'swim', 'thirsty', 'tired', 'unhappy', 'walk', 'write', 'watch'],
            '5': ['ball', 'black', 'block', 'blue', 'brown', 'button', 'chess', 'computer game', 'doll', 'green', 'kite', 'lorry', 'marble', 'orange', 'plane', 'playing card', 'pink', 'purple', 'red', 'robot', 'teddy bear', 'toy box', 'toy car', 'train', 'white', 'yellow'],
            '6': ['armchair', 'bathroom', 'bed', 'bedroom', 'bookcase', 'carpet', 'cattle', 'chair', 'cup', 'fridge', 'garage', 'garden', 'home', 'house', 'kitchen', 'livingroom', 'playroom', 'rectangle', 'round', 'shampoo', 'soap', 'sofa', 'square', 'table', 'toilet', 'triangle', 'wardrobe'],
            '7': ['bank', 'cafe', 'cinema', 'city', 'hospital', 'library', 'market', 'mosque', 'museum', 'park', 'restaurant', 'school', 'shopping centre', 'town', 'village', 'zoo'],
            '8': ['bike', 'boat', 'bus', 'car', 'helicopter', 'motorcycle', 'plane', 'ship'],
            '9': ['cloudy', 'cold', 'desert', 'freezing', 'hot', 'nice', 'pole', 'rainforest', 'rainy', 'snowy', 'sunny', 'today', 'warm', 'weather', 'wet', 'windy'],
            '10': ['bear', 'bee', 'butterfly', 'chicken', 'cow', 'dolphin', 'donkey', 'duck', 'elephant', 'fish', 'forest', 'frog', 'goat', 'horse', 'ladybird', 'like', 'lion', 'monkey', 'mountain', 'parrot', 'pigeon', 'sea', 'shark', 'snake', 'spider', 'whale']
        };

        const grade4Vocabulary = {
            '1': ['activity', 'again', 'board', 'can', 'card', 'classroom', 'clean', 'close', 'color', 'come', 'congratulations', 'desk', 'door', 'eraser', 'give', 'go back', 'great', 'hand', 'Hello!', 'Here you are.', 'Hi!', 'Hurray!', 'join', 'keep', 'leave', 'let\'s', 'lights', 'listen', 'may', 'name', 'numbers (1-50)', 'of course', 'open', 'pencil case', 'pencil sharpener', 'play', 'please', 'quiet', 'raise', 'ruler', 'school bag', 'square', 'stay at', 'sure', 'teacher', 'tidy', 'turn off', 'turn on', 'what', 'window', 'winner', 'You\'re welcome.'],
            '2': ['America', 'American', 'Britain', 'British', 'country', 'east', 'German', 'Germany', 'he', 'I', 'Iran', 'Iranian', 'Iraq', 'Iraqi', 'Japan', 'Japanese', 'nationality', 'north', 'Pakistan', 'Pakistani', 'Russia', 'Russian', 'she', 'south', 'South Africa', 'South African', 'Turkish', 'Türkiye', 'west', 'where', 'you'],
            '3': ['are', 'can', 'cannot', 'carry', 'climb a tree', 'cycling', 'do puzzle', 'Don\'t worry.', 'drive', 'fly', 'helpful', 'her', 'his', 'is', 'jump high', 'music', 'my', 'my mother\'s car', 'Oh, my God!', 'photography', 'play the guitar', 'play the piano', 'ride a bike', 'ride a horse', 'school club', 'speak', 'superhero', 'swim', 'take picture', 'these', 'this', 'whose', 'your'],
            '4': ['again', 'checkmate', 'chess master', 'dislike', 'do', 'don\'t', 'drawing and coloring', 'fly a kite', 'like', 'pardon', 'play chess', 'play table tennis', 'play with dolls', 'play with marbles', 'read comics', 'ride a bike', 'say', 'singing and dancing', 'slowly', 'swim', 'watch cartoon'],
            '5': ['at night', 'at noon', 'come home', 'do homework', 'early', 'Friday', 'get dressed', 'go shopping', 'go to bed', 'go to school', 'go to the cinema', 'go to the playground', 'have a shower', 'have breakfast', 'have dinner', 'have lunch', 'Hurry up!', 'in the afternoon', 'in the evening', 'in the morning', 'karate class', 'meet with friends', 'Monday', 'o\'clock', 'play computer game', 'read a book', 'Saturday', 'school uniform', 'Sunday', 'Thursday', 'time', 'Tuesday', 'wake up', 'wash your face', 'watch TV', 'Wednesday'],
            '6': ['Be careful!', 'Be patient!', 'Be slow!', 'bean maze', 'behind', 'blow', 'bottle', 'box', 'brush', 'button', 'cardboard', 'chair', 'change', 'coloring pen', 'cotton swab', 'cup', 'cut', 'cut the cardboard', 'daily', 'dip', 'disc', 'dish soap', 'do the experiment', 'draw', 'experiment', 'fold', 'fold the paper', 'food coloring', 'freeze', 'get', 'glass', 'glue', 'glue stick', 'go through', 'Have fun!', 'ice cube', 'impossible', 'in', 'in front of', 'interesting', 'jar', 'kite', 'light maze', 'line', 'materials', 'melt', 'mix', 'mix red and yellow', 'near', 'on', 'pin', 'pinwheel', 'place', 'plant', 'plant the seeds', 'plate', 'push', 'ruler', 'salt', 'school glue', 'science', 'science project', 'scientist', 'scissors', 'shake', 'soil', 'step', 'straw', 'string', 'surprised', 'touch', 'toy box', 'under', 'vegetable oil', 'water the plant'],
            '7': ['actor', 'actress', 'ambulance', 'assembly point', 'businessman', 'businesswoman', 'chef', 'community', 'dance school', 'dancer', 'doctor', 'emergency exit sign', 'farm', 'farmer', 'fire alarm', 'fire station', 'fire truck', 'firefighter', 'flying a plane', 'follow', 'growing vegetables', 'help', 'home', 'hospital', 'hotel', 'instruction', 'job', 'music academy', 'nurse', 'office', 'office worker', 'pilot', 'police car', 'police station', 'policeman', 'policewoman', 'post office', 'restaurant', 'school', 'singer', 'teacher', 'teaching children', 'treating animals', 'treating people', 'vet', 'veterinary clinic', 'waiter', 'waitress', 'workplace', 'writer'],
            '8': ['accessories', 'belt', 'boots', 'borrow', 'clothes', 'coat', 'cold', 'cool', 'dress', 'fall', 'gloves', 'has got', 'have got', 'hot', 'jacket', 'jeans', 'need', 'put on', 'rainy', 'scarf', 'season', 'shirt', 'shorts', 'skirt', 'snowman', 'snowy', 'socks', 'sorry', 'spring', 'summer', 'sunglasses', 'sunny', 'T-shirt', 'trousers', 'umbrella', 'wardrobe', 'warm', 'windy', 'winter'],
            '9': ['age', 'bald', 'beard and mustache', 'beautiful', 'blonde hair', 'blue eyes', 'brown hair', 'curly hair', 'dark hair', 'fat', 'favorite', 'freckles', 'glasses', 'handsome', 'headscarf', 'interesting', 'middle-aged', 'movie', 'old', 'physical characteristic', 'possession', 'short', 'slim', 'straight hair', 'tall', 'thin', 'wavy hair', 'young'],
            '10': ['a', 'an', 'apple', 'bread', 'butter', 'cheese', 'coffee', 'cupcake', 'delicious', 'Do you want...?', 'drinks', 'egg', 'Enjoy your meal!', 'feel', 'fish and chips', 'food', 'full', 'hamburger', 'honey', 'How about...?', 'hungry', 'ice cream', 'lemon', 'lemonade', 'marmalade', 'Maybe later.', 'milk', 'milkshake', 'need', 'olives', 'omelet', 'pasta', 'salad', 'sandwich', 'some', 'soup', 'sugar', 'tea', 'thirty', 'tomato', 'tomato soup', 'try', 'vegetables', 'water', 'What about...?', 'Would you like...?', 'yogurt']
        };

// Form submission handler
document.getElementById("textForm").addEventListener("submit", async function (event) {
    console.log('Form submitted');
    event.preventDefault();

    if (!validateForm() || !checkRateLimit()) {
        console.log('Form validation failed or rate limit exceeded');
        return;
    }

    const grade = document.getElementById("grade").value.trim();
    const unit = document.getElementById("unit").value.trim();
    const difficulty = document.getElementById("difficulty").value.trim();
    const structure = document.getElementById("structure").value.trim();

    console.log('Form values:', { grade, unit, difficulty, structure });

    // Get vocabulary for selected grade and unit
    let vocabularyList = [];
    if (grade === "2" && grade2Vocabulary[unit]) {
        vocabularyList = grade2Vocabulary[unit];
    } else if (grade === "3" && grade3Vocabulary[unit]) {
        vocabularyList = grade3Vocabulary[unit];
    } else if (grade === "4" && grade4Vocabulary[unit]) {
        vocabularyList = grade4Vocabulary[unit];
    }

    // Create cache key
    const cacheKey = `${grade}-${unit}-${difficulty}-${structure}`;
    
    // Check cache first
    const cachedResponse = getCachedResponse(cacheKey);
    if (cachedResponse) {
        console.log('Using cached response');
        displayContent(cachedResponse);
        return;
    }

    showLoading();

    try {
        let prompt = `Please generate an English reading text.

IMPORTANT FORMAT:
- Create a reading text suitable for grade ${grade} elementary school students
- Difficulty level: ${difficulty === 'easy' ? 'EASY - Use only simple and clear sentences with Simple Present Tense' : difficulty === 'medium' ? 'MEDIUM' : 'HARD'}
- Use the following grammar structure: ${structure}
- The text should be engaging and appropriate for the grade level
- Include a title for the text
- Use these vocabulary words in the text (choose at least 5): ${vocabularyList.join(', ')}
- Include 4 comprehension questions after the text
- Format the questions under "Questions:" heading
- Do not include answers
- Do not include any introductory text or explanations
- Start with the title, then the reading text${difficulty === 'easy' ? '\n- Keep sentences short and simple\n- Use only Simple Present Tense\n- Avoid complex sentence structures' : ''}`;

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
        showError(`An error occurred: ${error.message}`);
        hideLoading();
    }
});

// Content display function
function displayContent(generatedText) {
    hideLoading();
    
    const output = document.getElementById("output");
    output.style.display = "block";
    
    // Split title, text and questions
    let [title, ...rest] = generatedText.split('\n\n');
    let text = '', questions = '';
    
    // Find where questions start
    const questionsIndex = rest.findIndex(part => part.toLowerCase().includes('questions:'));
    if (questionsIndex !== -1) {
        text = rest.slice(0, questionsIndex).join('\n\n');
        questions = rest.slice(questionsIndex).join('\n\n');
    } else {
        text = rest.join('\n\n');
    }
    
    // Clean up the text and remove asterisks
    title = title.trim().replace(/\*/g, '');
    text = text.trim().replace(/\*/g, '');
    questions = questions ? questions.replace(/Questions:/i, '').replace(/\*/g, '').trim() : '';
    
    // Format questions into cards
    let questionCards = '';
    if (questions) {
        questionCards = questions.split(/\d+\./)
            .filter(q => q.trim())
            .map((q, i) => `
                <div class="card mb-3">
                    <div class="card-body">
                        <p class="card-text">${i + 1}. ${q.trim().replace(/\*/g, '')}</p>
                    </div>
                </div>
            `).join('');
    }

    // Combine all content
    output.innerHTML = `
        <div class="main-wrapper">
            <div class="main-container">
                <div class="action-buttons text-center mb-4">
                    <button id="printButton" class="btn btn-primary mx-2">
                        <i class="fas fa-print me-2"></i>Print
                    </button>
                    <button id="pdfButton" class="btn btn-success mx-2">
                        <i class="fas fa-file-pdf me-2"></i>Save as PDF
                    </button>
                    <button id="shareButton" class="btn btn-info text-white mx-2">
                        <i class="fas fa-share-alt me-2"></i>Share
                    </button>
                </div>
                <div class="content-section">
                    <h3 class="text-center mb-4">${title}</h3>
                    <div class="text-content mb-4">
                        ${text.split('\n').map(p => `<p>${p}</p>`).join('')}
                    </div>
                    ${questions ? `
                        <div class="questions-section">
                            <h5 class="mb-3">Questions:</h5>
                            <div class="questions-grid">
                                ${questionCards}
                            </div>
                        </div>
                    ` : ''}
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
            max-width: 800px;
            margin: 0 auto;
            padding: 15px;
        }
        .content-section {
            width: 100%;
            margin-bottom: 1rem;
        }
        .text-content {
            color: #333;
            line-height: 1.6;
            font-size: 12pt;
            text-align: justify;
        }
        .questions-section {
            margin-top: 2rem;
            padding-top: 1.5rem;
            border-top: 2px solid #eee;
        }
        .questions-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 1rem;
        }
        .card {
            break-inside: avoid;
            margin-bottom: 1rem;
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 1rem;
        }
        .card-text {
            margin: 0;
            font-size: 12pt;
            color: #444;
            text-align: left;
            align-self: flex-start;
        }
        @media (max-width: 768px) {
            .main-wrapper {
                padding: 5px;
            }
            .main-container {
                padding: 5px;
            }
            .content-section {
                padding: 0 10px;
            }
            .text-content {
                font-size: 14px;
                line-height: 1.5;
            }
            .questions-section {
                padding: 0 10px;
            }
            .questions-grid {
                grid-template-columns: 1fr;
                gap: 0.5rem;
            }
            .card {
                margin-bottom: 10px;
                padding: 0.8rem;
            }
            .card-text {
                font-size: 14px;
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
                margin: 2cm;
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
            .questions-grid {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 1rem;
            }
            .card {
                break-inside: avoid;
                border: 1px solid #ddd !important;
                margin-bottom: 0.5rem !important;
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

    // Add event listeners for buttons
    const printButton = document.getElementById("printButton");
    const pdfButton = document.getElementById("pdfButton");
    const shareButton = document.getElementById("shareButton");

    if (printButton) {
        printButton.addEventListener("click", function() {
            const printContent = document.querySelector('.main-container').cloneNode(true);
            const actionButtons = printContent.querySelector('.action-buttons');
            if (actionButtons) actionButtons.remove();
            
            const printWindow = window.open('', '', 'height=600,width=800');
            
            printWindow.document.write(`
                <html>
                <head>
                    <title>OkuAnla - English Reading</title>
                    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
                    <style>
                        @page {
                            margin: 2cm;
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
                        .text-content {
                            color: #333;
                            line-height: 1.6;
                            font-size: 12pt;
                            text-align: justify;
                        }
                        .questions-section {
                            margin-top: 2rem;
                            padding-top: 1.5rem;
                            border-top: 2px solid #eee;
                        }
                        .questions-grid {
                            display: grid;
                            grid-template-columns: repeat(2, 1fr);
                            gap: 1rem;
                        }
                        .card {
                            break-inside: avoid;
                            margin-bottom: 1rem;
                            border: 1px solid #ddd;
                            border-radius: 8px;
                            padding: 1rem;
                        }
                        .card-text {
                            margin: 0;
                            font-size: 12pt;
                            color: #444;
                            text-align: left;
                            align-self: flex-start;
                        }
                        @media print {
                            body { padding: 0; }
                            .watermark { position: fixed; }
                            .questions-grid {
                                display: grid;
                                grid-template-columns: repeat(2, 1fr);
                                gap: 1rem;
                            }
                            .card {
                                break-inside: avoid;
                            }
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
    
    if (pdfButton) {
        pdfButton.addEventListener("click", async function() {
            try {
                const printContent = document.querySelector('.main-container').cloneNode(true);
                const actionButtons = printContent.querySelector('.action-buttons');
                if (actionButtons) actionButtons.remove();
                
                const pdfContent = `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <title>OkuAnla - English Reading</title>
                        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
                        <style>
                            @page {
                                margin: 2cm;
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
                            .text-content {
                                color: #333;
                                line-height: 1.6;
                                font-size: 12pt;
                                text-align: justify;
                            }
                            .questions-section {
                                margin-top: 2rem;
                                padding-top: 1.5rem;
                                border-top: 2px solid #eee;
                            }
                            .questions-grid {
                                display: grid;
                                grid-template-columns: repeat(2, 1fr);
                                gap: 1rem;
                            }
                            .card {
                                break-inside: avoid;
                                margin-bottom: 1rem;
                                border: 1px solid #ddd;
                                border-radius: 8px;
                                padding: 1rem;
                            }
                            .card-text {
                                margin: 0;
                                font-size: 12pt;
                                color: #444;
                                text-align: left;
                                align-self: flex-start;
                            }
                            @media print {
                                body { padding: 0; }
                                .watermark { position: fixed; }
                                .questions-grid {
                                    display: grid;
                                    grid-template-columns: repeat(2, 1fr);
                                    gap: 1rem;
                                }
                                .card {
                                    break-inside: avoid;
                                }
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
                `;
                
                const response = await fetch('/api/generate-pdf', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ content: pdfContent })
                });
                
                if (!response.ok) throw new Error('Error generating PDF');
                
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'okuanla-english.pdf';
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            } catch (error) {
                showError('Error generating PDF: ' + error.message);
            }
        });
    }
    
    if (shareButton) {
        shareButton.addEventListener("click", async function() {
            try {
                const printContent = document.querySelector('.main-container').cloneNode(true);
                const actionButtons = printContent.querySelector('.action-buttons');
                if (actionButtons) actionButtons.remove();
                
                const pdfContent = `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <title>OkuAnla - English Reading</title>
                        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
                        <style>
                                @page {
                                margin: 2cm;
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
                            .text-content {
                                color: #333;
                                line-height: 1.6;
                                font-size: 12pt;
                                text-align: justify;
                            }
                            .questions-section {
                                margin-top: 2rem;
                                padding-top: 1.5rem;
                                border-top: 2px solid #eee;
                            }
                            .question {
                                margin-bottom: 1rem;
                                font-size: 12pt;
                                color: #444;
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
                `;
                
                const response = await fetch('/api/generate-pdf', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ content: pdfContent })
                });
                
                if (!response.ok) throw new Error('Error generating PDF');
                
                const blob = await response.blob();
                const file = new File([blob], 'okuanla-english.pdf', { type: 'application/pdf' });

                if (navigator.share && navigator.canShare({ files: [file] })) {
                    try {
                        await navigator.share({
                            files: [file],
                            title: 'OkuAnla - English Reading',
                            text: 'Check out this English reading text from OkuAnla!'
                        });
                    } catch (error) {
                        const url = window.URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = 'okuanla-english.pdf';
                        document.body.appendChild(a);
                        a.click();
                        window.URL.revokeObjectURL(url);
                        document.body.removeChild(a);
                    }
        } else {
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'okuanla-english.pdf';
                    document.body.appendChild(a);
                    a.click();
                    window.URL.revokeObjectURL(url);
                    document.body.removeChild(a);
        }
    } catch (error) {
                showError('Error sharing: ' + error.message);
            }
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
        submitButton.innerHTML = '<i class="fas fa-book me-2"></i>Generate Text';
    }
});
