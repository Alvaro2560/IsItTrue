import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    try {
      const response = await fetch("http://88.24.81.219:8080/upload", {
        method: "POST",
        body: req.body
      });

      if (!response.ok) {
        return res.status(response.status).json({ error: "Error comunicándose con el servidor remoto" });
      }

      const data = await response.json();
      return res.status(200).json(data);
    } catch (error) {
      console.error("Error al procesar la solicitud:", error);
      return res.status(500).json({ error: "Error procesando la solicitud" });
    }
  } else {
    return res.status(405).json({ error: "Método no permitido" });
  }
}