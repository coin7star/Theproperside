export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Metode tidak diizinkan. Gunakan POST.' });
    }

    const { text } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        return res.status(500).json({ 
            error: 'API Key tidak ditemukan. Pastikan GEMINI_API_KEY sudah disetting di Vercel.' 
        });
    }

    // PERBAIKAN: Menggunakan model gemini-3.1-flash-lite sesuai permintaan
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${apiKey}`;
    
    const payload = {
        contents: [{
            parts: [{ text: text }]
        }],
        systemInstruction: {
            parts: [{ text: "Anda adalah asisten AI yang ramah, pintar, dan sangat membantu bernama Gemini. Gunakan bahasa Indonesia yang baik dan mudah dipahami." }]
        }
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        // Jika Google menolak (misal API key salah/limit habis)
        if (!response.ok) {
            console.error('Error dari Google:', data);
            // Lempar pesan error asli dari Google ke layar agar kita tahu penyebabnya
            return res.status(response.status).json({ 
                error: `Google API Error: ${data.error?.message || 'Terjadi kesalahan tidak dikenal'}` 
            });
        }
        
        res.status(200).json(data);

    } catch (error) {
        console.error('Network Error:', error);
        res.status(500).json({ error: 'Gagal terhubung ke jaringan server AI: ' + error.message });
    }
}
