// api/generate-text.js

export default async function handler(req, res) {
    const apiKey = process.env.GEMINI_API_KEY; // Gets secret key from Vercel environment variables
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    try {
        const response = await fetch(apiUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: req.body.prompt
                    }]
                }]
            })
        });

        if (!response.ok) {
            throw new Error(`API hatası: ${response.status}`);
        }

        const data = await response.json();
        console.log("API Yanıtı:", data); // Check the response

        // Extract the text from the Gemini API response format
        if (data && data.candidates && data.candidates.length > 0 && 
            data.candidates[0].content && data.candidates[0].content.parts && 
            data.candidates[0].content.parts.length > 0) {
            
            const generatedText = data.candidates[0].content.parts[0].text;
            
            if (generatedText) {
                res.status(200).json({ generatedText }); // Return generated text to client
                return;
            }
        }
        
        res.status(500).json({ error: "Metin oluşturulamadı: Yanıt boş veya hatalı." });
    } catch (error) {
        console.error("Hata:", error);
        res.status(500).json({ error: `Metin oluşturulamadı: ${error.message}` });
    }
}
