import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium-min';

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
        try {
            console.log('Setting up Chromium...');
            
            const options = {
                args: [
                    ...chromium.args,
                    '--no-sandbox',
                    '--disable-setuid-sandbox'
                ],
                executablePath: await chromium.executablePath(),
                headless: true,
                ignoreHTTPSErrors: true,
            };

            console.log('Launching browser with options:', JSON.stringify({
                ...options,
                executablePath: 'path-exists: ' + (await chromium.executablePath() ? 'yes' : 'no')
            }, null, 2));

            browser = await puppeteer.launch(options);
            console.log('Browser launched successfully');

            console.log('Creating new page...');
            const page = await browser.newPage();
            console.log('Page created successfully');

            console.log('Setting viewport...');
            await page.setViewport({
                width: 800,
                height: 600,
                deviceScaleFactor: 1,
            });

            console.log('Setting content...');
            await page.setContent(content, {
                waitUntil: 'domcontentloaded',
                timeout: 10000,
            });
            console.log('Content set successfully');

            console.log('Generating PDF...');
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
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', 'attachment; filename=okuanla-content.pdf');
            res.setHeader('Content-Length', pdf.length);

            console.log('Sending PDF...');
            return res.send(pdf);

        } catch (error) {
            console.error('Puppeteer error details:', {
                message: error.message,
                stack: error.stack,
                name: error.name,
                executablePathExists: !!(await chromium.executablePath()),
                args: chromium.args
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