// Form dinleyicisi
document.getElementById("mathForm").addEventListener("submit", async function (event) {
    event.preventDefault(); // Sayfanın yenilenmesini önler

    // Kullanıcıdan alınan girdiler
    const mathGrade = document.getElementById("mathGrade").value.trim();
    const difficulty = document.getElementById("difficulty").value.trim();
    const topic = document.getElementById("topic").value.trim();
    const problemCount = document.getElementById("problemCount").value.trim();

    // Eğer kullanıcı herhangi bir alanı boş bırakırsa hata mesajı göster
    if (!mathGrade || !difficulty || !topic || !problemCount) {
        document.getElementById("output").innerHTML = "<p>Lütfen tüm alanları doldurun.</p>";
        return;
    }

    // Sınıf seviyesine göre içerik karmaşıklığını ayarla
    function getDifficultyDescription(grade, level) {
        const descriptions = {
            "1": {
                "kolay": "tek basamaklı sayılarla basit işlemler",
                "orta": "iki basamaklı sayılarla temel işlemler",
                "zor": "iki basamaklı sayıların karışık işlemleri"
            },
            "2": {
                "kolay": "iki basamaklı sayılarla temel işlemler",
                "orta": "iki ve üç basamaklı sayılarla karışık işlemler",
                "zor": "üç basamaklı sayılarla çeşitli problem türleri, yaratıcı düşünme ve mantık yürütme gerektiren işlemler"
            },
            "3": {
                "kolay": "iki ve üç basamaklı sayılarla temel işlemler",
                "orta": "üç basamaklı sayılarla çoklu adım gerektiren işlemler",
                "zor": "üç ve dört basamaklı sayılarla karmaşık problem çözümü, yaratıcı düşünme ve mantık yürütme gerektiren işlemler"
            },
            "4": {
                "kolay": "üç basamaklı sayılarla temel işlemler",
                "orta": "üç ve dört basamaklı sayılarla çoklu adım gerektiren işlemler",
                "zor": "dört basamaklı sayılarla karmaşık problem çözümü, yaratıcı düşünme ve mantık yürütme gerektiren işlemler"
            }
        };
        
        return descriptions[grade][level] || "temel matematik problemleri";
    }

    // Kullanıcı girdilerine göre prompt oluştur
    const prompt = `
        Lütfen ${mathGrade}. sınıf öğrencileri için "${topic}" konusunda ${difficulty} seviyede ${problemCount} tane matematik problemi oluştur.
        
        Problemler şu şekilde olmalı:
        - ${mathGrade}. sınıf seviyesine uygun ve ${getDifficultyDescription(mathGrade, difficulty)} içermeli.
        - Her problem net ve anlaşılır olmalı.
        - Problemler günlük hayattan örnekler içerebilir.
        - İçerik Türkçe olmalı ve dil yanlışları içermemeli.
        - Çözümleri EKLEME, sadece problemleri yaz.
        
        Format şu şekilde olmalı:
        - Başlık: "${mathGrade}. Sınıf ${topic} Problemleri" olmalı (zorluk seviyesini başlıkta belirtme)
        - "##" veya başka format işaretleyicilerini kullanma, sadece düz metin olarak yaz
        - Her problem numaralandırılmış olmalı (1, 2, 3...)
        - Her problem arasında öğrencilerin kalem ile işlem yapabilmesi için en az 3 satır boşluk bırak.
        - Başlık ve 1. soru arasında boşluk olmasın.
    `;

    // Kullanıcıya problem oluşturuluyor bilgisini göster
    document.getElementById("output").innerHTML = "<p>Matematik problemleri oluşturuluyor...</p>";

    try {
        // Metni oluştur ve kullanıcıya göster
        const response = await fetch('/api/generate-text', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ prompt })
        });

        if (!response.ok) {
            throw new Error(`HTTP hatası! Durum: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.generatedText) {
            // Markdown işaretlerini (##, **, vb.) temizle
            let generatedText = data.generatedText
                .replace(/##\s+/g, '')   // ## işaretlerini kaldır
                .replace(/\*\*/g, '');   // ** işaretlerini kaldır

            // Problem arasındaki boşlukları artır ve formatı düzenle
            let formattedText = '';
            const lines = generatedText.split('\n');
            let isTitle = true; // İlk satırın başlık olduğunu varsayıyoruz
            let firstProblem = true; // İlk problemi takip etmek için

            // Sütun düzeni için
            let problemsInColumn = '';
            
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i].trim();
                
                if (line === '') continue; // Boş satırları atla
                
                if (isTitle) {
                    // Başlık için özel stil - tüm margin'leri 0 olarak ayarla
                    formattedText += `<h1 style="font-size: 32px; font-weight: bold; text-align: center; margin: 0; padding: 0;">${line}</h1>`;
                    isTitle = false;
                } else if (/^\d+\./.test(line)) {
                    // Problem numarası tespit edildi
                    if (firstProblem) {
                        // İlk problem için özel margin ayarı - başlığa yapışık olması için
                        problemsInColumn += `<div style="border: 1px solid #ccc; padding: 10px; margin: 10px;">${line}</div>`;
                        firstProblem = false;
                    } else {
                        // Diğer problemler arasına 75px boşluk ekle
                        problemsInColumn += `<div style="border: 1px solid #ccc; padding: 10px; margin: 10px;">${line}</div>`;
                    }
                } else {
                    // Normal metin
                    problemsInColumn += `<p style="text-indent: 20px; margin-bottom: 15px; line-height: 1.6; font-family: Arial, sans-serif;">${line}</p>`;
                }
            }

            // Sayfa düzenini iki sütun haline getir
            const pageContent = `
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; padding: 10px;">
                    <div style="width: 100%; font-family: Arial, sans-serif; font-size: 16px; line-height: 1.6;">
                        ${problemsInColumn}
                    </div>
                </div>
            `;
            
            // İçeriği sayfaya ekle
            document.getElementById("output").innerHTML = pageContent;

        } else {
            document.getElementById("output").innerHTML = "<p>Matematik problemleri oluşturulamadı: API yanıtı geçersiz.</p>";
        }
    } catch (error) {
        console.error("Hata:", error);
        document.getElementById("output").innerHTML = `<p>Matematik problemleri oluşturulamadı: ${error.message}</p>`;
    }
});
