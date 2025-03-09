import 'dotenv/config';
import express from 'express';
import path from 'path';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { GoogleGenerativeAI } from '@google/generative-ai';
import puppeteer from 'puppeteer';
import fetch from 'node-fetch';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

// Unsplash API configuration
const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;

// Middleware
app.use(express.json());
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Accept', 'Authorization'],
    credentials: true
}));

// Add OPTIONS handler for preflight requests
app.options('/api/generate-pdf', cors());

// Add basic route for testing
app.get('/', (req, res) => {
    console.log('Root route accessed');
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Add route for math page
app.get('/math', (req, res) => {
    console.log('Math page accessed');
    res.sendFile(path.join(__dirname, 'math.html'));
});

// Add route for english page
app.get('/english', (req, res) => {
    console.log('English page accessed');
    res.sendFile(path.join(__dirname, 'english.html'));
});

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // Limit each IP to 100 requests per windowMs
});

// Apply rate limiting to API routes
app.use('/api/', limiter);

// Serve static files
app.use(express.static(path.join(__dirname)));

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ error: err.message });
});

// API endpoints
app.post('/api/generate-text', async (req, res) => {
    try {
        console.log('Text generation requested');
        console.log('Request body:', req.body);
        const { prompt } = req.body;
        
        if (!prompt) {
            console.error('No prompt provided');
            return res.status(400).json({ error: 'Prompt is required' });
        }

        console.log('Generating content with prompt:', prompt);
        
        // Make the API call using fetch with the new endpoint
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: prompt }]
                }]
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('API Response:', data);

        if (data.error) {
            throw new Error(data.error.message || 'API error occurred');
        }

        // Extract the generated text from the response
        const generatedText = data.candidates[0].content.parts[0].text;
        console.log('Generated text length:', generatedText.length);

        res.json({ generatedText });

    } catch (error) {
        console.error('Error in text generation:', error);
        console.error('Error stack:', error.stack);
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/generate-math', async (req, res) => {
    try {
        console.log('Math generation requested');
        const { prompt } = req.body;
        
        // Initialize Gemini AI
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        res.json({ generatedText: text });
    } catch (error) {
        console.error('Error in math generation:', error);
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/generate-pdf', async (req, res) => {
    try {
        console.log('PDF generation requested');
        const { content } = req.body;
        
        if (!content) {
            return res.status(400).json({ error: 'Content is required for PDF generation' });
        }

        // Launch Puppeteer
        const browser = await puppeteer.launch({ 
            headless: 'new',
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-gpu'
            ],
            executablePath: process.env.CHROME_PATH || undefined
        });
        
        try {
            const page = await browser.newPage();
            
            // Set content with proper encoding
            await page.setContent(content, {
                waitUntil: 'networkidle0'
            });

            // Set viewport to A4 size
            await page.setViewport({
                width: 794, // A4 width in pixels at 96 DPI
                height: 1123, // A4 height in pixels at 96 DPI
                deviceScaleFactor: 2
            });

            // Ensure proper encoding and add print styles
            await page.evaluate(() => {
                const meta = document.createElement('meta');
                meta.charset = 'UTF-8';
                document.head.prepend(meta);
                
                // Add print-specific styles
                const style = document.createElement('style');
                style.textContent = `
                    @media print {
                        @page {
                            size: A4;
                            margin: 1.5cm;
                        }
                        body { 
                            padding: 0;
                            font-size: 11pt;
                            -webkit-print-color-adjust: exact;
                            print-color-adjust: exact;
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
                        .col-md-6, .col-6 {
                            width: 100% !important;
                            max-width: 100% !important;
                            padding: 0 !important;
                            page-break-inside: avoid !important;
                            break-inside: avoid !important;
                        }
                        .card, .problem-card {
                            border: 1px solid #ddd !important;
                            margin-bottom: 0.5rem !important;
                            page-break-inside: avoid !important;
                            break-inside: avoid !important;
                        }
                        .card-body {
                            padding: 0.8rem 1rem !important;
                        }
                        .card-text, .problem-text {
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
                document.head.appendChild(style);
            });

            // Wait for fonts and styles to load
            await page.waitForTimeout(1000);
            
            // Generate PDF with specific options matching print settings
            const pdf = await page.pdf({
                format: 'A4',
                margin: { top: '1.5cm', right: '1.5cm', bottom: '1.5cm', left: '1.5cm' },
                printBackground: true,
                preferCSSPageSize: true,
                displayHeaderFooter: false
            });
            
            // Send PDF with proper headers
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', 'attachment; filename=okuanla-content.pdf');
            res.send(pdf);
        } finally {
            await browser.close();
        }
    } catch (error) {
        console.error('Error in PDF generation:', error);
        res.status(500).json({ error: error.message || 'PDF generation failed' });
    }
});

// Endpoint to fetch relevant images from Unsplash
app.post('/api/get-image', async (req, res) => {
    try {
        const { query, filters = [] } = req.body;
        
        // Translate query to English for better results
        const translationResponse = await fetch('https://translate.googleapis.com/translate_a/single?client=gtx&sl=tr&tl=en&dt=t&q=' + encodeURIComponent(query));
        const translationData = await translationResponse.json();
        const englishQuery = translationData[0][0][0];

        // Add child-friendly keywords to the search query
        const searchQuery = `${englishQuery} ${filters.join(' ')} children illustration cartoon`;

        const unsplashResponse = await fetch(
            `https://api.unsplash.com/search/photos?query=${encodeURIComponent(searchQuery)}&per_page=5&content_filter=high`,
            {
                headers: {
                    'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}`
                }
            }
        );

        if (!unsplashResponse.ok) {
            throw new Error('Unsplash API request failed');
        }

        const data = await unsplashResponse.json();
        
        if (data.results && data.results.length > 0) {
            // Try to find the most child-friendly image from the results
            const image = data.results.find(img => 
                img.tags?.some(tag => 
                    ['illustration', 'cartoon', 'children', 'drawing', 'cute']
                    .includes(tag.title?.toLowerCase())
                )
            ) || data.results[0];

            res.json({
                imageUrl: image.urls.regular,
                photographer: image.user.name
            });
        } else {
            res.status(404).json({ error: 'No image found' });
        }
    } catch (error) {
        console.error('Error fetching image:', error);
        res.status(500).json({ error: 'Failed to fetch image' });
    }
});

// Start server with error handling
const server = app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
    console.log('Current directory:', __dirname);
    console.log('Environment:', process.env.NODE_ENV);
}).on('error', (err) => {
    console.error('Server error:', err);
}); 