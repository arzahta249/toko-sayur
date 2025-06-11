"use client";
import Image from "next/image";
import React from "react";
import dynamic from "next/dynamic";

const CountDown = dynamic(() => import("./CountDown"), { ssr: false });

const Offer = () => {
  return (
    <div className="bg-black min-h-screen flex flex-col md:flex-row md:justify-between md:bg-[url('/offerBg.png')] md:min-h-[70vh]">
      {/* TEXT CONTAINER */}
      <div className="flex-1 flex flex-col justify-center items-center text-center gap-8 p-6">
        <h1 className="text-white text-5xl font-bold xl:text-6xl">
          Sayur & Buah Segar Dalam Kemasan Praktis!
        </h1>
        <p className="text-white xl:text-xl max-w-md">
          Lagi diskon 30% khusus untuk kemasan segar pilihan!
          Hanya bisa dipesan lewat pre-order dan dalam waktu terbatas!
          <br />
          Yuk, pesan sekarang sebelum kehabisan!
        </p>
        <CountDown />
        <button className="bg-teal-700 text-white rounded-md py-3 px-6 active:scale-95 transition-transform duration-150 hover:scale-105">
          Order Now
        </button>
      </div>
      {/* IMAGE CONTAINER */}
      <div className="flex-1 w-full relative min-h-[70vh]">
        <Image
          src="/offerPRODUCT.png"
          alt="Offer Product"
          fill
          sizes="(min-width: 768px) 50vw, 100vw"
          className="object-contain"
        />
      </div>
    </div>
  );
};

export default Offer;
