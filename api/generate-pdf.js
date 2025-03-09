import puppeteer from 'puppeteer-core';
import chrome from '@sparticuz/chromium';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    let browser = null;
    try {
        console.log('Starting PDF generation process...');
        const { content } = req.body;

        if (!content) {
            return res.status(400).json({ error: 'Content is required' });
        }

        console.log('Configuring Chrome...');
        // Configure Chrome for Vercel
        try {
            // Configure Chrome Browser
            chrome.setGraphicsMode = false;
            console.log('Graphics mode disabled');

            const options = {
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-gpu',
                    '--single-process',
                ],
                executablePath: process.env.CHROME_BIN || await chrome.executablePath(),
                headless: "new",
                ignoreHTTPSErrors: true,
            };

            console.log('Launching browser...');
            // Launch browser with Vercel-specific configuration
            browser = await puppeteer.launch(options);
            console.log('Browser launched successfully');

            console.log('Creating new page...');
            // Create new page
            const page = await browser.newPage();
            console.log('Page created successfully');

            console.log('Setting viewport...');
            await page.setViewport({
                width: 1920,
                height: 1080,
                deviceScaleFactor: 1,
            });

            console.log('Setting content...');
            // Set content with proper timeout and wait options
            await page.setContent(content, {
                waitUntil: 'networkidle0',
                timeout: 10000,
            });
            console.log('Content set successfully');

            console.log('Generating PDF...');
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
            });
            console.log('PDF generated successfully');

            if (browser) {
                console.log('Closing browser...');
                await browser.close();
                console.log('Browser closed successfully');
            }

            console.log('Setting response headers...');
            // Set response headers
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', 'attachment; filename=okuanla-content.pdf');
            res.setHeader('Content-Length', pdf.length);

            console.log('Sending PDF...');
            // Send PDF
            return res.send(pdf);

        } catch (error) {
            console.error('Puppeteer error details:', {
                message: error.message,
                stack: error.stack,
                name: error.name
            });
            
            if (browser) {
                try {
                    await browser.close();
                    console.log('Browser closed after error');
                } catch (closeError) {
                    console.error('Error closing browser:', closeError);
                }
            }
            throw error;
        }

    } catch (error) {
        console.error('PDF generation error:', {
            message: error.message,
            stack: error.stack,
            name: error.name
        });
        
        return res.status(500).json({ 
            error: 'PDF oluşturulurken bir hata oluştu',
            details: error.message,
            name: error.name
        });
    }
} 