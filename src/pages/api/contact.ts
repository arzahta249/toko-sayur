import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/utils/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const session = await getServerSession(req, res, authOptions);

    if (req.method === "GET") {
      const email = req.query.email as string | undefined;

      if (email) {
        if (!session || session.user?.email !== email) {
          return res.status(401).json({ error: "Unauthorized" });
        }

        const messages = await prisma.contactMessage.findMany({
          where: { email },
          orderBy: { createdAt: "desc" },
        });

        return res.status(200).json(messages);
      }

      // Admin access
      if (!session || !session.user?.isAdmin) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const messages = await prisma.contactMessage.findMany({
        orderBy: { createdAt: "desc" },
      });

      return res.status(200).json(messages);
    }

    if (req.method === "POST") {
      const { name, email, subject, message } = req.body;

      if (!name || !email || !subject || !message) {
        return res.status(400).json({ error: "Semua field wajib diisi" });
      }

      const contact = await prisma.contactMessage.create({
        data: {
          name,
          email,
          subject,
          message,
          createdAt: new Date(),
        },
      });

      return res.status(201).json({ message: "Pesan berhasil dikirim", contact });
    }

    return res.status(405).json({ error: "Metode tidak diizinkan" });
  } catch (error) {
    console.error("Gagal memproses pesan:", error);
    return res.status(500).json({ error: "Terjadi kesalahan server" });
  }
}
