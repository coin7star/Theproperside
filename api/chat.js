// File ini akan berjalan di server Vercel, aman dari jangkauan pengguna biasa.
// Environment Variable GEMINI_API_KEY disembunyikan di sini.

export default async function handler(req, res) {
    // Pastikan hanya menerima request POST dari frontend
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Metode tidak diizinkan. Gunakan POST.' });
    }

    const { text } = req.body;
    
    // Mengambil API Key dari Environment Variables Vercel
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        return res.status(500).json({ 
            error: 'API Key tidak ditemukan. Pastikan GEMINI_API_KEY sudah disetting di Vercel Environment Variables.' 
        });
    }

    // Endpoint API Gemini
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;
    
    // Payload yang akan dikirim ke Google
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

        if (!response.ok) {
            throw new Error(`Google API Error: ${response.status}`);
        }

        const data = await response.json();
        
        // Kembalikan data dari Google langsung ke Frontend kita
        res.status(200).json(data);

    } catch (error) {
        console.error('Error saat menghubungi Gemini:', error);
        res.status(500).json({ error: 'Gagal menghubungi server AI. Coba lagi nanti.' });
    }
}
