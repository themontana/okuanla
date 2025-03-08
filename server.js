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
const UNSPLASH_ACCESS_KEY = 'V6tsrrsRGm_OwmhbPc7mOTsQzasxygTx6PqRn3z6tfk';

// Middleware
app.use(express.json());
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Accept', 'Authorization'],
    credentials: true
}));

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
        
        // Launch Puppeteer
        const browser = await puppeteer.launch({ headless: 'new' });
        const page = await browser.newPage();
        
        // Set content with proper styling
        await page.setContent(`
            <!DOCTYPE html>
            <html>
            <head>
                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
                <style>
                    body { padding: 20px; }
                    @media print {
                        .page-break { page-break-before: always; }
                    }
                </style>
            </head>
            <body>
                ${content}
            </body>
            </html>
        `);
        
        // Generate PDF
        const pdf = await page.pdf({
            format: 'A4',
            margin: { top: '20px', right: '20px', bottom: '20px', left: '20px' }
        });
        
        await browser.close();
        
        // Send PDF
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=okuanla-content.pdf');
        res.send(pdf);
    } catch (error) {
        console.error('Error in PDF generation:', error);
        res.status(500).json({ error: error.message });
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