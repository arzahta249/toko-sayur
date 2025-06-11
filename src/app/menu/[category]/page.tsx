import { ProductType } from "@/types/types";
import Image from "next/image";
import Link from "next/link";
import React from "react";

const getData = async (category: string) => {
  const res = await fetch(`http://localhost:3000/api/products?cat=${category}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed!");
  }

  return res.json();
};

type Props = {
  params: { category: string };
};

const CategoryPage = async ({ params }: Props) => {
  const products: ProductType[] = await getData(params.category);

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 p-4">
      {products.map((item) => (
        <Link
          href={`/product/${item.id}`}
          key={item.id}
          className="bg-green-50 p-3 rounded-xl border border-teal-200 shadow-sm hover:shadow-md transition duration-300 hover:scale-[1.02]"
        >
          {/* IMAGE */}
          {item.img && (
            <div className="relative w-full h-40 mb-3">
              <Image
                src={item.img}
                alt={item.title}
                fill
                className="object-contain"
              />
            </div>
          )}

          {/* TEXT */}
          <div className="flex flex-col justify-between gap-2 text-teal-800">
            <h2 className="text-sm font-semibold uppercase">{item.title}</h2>
            <p className="text-sm font-medium text-teal-600">
              Rp. {Number(item.price).toLocaleString("id-ID")}
            </p>
            <button className="block mt-2 bg-teal-600 text-white text-xs py-1 rounded-md hover:bg-teal-700 transition">
              Buy Now
            </button>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default CategoryPage;
