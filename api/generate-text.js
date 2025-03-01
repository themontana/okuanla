// api/generateText.js

export default async function handler(req, res) {
    const apiKey = process.env.GEMINI_API_KEY; // Gizli anahtar Vercel environment variables'dan alınıyor
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    try {
        const response = await fetch(apiUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                inputs: req.body.prompt,  // Kullanıcıdan gelen prompt
                parameters: {
                    max_new_tokens: 500,  // Çıktı uzunluğu
                    temperature: 0.7,     // Yaratıcılık seviyesi
                    return_full_text: false  // Sadece metin kısmını döndür
                }
            })
        });

        if (!response.ok) {
            throw new Error(`API hatası: ${response.status}`);
        }

        const data = await response.json();
        console.log("API Yanıtı:", data); // Yanıtı kontrol et

        if (data && Array.isArray(data) && data.length > 0 && data[0].generated_text) {
            res.status(200).json({ generatedText: data[0].generated_text }); // Kullanıcıya döndürülecek metin
        } else {
            res.status(500).json({ error: "Metin oluşturulamadı: Yanıt boş veya hatalı." });
        }
    } catch (error) {
        console.error("Hata:", error);
        res.status(500).json({ error: `Metin oluşturulamadı: ${error.message}` });
    }
}
