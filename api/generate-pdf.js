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

        // Create a new offscreen document
        const doc = new Document();
        doc.write(content);
        doc.close();

        // Use the native print to PDF functionality
        const pdf = await doc.defaultView.print({
            printBackground: true,
            preferCSSPageSize: true,
            margin: {
                top: '20mm',
                right: '20mm',
                bottom: '20mm',
                left: '20mm'
            }
        });

        return new Response(pdf, {
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