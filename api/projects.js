import { Vercel } from '@vercel/sdk';

export default async function handler(req, res) {
  // Mengambil token dari Environment Variable
  const bearerToken = process.env.VERCEL_TOKEN;

  if (!bearerToken) {
    return res.status(500).json({ error: 'VERCEL_TOKEN belum diatur di Environment Variables' });
  }

  try {
    const vercel = new Vercel({ bearerToken });
    
    // Memanggil API Vercel untuk mengambil daftar project
    const result = await vercel.projects.getProjects({ limit: '5' });
    const projects = Array.isArray(result) ? result : result.projects;

    return res.status(200).json({ projects });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}