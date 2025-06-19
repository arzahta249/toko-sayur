import { prisma } from "@/utils/connect";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;

  if (typeof id !== "string") {
    return res.status(400).json({ message: "ID tidak valid." });
  }

  if (req.method === "PUT") {
    try {
      const { status, address, phone, name } = req.body;

      if (!status) {
        return res.status(400).json({ message: "Status wajib diisi." });
      }

      if (!address || !phone) {
        return res.status(400).json({
          message: "Alamat dan telepon wajib diisi sebelum konfirmasi.",
        });
      }

      const updatedOrder = await prisma.order.update({
        where: { id },
        data: {
          status,
          address,
          phone,
          ...(name && { name }),
        },
      });

      return res
        .status(200)
        .json({ message: "Order berhasil diperbarui.", order: updatedOrder });
    } catch (err) {
      console.error(err);
      return res
        .status(500)
        .json({ message: "Terjadi kesalahan saat memperbarui order." });
    }
  }

  if (req.method === "DELETE") {
    try {
      const order = await prisma.order.findUnique({ where: { id } });

      if (!order) {
        return res.status(404).json({ message: "Order tidak ditemukan." });
      }

      await prisma.order.delete({ where: { id } });

      return res.status(200).json({ message: "Order berhasil dihapus." });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Gagal menghapus order." });
    }
  }

  // Method Not Allowed
  res.setHeader("Allow", ["PUT", "DELETE"]);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
