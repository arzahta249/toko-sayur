"use client";

import DeleteButton from "@/components/DeleteButton";
import Price from "@/components/Price";
import { ProductType } from "@/types/types";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const SingleProductPage = ({ params }: { params: { id: string } }) => {
  const { data: session, status } = useSession();
  const [product, setProduct] = useState<ProductType | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      toast.error("Harap login terlebih dahulu untuk melakukan pemesanan");
    }
  }, [status]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/products/${params.id}`, {
          cache: "no-store",
        });
        if (!res.ok) {
          setProduct(null);
          return;
        }
        const data = await res.json();
        setProduct(data);
      } catch (error) {
        setProduct(null);
      }
    };

    if (status === "authenticated") {
      fetchData();
    }
  }, [params.id, status]);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-lg text-red-500 font-medium">
          Harap login terlebih dahulu untuk melakukan pemesanan.
        </p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-xl font-semibold text-teal-600">
          Produk tidak ditemukan atau gagal dimuat.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 lg:px-20 xl:px-40 h-screen flex flex-col justify-around text-black md:flex-row md:gap-8 md:items-center relative">
      {/* IMAGE CONTAINER */}
      {product.img && (
        <div className="relative w-full h-1/2 md:h-[70%]">
          <Image
            src={product.img}
            alt={product.title}
            className="object-contain"
            fill
          />
        </div>
      )}

      {/* TEXT CONTAINER */}
      <div className="h-1/2 flex flex-col gap-4 md:h-[70%] md:justify-center md:gap-6 xl:gap-8">
        <h1 className="text-3xl font-bold uppercase flex justify-between items-center">
          <span>{product.title}</span>
          <DeleteButton id={product.id} />
        </h1>
        <p>{product.desc}</p>
        <Price product={product} />

        {/* STOCK DISPLAY */}
        <p className="text-sm text-gray-700">
          Stok tersedia:{" "}
          <span
            className={
              product.stock > 0
                ? "text-green-600 font-semibold"
                : "text-red-600 font-semibold"
            }
          >
            {product.stock > 0 ? product.stock : "Stok habis"}
          </span>
        </p>
      </div>

      {/* TOAST */}
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        draggable
        theme="dark"
      />
    </div>
  );
};

export default SingleProductPage;
