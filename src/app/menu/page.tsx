"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { MenuType } from "@/types/types";

const MenuPage = () => {
  const [menu, setMenu] = useState<MenuType>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/categories`);
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setMenu(data);
      } catch (err) {
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4">Failed to load menu.</div>;

  return (
    <div className="p-4 lg:px-20 xl:px-40 py-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {menu.map((category) => (
        <Link
          href={`/menu/${category.slug}`}
          key={category.id}
          className="group relative w-full h-64 md:h-72 lg:h-[18rem] bg-center bg-cover rounded-lg overflow-hidden transition-transform duration-500 hover:scale-[1.02]"
          style={{ backgroundImage: `url(${category.img})` }}
        >
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-500" />
          <div
            className={`relative z-10 text-${category.color} w-full h-full flex flex-col justify-center items-start p-6 sm:p-8`}
          >
            <h1 className="uppercase font-bold text-2xl sm:text-3xl">{category.title}</h1>
            <p className="text-sm my-3">{category.desc}</p>
            <button
              className={`bg-${category.color} text-${category.color === "black" ? "white" : "black"} py-2 px-4 rounded-md hover:scale-105 transition-transform duration-300`}
            >
              Explore
            </button>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default MenuPage;
