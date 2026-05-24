export default function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Gunakan metode GET' });
    }

    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
        return res.status(500).json({ error: 'Supabase ENV belum diatur di Vercel.' });
    }

    // Hanya kembalikan variabel lingkungan yang aman untuk sisi klien (browser)
    res.status(200).json({ 
        url: supabaseUrl, 
        anonKey: supabaseAnonKey 
    });
}
