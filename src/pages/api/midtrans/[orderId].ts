import { prisma } from "@/utils/connect";
import midtransClient from "midtrans-client";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { orderId } = req.query;

  if (!orderId || typeof orderId !== "string") {
    return res.status(400).json({ message: "Missing or invalid orderId parameter" });
  }

  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const amount = Number(order.price);
    if (isNaN(amount) || amount <= 0) {
      return res.status(400).json({ message: "Invalid order price" });
    }

    const midtransOrderId = `ORDER__${order.id}__${Date.now()}`;

    await prisma.order.update({
      where: { id: order.id },
      data: { order_id: midtransOrderId },
    });

    const snap = new midtransClient.Snap({
      isProduction: process.env.NODE_ENV === "production",
      serverKey: process.env.MIDTRANS_SERVER_KEY!,
    });

    const transactionParams = {
      transaction_details: {
        order_id: midtransOrderId,
        gross_amount: amount,
      },
      customer_details: {
        first_name: "Customer",
        email: order.userEmail || "guest@example.com",
      },
      enabled_payments: [
        "credit_card", "gopay", "shopeepay", "qris", "bank_transfer", "echannel",
        "bca_klikbca", "bca_klikpay", "bri_epay", "cimb_clicks", "danamon_online",
        "akulaku", "kredivo", "dana", "ovo"
      ],
      callbacks: {
        finish: `${process.env.NEXT_PUBLIC_SITE_URL}/success?order_id=${order.id}&method=midtrans`,
      },
    };

    const transaction = await snap.createTransaction(transactionParams);
    return res.status(200).json({ redirect_url: transaction.redirect_url });

  } catch (error) {
    console.error("Midtrans payment error:", error);
    return res.status(500).json({ message: "Payment processing failed" });
  }
}
