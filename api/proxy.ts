import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    // Crear un objeto de headers a partir de la solicitud entrante
    const headers = new Headers();
    
    // Pasamos los headers entrantes de la solicitud de manera correcta
    for (const [key, value] of Object.entries(req.headers)) {
      headers.append(key, value as string);
    }

    const response = await fetch('http://88.24.81.219:8080/upload', {
      method: 'POST',
      body: req.body,
      headers: headers,  // Usamos la instancia de Headers
    });

    if (!response.ok) {
      throw new Error('Error al procesar la imagen');
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}