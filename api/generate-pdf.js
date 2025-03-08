const puppeteer = require('puppeteer');

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { content } = req.body;

        if (!content) {
            return res.status(400).json({ error: 'Content is required' });
        }

        // Launch browser
        const browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        // Create new page
        const page = await browser.newPage();

        // Set content
        await page.setContent(`
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>OkuAnla - Metin</title>
                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
                <style>
                    body {
                        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                        padding: 20px;
                        line-height: 1.6;
                    }
                    .action-buttons {
                        display: none;
                    }
                    .card {
                        margin-bottom: 15px;
                        border: 1px solid #ddd;
                    }
                    .answer-box {
                        border: 1px solid #ddd;
                        border-radius: 5px;
                        min-height: 60px;
                        padding: 8px;
                    }
                    @media print {
                        .card {
                            break-inside: avoid;
                        }
                        .answer-box {
                            border: 1px solid #000;
                        }
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
        res.setHeader('Content-Disposition', 'attachment; filename=okuanla-metin.pdf');
        res.setHeader('Content-Length', pdf.length);

        // Send PDF
        res.send(pdf);

    } catch (error) {
        console.error('PDF generation error:', error);
        res.status(500).json({ error: 'PDF oluşturulurken bir hata oluştu' });
    }
} 