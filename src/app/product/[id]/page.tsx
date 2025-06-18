"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useCartStore } from "@/utils/store";
import { toast, ToastContainer } from "react-toastify";
import { ProductType } from "@/types/types";
import DeleteButton from "@/components/DeleteButton";
import "react-toastify/dist/ReactToastify.css";

const SingleProductPage = ({ params }: { params: { id: string } }) => {
  const { data: session, status } = useSession();
  const [product, setProduct] = useState<ProductType | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [editedStock, setEditedStock] = useState<number | null>(null);
  const addToCart = useCartStore((state) => state.addToCart);

  useEffect(() => {
    if (status === "unauthenticated") {
      toast.error("Harap login terlebih dahulu untuk melakukan pemesanan");
    }
  }, [status]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/products/${params.id}`, {
          cache: "no-store",
        });
        if (res.ok) {
          const data = await res.json();
          setProduct(data);
        } else {
          setProduct(null);
        }
      } catch (err) {
        setProduct(null);
      }
    };

    if (status === "authenticated") {
      fetchProduct();
    }
  }, [params.id, status]);

  const handleAddToCart = () => {
    if (!product) return;

    if (quantity > product.stock) {
      toast.error(`Jumlah melebihi stok (${product.stock})`);
      return;
    }

    addToCart({
      id: product.id,
      title: product.title,
      price: product.price,
      quantity,
      img: product.img,
    });

    toast.success("Produk ditambahkan ke keranjang!");
  };

  const handleStockUpdate = async () => {
    if (editedStock === null || editedStock < 0) return;

    try {
      const res = await fetch(`/api/products/${product?.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ stock: editedStock }),
      });

      if (res.ok) {
        const updated = await res.json();
        setProduct(updated);
        toast.success("Stok berhasil diperbarui");
        setEditedStock(null);
      } else {
        toast.error("Gagal memperbarui stok");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan saat memperbarui stok");
    }
  };

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-teal-700">Loading...</p>
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
        <p className="text-xl font-semibold text-teal-700">
          Produk tidak ditemukan atau gagal dimuat.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 lg:px-24 xl:px-36 flex flex-col md:flex-row gap-10 md:items-center min-h-screen bg-white text-teal-700">
      {/* IMAGE */}
      {product.img && (
        <div className="relative w-full h-[300px] md:w-1/2 md:h-[400px] lg:h-[500px]">
          <Image
            src={product.img}
            alt={product.title}
            fill
            className="object-contain rounded-lg"
          />
        </div>
      )}

      {/* DETAILS */}
      <div className="w-full md:w-1/2 flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl md:text-3xl font-semibold">{product.title}</h1>
          <DeleteButton id={product.id} />
        </div>

        <p className="text-sm leading-relaxed">{product.desc}</p>

        <p className="text-lg font-medium">
          Harga:
          <span className="ml-2">
            Rp {product.price.toLocaleString("id-ID")}
          </span>
        </p>

        <div className="flex items-center gap-3">
          <label htmlFor="quantity" className="font-medium">
            Jumlah:
          </label>
          <input
            id="quantity"
            type="number"
            min={1}
            max={product.stock}
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            className="w-20 text-teal-700 border border-teal-700 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <p className="text-sm">
          Stok:
          {session?.user?.isAdmin ? (
            <span className="ml-2 flex items-center gap-2">
              <input
                type="number"
                min={0}
                value={editedStock !== null ? editedStock : product.stock}
                onChange={(e) => setEditedStock(Number(e.target.value))}
                className="w-20 text-teal-700 border border-teal-700 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleStockUpdate}
                className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
              >
                Simpan
              </button>
            </span>
          ) : (
            <span
              className={`ml-2 font-medium ${
                product.stock > 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {product.stock > 0 ? product.stock : "Stok habis"}
            </span>
          )}
        </p>

        <button
          onClick={handleAddToCart}
          disabled={product.stock <= 0}
          className="mt-4 w-fit bg-teal-700 text-white px-5 py-2 rounded hover:bg-teal-800 disabled:bg-gray-400 transition-all"
        >
          Add to Cart
        </button>
      </div>

      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        draggable
        theme="colored"
      />
    </div>
  );
};

export default SingleProductPage;
