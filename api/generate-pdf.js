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
        let browser;
        try {
            // Configure Chrome Browser
            const options = {
                args: chrome.args,
                executablePath: await chrome.executablePath(),
                headless: "new",
                ignoreHTTPSErrors: true,
                defaultViewport: {
                    width: 1920,
                    height: 1080,
                },
                protocolTimeout: 30000
            };

            // Launch browser with Vercel-specific configuration
            browser = await puppeteer.launch(options);

            // Create new page
            const page = await browser.newPage();

            // Set content with proper timeout and wait options
            await page.setContent(content, {
                waitUntil: ['networkidle0', 'domcontentloaded'],
                timeout: 30000,
            });

            // Generate PDF with specific settings
            const pdf = await page.pdf({
                format: 'A4',
                printBackground: true,
                margin: {
                    top: '20mm',
                    right: '20mm',
                    bottom: '20mm',
                    left: '20mm'
                },
                preferCSSPageSize: true,
                timeout: 30000,
            });

            // Close browser
            await browser.close();

            // Set response headers
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', 'attachment; filename=okuanla-content.pdf');
            res.setHeader('Content-Length', pdf.length);

            // Send PDF
            return res.send(pdf);

        } catch (error) {
            console.error('Puppeteer error:', error);
            if (browser) {
                await browser.close();
            }
            throw error;
        }

    } catch (error) {
        console.error('PDF generation error:', error);
        return res.status(500).json({ 
            error: 'PDF oluşturulurken bir hata oluştu',
            details: error.message 
        });
    }
} 