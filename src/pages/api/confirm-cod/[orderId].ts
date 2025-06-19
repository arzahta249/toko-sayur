import { prisma } from "@/utils/connect";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "PUT") {
    return res.status(405).json({ message: "Metode tidak diizinkan." });
  }

  const { orderId } = req.query;

  if (typeof orderId !== "string") {
    return res.status(400).json({ message: "ID order tidak valid." });
  }

  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: { address: true, phone: true, status: true },
    });

    if (!order) {
      return res
        .status(404)
        .json({ message: "Order tidak ditemukan." });
    }

    if (!order.address || !order.phone) {
      return res.status(400).json({
        message: "Alamat dan nomor telepon harus diisi sebelum konfirmasi.",
      });
    }

    if (order.status === "Dalam proses.." || order.status === "Selesai") {
      return res.status(200).json({
        message: "Order sudah dikonfirmasi sebelumnya.",
      });
    }

    await prisma.order.update({
      where: { id: orderId },
      data: { status: "Dalam proses.." },
    });

    return res.status(200).json({ message: "Order berhasil dikonfirmasi." });
  } catch (err) {
    console.error("Error confirming order:", err);
    return res
      .status(500)
      .json({ message: "Gagal mengonfirmasi order." });
  }
}
