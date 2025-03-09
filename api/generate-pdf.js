import puppeteer from 'puppeteer-core';
import chrome from '@sparticuz/chromium';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { content } = req.body;

        if (!content) {
            return res.status(400).json({ error: 'Content is required' });
        }

        // Configure Chrome for Vercel
        chrome.setGraphicsMode = false;
        
        // Launch browser with Vercel-specific configuration
        const browser = await puppeteer.launch({
            args: chrome.args,
            defaultViewport: chrome.defaultViewport,
            executablePath: await chrome.executablePath,
            headless: true,
            ignoreHTTPSErrors: true
        });

        // Create new page
        const page = await browser.newPage();

        // Set content
        await page.setContent(content, {
            waitUntil: ['networkidle0', 'load', 'domcontentloaded']
        });

        // Generate PDF
        const pdf = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: {
                top: '20mm',
                right: '20mm',
                bottom: '20mm',
                left: '20mm'
            }
        });

        // Close browser
        await browser.close();

        // Set response headers
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=okuanla-content.pdf');
        res.setHeader('Content-Length', pdf.length);

        // Send PDF
        res.send(pdf);

    } catch (error) {
        console.error('PDF generation error:', error);
        res.status(500).json({ error: 'PDF oluşturulurken bir hata oluştu' });
    }
} 