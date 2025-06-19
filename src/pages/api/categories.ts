// src/pages/api/categories.ts

import { PrismaClient } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    try {
      const categories = await prisma.category.findMany();
      return res.status(200).json(categories);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Something went wrong" });
    }
  }

  if (req.method === "POST") {
    return res.status(200).send("hello");
  }

  return res.status(405).json({ message: "Method not allowed" });
}
