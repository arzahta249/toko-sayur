import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/utils/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const message = await prisma.contactMessage.findUnique({
      where: { id: params.id },
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
      return NextResponse.json({ error: "Pesan tidak ditemukan" }, { status: 404 });
    }

    // Cek hak akses: user hanya boleh lihat pesan sendiri jika bukan admin
    if (!session.user.isAdmin && session.user.email !== message.email) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(message);
  } catch (error) {
    console.error("Gagal mengambil detail pesan:", error);
    return NextResponse.json({ error: "Gagal mengambil detail pesan" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { reply } = await request.json();

    if (!reply || typeof reply !== "string") {
      return NextResponse.json({ error: "Balasan tidak valid" }, { status: 400 });
    }

    const updated = await prisma.contactMessage.update({
      where: { id: params.id },
      data: {
        reply,
        replyAt: new Date(),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Gagal mengupdate balasan:", error);
    return NextResponse.json({ error: "Gagal mengupdate balasan" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await prisma.contactMessage.delete({
      where: { id: params.id },
    });

    return new NextResponse(null, { status: 204 }); // No Content
  } catch (error) {
    console.error("Gagal menghapus pesan:", error);
    return NextResponse.json({ error: "Gagal menghapus pesan" }, { status: 500 });
  }
}
