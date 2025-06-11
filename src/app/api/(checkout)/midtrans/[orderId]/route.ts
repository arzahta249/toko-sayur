import { prisma } from "@/utils/connect";
import { NextResponse } from "next/server";
import midtransClient from "midtrans-client";

export async function POST(
  req: Request,
  { params }: { params: { orderId: string } }
) {
  try {
    if (!params.orderId) {
      return new NextResponse("Missing orderId parameter", { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { id: params.orderId },
    });

    if (!order) {
      return new NextResponse("Order not found", { status: 404 });
    }

    const amount = Number(order.price);
    if (isNaN(amount) || amount <= 0) {
      return new NextResponse("Invalid order price", { status: 400 });
    }

    // Buat ID unik Midtrans (gunakan tanda pemisah yang aman seperti `__`)
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
    return NextResponse.json({ redirect_url: transaction.redirect_url });

  } catch (error) {
    console.error("Midtrans payment error:", error);
    return new NextResponse("Payment processing failed", { status: 500 });
  }
}
