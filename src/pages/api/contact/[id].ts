import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/utils/auth";
import { prisma } from "@/lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);
  const { id } = req.query;

  if (!session) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (typeof id !== "string") {
    return res.status(400).json({ error: "Invalid ID" });
  }

  try {
    if (req.method === "GET") {
      const message = await prisma.contactMessage.findUnique({
        where: { id },
        select: {
          id: true,
          name: true,
          email: true,
          subject: true,
          message: true,
          reply: true,
          createdAt: true,
          replyAt: true,
        },
      });

      if (!message) {
        return res.status(404).json({ error: "Pesan tidak ditemukan" });
      }

      if (!session.user.isAdmin && session.user.email !== message.email) {
        return res.status(403).json({ error: "Forbidden" });
      }

      return res.status(200).json(message);
    }

    if (req.method === "PUT") {
      if (!session.user.isAdmin) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const { reply } = req.body;

      if (!reply || typeof reply !== "string") {
        return res.status(400).json({ error: "Balasan tidak valid" });
      }

      const updated = await prisma.contactMessage.update({
        where: { id },
        data: {
          reply,
          replyAt: new Date(),
        },
      });

      return res.status(200).json(updated);
    }

    if (req.method === "DELETE") {
      if (!session.user.isAdmin) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      await prisma.contactMessage.delete({ where: { id } });

      return res.status(204).end(); // No Content
    }

    // Metode selain GET, PUT, DELETE
    res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (error) {
    console.error("API contact detail error:", error);
    return res.status(500).json({ error: "Gagal memproses permintaan" });
  }
}
