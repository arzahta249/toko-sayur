"use client";

import { useCartStore } from "@/utils/store";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const CartPage = () => {
  const {
    products,
    totalItems,
    totalPrice,
    removeFromCart,
    clearCart,
    increaseQuantity,
    decreaseQuantity,
  } = useCartStore();

  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [stockMap, setStockMap] = useState<{ [id: string]: number }>({});

  useEffect(() => {
    useCartStore.persist.rehydrate();
  }, []);

  useEffect(() => {
    const fetchStock = async () => {
      const newStockMap: { [id: string]: number } = {};
      for (const item of products) {
        try {
          const res = await fetch(`/api/products/${item.id}`);
          if (res.ok) {
            const data = await res.json();
            newStockMap[item.id] = data.stock;
          }
        } catch (err) {
          console.error("Gagal mengambil stok produk:", err);
        }
      }
      setStockMap(newStockMap);
    };

    fetchStock();
  }, [products]);

  if (!session) {
    return (
      <>
        <div className="flex flex-col justify-center items-center h-screen bg-gradient-to-br from-teal-100 to-fuchsia-200 px-4">
          <div className="max-w-md bg-white rounded-lg shadow-lg p-8 text-center fade-in">
            <h2 className="text-2xl font-bold mb-4 text-teal-700">Kamu belum login</h2>
            <p className="mb-6 text-gray-600">
              Silakan login terlebih dahulu untuk melihat dan mengelola keranjangmu.
            </p>
            <button
              onClick={() => router.push("/login")}
              className="bg-teal-600 text-white px-6 py-3 rounded-md font-semibold shadow-md hover:bg-teal-700 transition-colors duration-300"
            >
              Login Sekarang
            </button>
          </div>
        </div>
        <style jsx>{`
          .fade-in {
            opacity: 0;
            animation: fadeIn 0.5s ease forwards;
          }
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>
      </>
    );
  }

  const handleCheckout = async () => {
    if (products.length === 0) {
      toast.warning("Anda belum memesan produk.", {
        position: "top-center",
        autoClose: 3000,
      });
      return;
    }

    for (const item of products) {
      const available = stockMap[item.id];
      if (available !== undefined && item.quantity > available) {
        toast.error(`Stok untuk ${item.title} hanya tersisa ${available}`, {
          position: "top-center",
        });
        return;
      }
    }

    setLoading(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          price: totalPrice,
          products,
          status: "Not Paid!",
          userEmail: session.user.email,
        }),
      });

      if (!res.ok) throw new Error("Gagal membuat pesanan");

      const data = await res.json();
      clearCart();
      toast.success("Anda akan diarahkan ke menu pembayaran.", {
        position: "top-center",
        autoClose: 3000,
      });

      setTimeout(() => {
        router.push(`/pay/${data.id}`);
      }, 1500);
    } catch (err) {
      console.error(err);
      toast.error("Terjadi kesalahan saat checkout.", {
        position: "top-center",
        autoClose: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="min-h-[calc(100vh-6rem)] md:min-h-[calc(100vh-9rem)] flex flex-col lg:flex-row items-center justify-center gap-6 p-6 bg-white text-teal-600">
        {/* PRODUCTS CONTAINER */}
        <div className="w-full max-w-4xl lg:w-2/3 flex flex-col gap-4 overflow-y-auto">
          {products.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-4 border rounded-lg shadow-sm"
            >
              {item.img && (
                <Image
                  src={item.img}
                  alt={item.title}
                  width={100}
                  height={100}
                  className="object-contain"
                />
              )}
              <div className="flex-1 px-4">
                <h1 className="uppercase text-lg font-semibold">{item.title}</h1>
                <p className="text-sm text-gray-600 mb-2">
                  {item.optionTitle} | Stok: {stockMap[item.id] ?? "..."}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => decreaseQuantity(item)}
                    className="px-2 py-1 text-white bg-teal-500 rounded"
                  >
                    -
                  </button>
                  <span className="text-md font-semibold">{item.quantity}</span>
                  <button
                    onClick={() =>
                      item.quantity < (stockMap[item.id] || 0)
                        ? increaseQuantity(item)
                        : toast.error("Melebihi stok!")
                    }
                    className="px-2 py-1 text-white bg-teal-500 rounded"
                  >
                    +
                  </button>
                </div>
              </div>
              <h2 className="font-bold whitespace-nowrap text-right">
                Rp.{(item.price * item.quantity).toLocaleString("id-ID")}
              </h2>
              <span
                className="cursor-pointer text-red-500 font-bold text-lg px-2"
                onClick={() => removeFromCart(item)}
              >
                ×
              </span>
            </div>
          ))}
        </div>

        {/* PAYMENT CONTAINER */}
        <div className="w-full max-w-md lg:w-1/3 p-6 bg-fuchsia-50 rounded-lg shadow-md">
          <div className="space-y-4 text-base md:text-lg">
            <div className="flex justify-between">
              <span>Subtotal ({totalItems} items)</span>
              <span>Rp.{Number(totalPrice).toLocaleString("id-ID")}</span>
            </div>
            <div className="flex justify-between">
              <span>Service Cost</span>
              <span>Rp.0</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery Cost</span>
              <span className="text-green-500 font-medium">FREE!</span>
            </div>
            <hr />
            <div className="flex justify-between font-bold">
              <span>Total (Incl. VAT)</span>
              <span>Rp.{Number(totalPrice).toLocaleString("id-ID")}</span>
            </div>
            <button
              onClick={handleCheckout}
              disabled={loading}
              className={`w-full py-3 rounded-md text-white font-semibold flex items-center justify-center gap-2 transition-all duration-300
              ${loading ? "bg-teal-500 cursor-not-allowed opacity-70" : "bg-teal-700 hover:bg-teal-800 hover:scale-105"}
            `}
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    ></path>
                  </svg>
                  Processing...
                </>
              ) : (
                "CHECKOUT"
              )}
            </button>
          </div>
        </div>
      </div>
      <ToastContainer theme="dark" />
    </>
  );
};

export default CartPage;
