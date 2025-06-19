import { getAuthSession } from "@/utils/auth";
import { prisma } from "@/utils/connect";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;

  if (typeof id !== "string") {
    return res.status(400).json({ message: "Invalid product ID" });
  }

  switch (req.method) {
    case "GET":
      try {
        const product = await prisma.product.findUnique({
          where: { id },
        });

        if (!product) {
          return res.status(404).json({ message: "Product not found" });
        }

        return res.status(200).json(product);
      } catch (err) {
        console.error("GET Product Error:", err);
        return res.status(500).json({ message: "Something went wrong!" });
      }

    case "PUT":
      try {
        const session = await getAuthSession(req, res); // ✅
        if (!session?.user.isAdmin) {
          return res.status(403).json({ message: "You are not allowed!" });
        }

        const { stock } = req.body;

        if (stock === undefined || typeof stock !== "number") {
          return res.status(400).json({ message: "Invalid stock value" });
        }

        const updatedProduct = await prisma.product.update({
          where: { id },
          data: { stock },
        });

        return res.status(200).json(updatedProduct);
      } catch (err) {
        console.error("PUT Product Error:", err);
        return res.status(500).json({ message: "Failed to update product" });
      }

    case "DELETE":
      try {
        const session = await getAuthSession(req, res); // ✅
        if (!session?.user.isAdmin) {
          return res.status(403).json({ message: "You are not allowed!" });
        }

        await prisma.product.delete({
          where: { id },
        });

        return res.status(200).json({ message: "Product has been deleted!" });
      } catch (err) {
        console.error("DELETE Product Error:", err);
        return res.status(500).json({ message: "Something went wrong!" });
      }

    default:
      return res.status(405).json({ message: "Method not allowed" });
  }
}
