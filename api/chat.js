export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Metode tidak diizinkan. Gunakan POST.' });
    }

    const { text, modelProvider } = req.body;
    const systemPrompt = "Anda adalah asisten AI yang ramah, pintar, dan sangat membantu. Gunakan bahasa Indonesia yang baik dan mudah dipahami.";

    try {
        if (modelProvider === 'groq') {
            // ==========================================
            // LOGIKA UNTUK GROQ API (LLAMA 3.1)
            // ==========================================
            const groqApiKey = process.env.GROQ_API_KEY; 
            
            if (!groqApiKey) {
                return res.status(500).json({ error: 'GROQ_API_KEY belum disetting di Vercel.' });
            }

            const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${groqApiKey}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    // PERBAIKAN: Menggunakan model Llama terbaru dari Groq yang aktif
                    model: "llama-3.1-8b-instant", 
                    messages: [
                        { role: "system", content: systemPrompt },
                        { role: "user", content: text }
                    ]
                })
            });

            const data = await response.json();
            if (!response.ok) throw new Error(`Groq API Error: ${data.error?.message || 'Unknown Error'}`);
            
            return res.status(200).json({ reply: data.choices[0].message.content });

        } else {
            // ==========================================
            // LOGIKA UNTUK GEMINI API
            // ==========================================
            const geminiApiKey = process.env.GEMINI_API_KEY;

            if (!geminiApiKey) {
                return res.status(500).json({ error: 'GEMINI_API_KEY belum disetting di Vercel.' });
            }

            const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${geminiApiKey}`;
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: text }] }],
                    systemInstruction: { parts: [{ text: systemPrompt }] }
                })
            });

            const data = await response.json();
            if (!response.ok) throw new Error(`Google API Error: ${data.error?.message || 'Unknown Error'}`);
            
            return res.status(200).json({ reply: data.candidates[0].content.parts[0].text });
        }

    } catch (error) {
        console.error('API Error:', error);
        return res.status(500).json({ error: `Gagal terhubung ke AI: ${error.message}` });
    }
}
