import { MenuType } from "@/types/types";
import Link from "next/link";
import React from "react";
import { headers } from "next/headers";

const getData = async () => {
  const headersList = headers();
  const host = headersList.get("host");
  const protocol = host?.includes("localhost") ? "http" : "https";

  const res = await fetch(`${protocol}://${host}/api/categories`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch categories");
  }

  return res.json();
};

const MenuPage = async () => {
  const menu: MenuType = await getData();

  return (
    <div className="p-4 lg:px-20 xl:px-40 py-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {menu.map((category) => (
        <Link
          href={`/menu/${category.slug}`}
          key={category.id}
          className="group relative w-full h-64 md:h-72 lg:h-[18rem] bg-center bg-cover rounded-lg overflow-hidden transition-transform duration-500 hover:scale-[1.02]"
          style={{ backgroundImage: `url(${category.img})` }}
        >
          {/* Overlay saat hover */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-500"></div>

          {/* Konten */}
          <div
            className={`relative z-10 text-${category.color || "white"} w-full h-full flex flex-col justify-center items-start p-6 sm:p-8`}
          >
            <h1 className="uppercase font-bold text-2xl sm:text-3xl">{category.title}</h1>
            <p className="text-sm my-3">{category.desc}</p>
            <button
              className="py-2 px-4 rounded-md transition-transform duration-300 transform hover:scale-105"
              style={{
                backgroundColor: category.color || "#fff",
                color: category.color === "black" ? "white" : "black",
              }}
            >
              jelajahi
            </button>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default MenuPage;
