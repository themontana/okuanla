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
            chrome.setGraphicsMode = false;
            const executablePath = await chrome.executablePath;

            // Launch browser with Vercel-specific configuration
            browser = await puppeteer.launch({
                args: [
                    ...chrome.args,
                    '--autoplay-policy=user-gesture-required',
                    '--disable-background-networking',
                    '--disable-background-timer-throttling',
                    '--disable-backgrounding-occluded-windows',
                    '--disable-breakpad',
                    '--disable-client-side-phishing-detection',
                    '--disable-component-update',
                    '--disable-default-apps',
                    '--disable-dev-shm-usage',
                    '--disable-domain-reliability',
                    '--disable-extensions',
                    '--disable-features=AudioServiceOutOfProcess',
                    '--disable-hang-monitor',
                    '--disable-ipc-flooding-protection',
                    '--disable-notifications',
                    '--disable-offer-store-unmasked-wallet-cards',
                    '--disable-popup-blocking',
                    '--disable-print-preview',
                    '--disable-prompt-on-repost',
                    '--disable-renderer-backgrounding',
                    '--disable-setuid-sandbox',
                    '--disable-speech-api',
                    '--disable-sync',
                    '--hide-scrollbars',
                    '--ignore-gpu-blacklist',
                    '--metrics-recording-only',
                    '--mute-audio',
                    '--no-default-browser-check',
                    '--no-first-run',
                    '--no-pings',
                    '--no-sandbox',
                    '--no-zygote',
                    '--password-store=basic',
                    '--use-gl=swiftshader',
                    '--use-mock-keychain',
                ],
                defaultViewport: {
                    width: 1920,
                    height: 1080,
                },
                executablePath,
                headless: true,
                ignoreHTTPSErrors: true,
            });

            // Create new page
            const page = await browser.newPage();

            // Set content with proper timeout and wait options
            await page.setContent(content, {
                waitUntil: ['networkidle0', 'load', 'domcontentloaded'],
                timeout: 30000,
            });

            // Wait for any remaining network requests
            await page.waitForTimeout(1000);

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