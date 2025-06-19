import { prisma } from "@/utils/connect";
import { NextApiRequest, NextApiResponse } from "next";

// FETCH ALL PRODUCTS & CREATE NEW PRODUCT
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    const cat = req.query.cat as string | undefined;

    try {
      const products = await prisma.product.findMany({
        where: {
          ...(cat ? { catSlug: cat } : { isFeatured: true }),
        },
      });
      return res.status(200).json(products);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Something went wrong!" });
    }
  }

  if (req.method === "POST") {
    try {
      const { title, desc, price, catSlug, img, stock, options } = req.body;

      if (!title || !desc || !price || !catSlug || !img || stock === undefined) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      const product = await prisma.product.create({
        data: {
          title,
          desc,
          price,
          catSlug,
          img,
          stock,
          options,
        },
      });

      return res.status(201).json(product);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Something went wrong!" });
    }
  }

  // Jika metode bukan GET/POST
  return res.status(405).json({ message: "Method Not Allowed" });
}
