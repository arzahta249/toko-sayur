import { ProductType } from "@/types/types";
import Image from "next/image";
import React from "react";

const getData = async () => {
  const res = await fetch("http://localhost:3000/api/products", {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed!");
  }

  return res.json();
};

const Featured = async () => {
  const featuredProducts: ProductType[] = await getData();

  return (
    <section className="w-full max-w-[1200px] mx-auto px-4 py-12 text-black">
      <h2 className="text-4xl font-extrabold mb-8 text-center">Featured Products</h2>

      <div className="flex gap-6 overflow-x-auto scrollbar-thin scrollbar-thumb-teal-700 scrollbar-track-gray-200">
        {featuredProducts.map((item) => (
          <article
            key={item.id}
            className="flex-shrink-0 w-[280px] md:w-[360px] xl:w-[400px] bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 cursor-pointer"
          >
            {/* IMAGE CONTAINER */}
            {item.img && (
              <div className="relative h-[250px] md:h-[300px] xl:h-[350px] rounded-t-lg overflow-hidden">
                <Image
                  src={item.img}
                  alt={item.title}
                  fill
                  className="object-cover scale-105 brightness-105 transition-transform duration-500"
                  priority
                />
              </div>
            )}

            {/* TEXT CONTAINER */}
            <div className="p-4 flex flex-col items-center text-center gap-3">
              <h3 className="text-xl md:text-2xl font-semibold uppercase">{item.title}</h3>
              <p className="text-gray-700 text-sm md:text-base">{item.desc}</p>
              <span className="text-lg md:text-xl font-bold text-teal-700">
                Rp. {Number(item.price).toLocaleString("id-ID")}
              </span>
              <button
                type="button"
                className="mt-3 px-5 py-2.5 bg-teal-700 text-white rounded-md font-semibold hover:bg-teal-800 active:scale-95 transition-transform duration-150 mx-auto block"
              >
                Add to Cart
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

export default Featured;
