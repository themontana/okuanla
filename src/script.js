import { HfInference } from "@huggingface/inference";

const client = new HfInference("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");

document.getElementById("textForm").addEventListener("submit", async function (event) {
    event.preventDefault(); // Sayfanın yenilenmesini önler

    // Formdan değerleri al
    const grade = document.getElementById("grade").value;
    const theme = document.getElementById("theme").value;
    const keywords = document.getElementById("keywords").value;
    const questionCount = document.getElementById("questionCount").value;

    // Prompt oluştur
    const prompt = `İlkokul ${grade}. sınıf seviyesinde, "${theme}" temalı, içinde "${keywords}" kelimeleri geçen bir okuma metni oluştur. Ayrıca ${questionCount} tane okuduğunu anlama sorusu ekle.`;

    document.getElementById("output").innerHTML = "<p>Metin oluşturuluyor...</p>";

    try {
        // Hugging Face API'ye istek gönder
        const chatCompletion = await client.chatCompletion({
            model: "mistralai/Mistral-7B-Instruct-v0.3",
            messages: [
                {
                    role: "user",
                    content: prompt
                }
            ],
            provider: "hf-inference",
            max_tokens: 500,
        });

        console.log(chatCompletion); // API yanıtını kontrol et

        // Yanıtı ekrana yazdır
        if (chatCompletion.choices && chatCompletion.choices.length > 0) {
            document.getElementById("output").innerHTML = `<p>${chatCompletion.choices[0].message.content}</p>`;
        } else {
            document.getElementById("output").innerHTML = "<p>Metin oluşturulamadı.</p>";
        }

    } catch (error) {
        document.getElementById("output").innerHTML = `<p>Metin oluşturulamadı: ${error.message}</p>`;
        console.error("API hatası:", error);
    }
});
