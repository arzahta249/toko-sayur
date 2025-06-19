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
    removeFromCart,
    increaseQuantity,
    decreaseQuantity,
  } = useCartStore();

  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [stockMap, setStockMap] = useState<{ [id: string]: number }>({});
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    useCartStore.persist.rehydrate();
  }, []);

  useEffect(() => {
    const fetchStock = async () => {
      const newStockMap: { [id: string]: number } = {};
      for (const item of products) {
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/products/${item.id}`);
          if (res.ok) {
            const data = await res.json();
            newStockMap[item.id] = data.stock;
          }
        } catch (err) {
          console.error("Error fetching stock:", err);
        }
      }
      setStockMap(newStockMap);
    };

    fetchStock();
  }, [products]);

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleCheckout = async () => {
    const selectedProducts = products.filter((item) =>
      selectedIds.includes(item.id)
    );

    if (selectedProducts.length === 0) {
      toast.warning("Pilih produk untuk checkout");
      return;
    }

    for (const item of selectedProducts) {
      const available = stockMap[item.id];
      if (available !== undefined && item.quantity > available) {
        toast.error(`Stok untuk ${item.title} hanya tersisa ${available}`);
        return;
      }
    }

    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          price: selectedProducts.reduce(
            (acc, item) => acc + item.price * item.quantity,
            0
          ),
          products: selectedProducts,
          status: "Not Paid!",
          userEmail: session?.user?.email,
        }),
      });

      if (!res.ok) throw new Error("Gagal checkout");

      const data = await res.json();
      selectedProducts.forEach(removeFromCart);
      toast.success("Checkout berhasil, menuju pembayaran...");
      setTimeout(() => router.push(`/pay/${data.id}`), 1500);
    } catch (err) {
      console.error("Checkout error:", err);
      toast.error("Gagal melakukan checkout");
    } finally {
      setLoading(false);
    }
  };

  if (!session) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-teal-100 to-fuchsia-200">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <h2 className="text-xl font-semibold text-teal-700 mb-4">
            Kamu belum login
          </h2>
          <button
            onClick={() => router.push("/login")}
            className="bg-teal-600 text-white px-6 py-2 rounded hover:bg-teal-700 transition"
          >
            Login Sekarang
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-[calc(100vh-6rem)] md:min-h-[calc(100vh-9rem)] flex flex-col lg:flex-row items-start gap-6 p-6 bg-white text-teal-600">
        {/* Produk */}
        <div className="w-full lg:w-2/3 max-h-[75vh] overflow-y-auto space-y-4 pr-1">
          {products.map((item) => (
            <div
              key={item.id}
              onClick={() => handleToggleSelect(item.id)}
              className={`flex items-center justify-between p-4 border rounded-lg shadow-sm cursor-pointer hover:bg-teal-50 ${
                selectedIds.includes(item.id) ? "border-teal-500" : ""
              }`}
            >
              <input
                type="checkbox"
                checked={selectedIds.includes(item.id)}
                onChange={(e) => {
                  e.stopPropagation();
                  handleToggleSelect(item.id);
                }}
                className="mr-2 accent-teal-600"
              />
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
                <h1 className="uppercase text-lg font-semibold">
                  {item.title}
                </h1>
                <p className="text-sm text-gray-600 mb-2">
                  {item.optionTitle} | Stok: {stockMap[item.id] ?? "..."}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      decreaseQuantity(item);
                    }}
                    className="px-2 py-1 text-white bg-teal-500 rounded"
                  >
                    -
                  </button>
                  <span className="text-md font-semibold">
                    {item.quantity}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (item.quantity < (stockMap[item.id] || 0)) {
                        increaseQuantity(item);
                      } else {
                        toast.error("Stok tidak cukup!");
                      }
                    }}
                    className="px-2 py-1 text-white bg-teal-500 rounded"
                  >
                    +
                  </button>
                </div>
              </div>
              <div className="text-right">
                <h2 className="font-bold">
                  Rp.{(item.price * item.quantity).toLocaleString("id-ID")}
                </h2>
                <span
                  className="text-red-500 text-lg font-bold cursor-pointer px-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFromCart(item);
                  }}
                >
                  ×
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Pembayaran */}
        <div className="w-full lg:w-1/3 p-6 bg-fuchsia-50 rounded-lg shadow-md space-y-4 text-base">
          <div className="flex justify-between">
            <span>Produk Terpilih</span>
            <span>{selectedIds.length} item</span>
          </div>
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>
              Rp.
              {products
                .filter((p) => selectedIds.includes(p.id))
                .reduce((acc, p) => acc + p.price * p.quantity, 0)
                .toLocaleString("id-ID")}
            </span>
          </div>
          <hr />
          <div className="flex justify-between font-bold">
            <span>Total</span>
            <span>
              Rp.
              {products
                .filter((p) => selectedIds.includes(p.id))
                .reduce((acc, p) => acc + p.price * p.quantity, 0)
                .toLocaleString("id-ID")}
            </span>
          </div>
          <button
            onClick={handleCheckout}
            disabled={loading}
            className={`w-full py-3 rounded-md text-white font-semibold transition ${
              loading
                ? "bg-teal-400 cursor-not-allowed"
                : "bg-teal-700 hover:bg-teal-800 hover:scale-105"
            }`}
          >
            {loading ? "Memproses..." : "CHECKOUT"}
          </button>
        </div>
      </div>
      <ToastContainer theme="dark" />
    </>
  );
};

export default CartPage;
