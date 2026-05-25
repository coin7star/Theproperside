export async function onRequestPost(context) {
    try {
        const { request, env } = context;
        const body = await request.json();
        
        // Membaca array 'messages' dari frontend, jika tidak ada gunakan fallback
        const messages = body.messages || [
            { role: "system", content: "Anda adalah asisten AI yang ramah dan pintar." },
            { role: "user", content: body.text }
        ];

        const modelProvider = body.modelProvider || 'gemini';

        if (modelProvider === 'groq') {
            const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${env.GROQ_API_KEY}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    model: "llama-3.1-8b-instant",
                    messages: messages
                })
            });
            const data = await response.json();
            return new Response(JSON.stringify({ reply: data.choices[0].message.content }), {
                headers: { 'Content-Type': 'application/json' }
            });

        } else {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${env.GEMINI_API_KEY}`;
            
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: messages.map(m => ({
                        role: m.role === 'assistant' ? 'model' : 'user',
                        parts: [{ text: m.content }]
                    }))
                })
            });
            const data = await response.json();
            return new Response(JSON.stringify({ reply: data.candidates[0].content.parts[0].text }), {
                headers: { 'Content-Type': 'application/json' }
            });
        }
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
}
