// src/pages/api/midtrans/notification/[orderId].ts
import { prisma } from "@/utils/connect";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const body = req.body;
    const { order_id, transaction_status, fraud_status, payment_type } = body;

    console.log("Notifikasi Midtrans:", body);

    // Ekstrak ID internal dari format ORDER__<id>__timestamp
    const parts = order_id?.split("__");
    const internalOrderId = parts?.[1];

    if (!internalOrderId) {
      return res.status(400).json({ message: "Invalid order_id" });
    }

    let newStatus = "Menunggu pembayaran";

    if (transaction_status === "settlement" || transaction_status === "capture") {
      newStatus = "Dalam proses..";
    } else if (transaction_status === "pending") {
      newStatus = "Menunggu pembayaran";
    } else if (
      transaction_status === "deny" ||
      transaction_status === "cancel" ||
      transaction_status === "expire"
    ) {
      newStatus = "Gagal";
    }

    await prisma.order.update({
      where: { id: internalOrderId },
      data: {
        status: newStatus,
        // paymentMethod: payment_type, // opsional
      },
    });

    return res.status(200).json({ message: "Notification handled" });

  } catch (error) {
    console.error("Midtrans Notification Error:", error);
    return res.status(500).json({ message: "Error handling notification" });
  }
}
