import { prisma } from "@/utils/connect";
import { NextRequest, NextResponse } from "next/server";

// PUT update order by id
export const PUT = async (
  req: NextRequest,
  { params }: { params: { id: string } }
) => {
  const { id } = params;

  try {
    const body = await req.json();
    const { status, address, phone, name } = body;

    if (!status) {
      return new NextResponse(
        JSON.stringify({ message: "Status wajib diisi." }),
        { status: 400 }
      );
    }

    if (!address || !phone) {
      return new NextResponse(
        JSON.stringify({ message: "Alamat dan telepon wajib diisi sebelum konfirmasi." }),
        { status: 400 }
      );
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

    return new NextResponse(
      JSON.stringify({ message: "Order berhasil diperbarui.", order: updatedOrder }),
      { status: 200 }
    );
  } catch (err) {
    console.error(err);
    return new NextResponse(
      JSON.stringify({ message: "Terjadi kesalahan saat memperbarui order." }),
      { status: 500 }
    );
  }
};

// DELETE order by id
export const DELETE = async (
  req: NextRequest,
  { params }: { params: { id: string } }
) => {
  const { id } = params;

  try {
    const order = await prisma.order.findUnique({ where: { id } });

    if (!order) {
      return new NextResponse(
        JSON.stringify({ message: "Order tidak ditemukan." }),
        { status: 404 }
      );
    }

    await prisma.order.delete({ where: { id } });

    return new NextResponse(
      JSON.stringify({ message: "Order berhasil dihapus." }),
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return new NextResponse(
      JSON.stringify({ message: "Gagal menghapus order." }),
      { status: 500 }
    );
  }
};
