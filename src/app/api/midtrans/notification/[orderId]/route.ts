import { prisma } from "@/utils/connect";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { order_id, transaction_status, fraud_status, payment_type } = body;

    console.log("Notifikasi Midtrans:", body);

    // Ekstrak ID internal dari format ORDER__<id>__timestamp
    const parts = order_id?.split("__");
    const internalOrderId = parts?.[1];

    if (!internalOrderId) {
      return new NextResponse("Invalid order_id", { status: 400 });
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
        // paymentMethod: payment_type, // opsional jika kamu mau simpan metode pembayaran
      },
    });

    return new NextResponse("Notification handled", { status: 200 });

  } catch (error) {
    console.error("Midtrans Notification Error:", error);
    return new NextResponse("Error handling notification", { status: 500 });
  }
}
