import { getAuthSession } from "@/utils/auth";
import { prisma } from "@/utils/connect";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getAuthSession(req, res);

  if (!session) {
    return res.status(401).json({ message: "You are not authenticated!" });
  }

  if (req.method === "GET") {
    try {
      const orders = await prisma.order.findMany({
        where: session.user.isAdmin
          ? undefined
          : { userEmail: session.user.email! },
        orderBy: { createdAt: "desc" },
      });

      return res.status(200).json(orders);
    } catch (err) {
      console.error("GET Orders Error:", err);
      return res.status(500).json({ message: "Something went wrong!" });
    }
  }

  if (req.method === "POST") {
    try {
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
      } = req.body;

      if (!products || !Array.isArray(products) || products.length === 0) {
        return res.status(400).json({ message: "Produk tidak boleh kosong dan harus berupa array" });
      }

      if (typeof price !== "number" || isNaN(price) || price <= 0) {
        return res.status(400).json({ message: "Harga tidak valid" });
      }

      for (const item of products) {
        if (!item.id || typeof item.quantity !== "number") {
          return res.status(400).json({ message: "Produk tidak lengkap" });
        }

        const product = await prisma.product.findUnique({
          where: { id: item.id },
        });

        if (!product || product.stock < item.quantity) {
          return res.status(400).json({
            message: `Stok tidak mencukupi untuk produk: ${product?.title || "tidak ditemukan"}`,
          });
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

      return res.status(201).json(order);
    } catch (err) {
      console.error("POST Orders Error:", err);
      return res.status(500).json({ message: "Something went wrong!" });
    }
  }

  return res.status(405).json({ message: "Method not allowed" });
}
