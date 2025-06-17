import { getAuthSession } from "@/utils/auth";
import { prisma } from "@/utils/connect";
import { NextRequest, NextResponse } from "next/server";

// GET all orders
export const GET = async (req: NextRequest) => {
  const session = await getAuthSession();

  if (!session) {
    return new NextResponse(
      JSON.stringify({ message: "You are not authenticated!" }),
      { status: 401 }
    );
  }

  try {
    const orders = await prisma.order.findMany({
      where: session.user.isAdmin
        ? undefined
        : { userEmail: session.user.email! },
      orderBy: { createdAt: "desc" },
    });

    return new NextResponse(JSON.stringify(orders), { status: 200 });
  } catch (err) {
    console.error(err);
    return new NextResponse(
      JSON.stringify({ message: "Something went wrong!" }),
      { status: 500 }
    );
  }
};

// POST create order
export const POST = async (req: NextRequest) => {
  const session = await getAuthSession();

  if (!session) {
    return new NextResponse(
      JSON.stringify({ message: "You are not authenticated!" }),
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const {
      products,
      price,
      order_id,
      address,
      phone,
    }: {
      products: { id: string; title: string; quantity: number }[];
      price: number;
      order_id?: string;
      address?: string;
      phone?: string;
    } = body;

    // Kurangi stok setiap produk sesuai quantity
    for (const item of products) {
      const product = await prisma.product.findUnique({
        where: { id: item.id },
      });

      if (!product || product.stock < item.quantity) {
        return new NextResponse(
          JSON.stringify({
            message: `Stok tidak mencukupi untuk produk: ${product?.title || "tidak ditemukan"}`,
          }),
          { status: 400 }
        );
      }

      await prisma.product.update({
        where: { id: item.id },
        data: {
          stock: {
            decrement: item.quantity,
          },
        },
      });
    }

    // Simpan order
    const order = await prisma.order.create({
      data: {
        products,
        price,
        order_id,
        status: "menunggu pembayaran",
        userEmail: session.user.email!,
        address,
        phone,
        name: session.user.name || "Tanpa Nama",
      },
    });

    return new NextResponse(JSON.stringify(order), { status: 201 });
  } catch (err) {
    console.error(err);
    return new NextResponse(
      JSON.stringify({ message: "Something went wrong!" }),
      { status: 500 }
    );
  }
};
