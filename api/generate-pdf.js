import { chromium } from '@playwright/browser';

export const config = {
  runtime: 'edge'
};

export default async function handler(req) {
    try {
        const data = await req.json();
        const { content } = data;

        if (!content) {
            return new Response(JSON.stringify({ error: 'Content is required' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Launch browser
        const browser = await chromium.launch();
        const page = await browser.newPage();
        
        // Set content and wait for it to load
        await page.setContent(content, { waitUntil: 'networkidle' });

        // Generate PDF
        const pdfBuffer = await page.pdf({
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

        return new Response(pdfBuffer, {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': 'attachment; filename=okuanla-content.pdf'
            }
        });

    } catch (error) {
        console.error('PDF generation error:', error);
        return new Response(JSON.stringify({ 
            error: 'PDF oluşturulurken bir hata oluştu',
            details: error.message
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
} 