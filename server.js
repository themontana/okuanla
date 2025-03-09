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
        const browser = await puppeteer.launch({ 
            headless: 'new',
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--font-render-hinting=none'
            ],
            executablePath: process.env.CHROME_PATH || undefined
        });
        const page = await browser.newPage();
        
        // Set content with proper encoding and wait for all resources
        await page.setContent(content, {
            waitUntil: ['networkidle0', 'load', 'domcontentloaded']
        });

        // Ensure fonts are loaded
        await page.addStyleTag({
            content: `
                @import url('https://fonts.googleapis.com/css2?family=Segoe+UI:wght@400;500;600&display=swap');
                * {
                    font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif !important;
                    -webkit-font-smoothing: antialiased;
                    -moz-osx-font-smoothing: grayscale;
                }
            `
        });

        // Set viewport to A4 size with higher DPI
        await page.setViewport({
            width: 794,  // A4 width at 96 DPI
            height: 1123, // A4 height at 96 DPI
            deviceScaleFactor: 2
        });

        // Ensure proper encoding and font loading
        await page.evaluate(() => {
            const meta = document.createElement('meta');
            meta.charset = 'UTF-8';
            document.head.prepend(meta);
            
            // Force font loading
            document.fonts.ready.then(() => {
                document.body.style.visibility = 'visible';
            });
        });

        // Wait for fonts and images to load
        await page.waitForTimeout(1500);
        
        // Generate PDF with specific options
        const pdf = await page.pdf({
            format: 'A4',
            margin: { top: '1.5cm', right: '1.5cm', bottom: '1.5cm', left: '1.5cm' },
            printBackground: true,
            preferCSSPageSize: true,
            displayHeaderFooter: false,
            scale: 1,
            landscape: false
        });
        
        await browser.close();
        
        // Send PDF with proper headers
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