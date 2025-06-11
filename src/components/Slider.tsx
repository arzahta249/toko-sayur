"use client";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import Link from "next/link";

const data = [
  {
    id: 1,
    title: "Rasakan kesegaran buah terbaik setiap hari",
    image: "/slide.1.jpg",
  },
  {
    id: 2,
    title: "Kesegaran sayur terbaik untuk keluarga Anda",
    image: "/slide.2.jpg",
  },
  {
    id: 3,
    title: "Tersedia Sayuran & Buah Kemasan Praktis",
    image: "/slide.3.JPG",
  },
];

const Slider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % data.length);
    }, 4000); // Ganti slide setiap 4 detik

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] md:h-[calc(100vh-9rem)] lg:flex-row bg-fuchsia-50 overflow-hidden">
      {/* TEXT CONTAINER */}
      <div className="flex-1 flex items-center justify-center flex-col gap-8 text-teal-700 font-bold">
        <h1 className="text-4xl text-center uppercase p-4 md:p-10 md:text-5xl xl:text-6xl transition-all duration-500">
          {data[currentSlide].title}
        </h1>
        <Link href="/menu">
          <button className="bg-teal-700 text-white py-4 px-8 rounded-lg active:scale-95 transition-transform duration-150 hover:scale-105 active:scale-95">
            Order Now
          </button>
        </Link>

      </div>

      {/* IMAGE CONTAINER */}
      <div className="relative flex-1 w-full h-full overflow-hidden">
        <div
          className="flex h-full transition-transform duration-700 ease-in-out"
          style={{
            transform: `translateX(-${currentSlide * 100}%)`,
          }}
        >
          {data.map((item) => (
            <div
              key={item.id}
              className="relative w-full h-full flex-shrink-0 min-w-full"
            >
              <Image
                src={item.image}
                alt={item.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Slider;
