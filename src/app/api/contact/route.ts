import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/utils/auth";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    const session = await getServerSession(authOptions);

    // Jika email disertakan, pastikan user login dan hanya bisa akses pesan mereka sendiri
    if (email) {
      if (!session || session.user?.email !== email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const messages = await prisma.contactMessage.findMany({
        where: { email },
        orderBy: { createdAt: "desc" },
      });

      return NextResponse.json(messages, { status: 200 });
    }

    // Jika tidak ada email, hanya admin yang bisa akses semua pesan
    if (!session || !session.user?.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const messages = await prisma.contactMessage.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(messages, { status: 200 });
  } catch (error) {
    console.error("Gagal mengambil pesan:", error);
    return NextResponse.json({ error: "Gagal mengambil pesan" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, email, subject, message } = await request.json();

    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: "Semua field wajib diisi" }, { status: 400 });
    }

    const contact = await prisma.contactMessage.create({
      data: {
        name,
        email,
        subject,
        message,
        createdAt: new Date(),
      },
    });

    return NextResponse.json({ message: "Pesan berhasil dikirim", contact }, { status: 201 });
  } catch (error) {
    console.error("Gagal menyimpan pesan:", error);
    return NextResponse.json({ error: "Gagal menyimpan pesan" }, { status: 500 });
  }
}
