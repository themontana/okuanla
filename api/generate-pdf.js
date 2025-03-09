import PDFDocument from 'pdfkit';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { content } = req.body;

        if (!content) {
            return res.status(400).json({ error: 'Content is required' });
        }

        // Create a new PDF document
        const doc = new PDFDocument({
            size: 'A4',
            margin: 20,
            bufferPages: true
        });

        // Create a buffer to store the PDF
        const chunks = [];
        doc.on('data', chunk => chunks.push(chunk));
        doc.on('end', () => {
            const pdfBuffer = Buffer.concat(chunks);
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', 'attachment; filename=okuanla-content.pdf');
            res.setHeader('Content-Length', pdfBuffer.length);
            res.send(pdfBuffer);
        });

        // Add content to the PDF
        doc.font('Helvetica')
           .fontSize(12);

        // Process HTML content
        const plainText = content.replace(/<[^>]*>/g, '\n')  // Replace HTML tags with newlines
                                .replace(/&nbsp;/g, ' ')      // Replace &nbsp; with spaces
                                .replace(/\n\s*\n/g, '\n\n')  // Remove extra newlines
                                .trim();                      // Trim extra whitespace

        doc.text(plainText, {
            align: 'justify',
            lineGap: 5,
            paragraphGap: 10
        });

        // Finalize the PDF
        doc.end();

    } catch (error) {
        console.error('PDF generation error:', error);
        res.status(500).json({ 
            error: 'PDF oluşturulurken bir hata oluştu',
            details: error.message
        });
    }
} 