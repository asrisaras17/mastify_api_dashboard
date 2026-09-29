export default async function handler(req, res) {
  // Set header response JSON
  res.setHeader('Content-Type', 'application/json');

  // Hanya izinkan method GET
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: 'Method Not Allowed. Hanya request GET yang diizinkan.'
    });
  }

  // 1. Mengambil token dari Environment Variable
  const token = process.env.VERCEL_TOKEN;

  if (!token) {
    return res.status(500).json({
      success: false,
      error: 'Environment variable VERCEL_TOKEN belum diatur di Vercel Dashboard.'
    });
  }

  try {
    // 2. Fetch ke Vercel REST API v10
    const response = await fetch('https://api.vercel.com/v10/projects?limit=10', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    // 3. Error Handling untuk 401/403 & error status lainnya
    if (response.status === 401 || response.status === 403) {
      return res.status(response.status).json({
        success: false,
        error: 'Akses ditolak: VERCEL_TOKEN tidak valid, kedaluwarsa, atau tidak memiliki izin akses.'
      });
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return res.status(response.status).json({
        success: false,
        error: errorData.error?.message || `Vercel API merespons dengan HTTP status ${response.status}`,
        details: errorData
      });
    }

    const data = await response.json();

    // 4. Kembalikan data projects dalam format JSON
    return res.status(200).json({
      success: true,
      projects: data.projects || [],
      pagination: data.pagination || null
    });
  } catch (error) {
    console.error('Vercel API Handler Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal Server Error: ' + error.message
    });
  }
}