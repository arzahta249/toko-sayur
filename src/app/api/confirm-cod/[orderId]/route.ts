import { prisma } from "@/utils/connect";
import { NextResponse } from "next/server";

export const PUT = async (
  _: Request,
  { params }: { params: { orderId: string } }
) => {
  try {
    // Cari order berdasarkan orderId
    const order = await prisma.order.findUnique({
      where: { id: params.orderId },
      select: { address: true, phone: true, status: true },
    });

    if (!order) {
      return new NextResponse(
        JSON.stringify({ message: "Order tidak ditemukan." }),
        { status: 404 }
      );
    }

    // Cek apakah address dan phone tersedia
    if (!order.address || !order.phone) {
      return new NextResponse(
        JSON.stringify({
          message: "Alamat dan nomor telepon harus diisi sebelum konfirmasi.",
        }),
        { status: 400 }
      );
    }

    // Jika sudah dikonfirmasi sebelumnya
    if (order.status === "Dalam proses.." || order.status === "Selesai") {
      return new NextResponse(
        JSON.stringify({ message: "Order sudah dikonfirmasi sebelumnya." }),
        { status: 200 } // ✅ Ganti 400 jadi 200 supaya dianggap sukses di frontend
      );
    }

    // Update status order menjadi 'Dalam proses..'
    await prisma.order.update({
      where: { id: params.orderId },
      data: { status: "Dalam proses.." },
    });

    return new NextResponse(
      JSON.stringify({ message: "Order berhasil dikonfirmasi." }),
      { status: 200 }
    );
  } catch (err) {
    console.error("Error confirming order:", err);
    return new NextResponse(
      JSON.stringify({ message: "Gagal mengonfirmasi order." }),
      { status: 500 }
    );
  }
};
