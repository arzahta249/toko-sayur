"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ConfettiExplosion from "react-confetti-explosion";

const SuccessPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get("order_id");
  const method = searchParams.get("method");
  const [message, setMessage] = useState("Memproses pesanan Anda...");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const confirm = async () => {
      if (!orderId) {
        setMessage("ID pesanan tidak ditemukan.");
        setError(true);
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`/api/confirm-cod/${orderId}`, {
          method: "PUT",
        });

        if (!res.ok) {
          const data = await res.json();
          if (data.message === "Pesanan sudah dikonfirmasi") {
            // Treat as success if already confirmed
            setMessage("Pesanan telah dibuat. Lihat detail lebih lanjut di Orders.");
            setError(false);
          } else {
            throw new Error(data.message || "Gagal konfirmasi pesanan.");
          }
        } else {
          setMessage(
            method === "cod"
              ? "Pesanan COD berhasil dikonfirmasi."
              : "Pembayaran berhasil. Pesanan sedang disiapkan."
          );
          setError(false);
        }
      } catch (err: any) {
        setError(true);
        setMessage(err.message || "Terjadi kesalahan saat konfirmasi pesanan.");
      } finally {
        setLoading(false);
      }
    };

    if (orderId && method) {
      confirm();
    }
  }, [orderId, method]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-green-100 to-white relative">
      {!loading && !error && (
        <ConfettiExplosion
          force={0.6}
          duration={3000}
          particleCount={100}
          width={300}
          height={300}
          className="absolute top-20"
        />
      )}

      <div
        className={`rounded-2xl shadow-xl p-10 max-w-md w-full text-center transition-all duration-300
          ${
            loading
              ? "bg-white text-gray-800"
              : error
              ? "bg-red-100 text-red-700"
              : "bg-teal-700 text-white"
          }`}
      >
        {loading ? (
          <div className="flex flex-col items-center gap-4">
            <svg
              className="animate-spin h-10 w-10 text-teal-600"
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
                d="M4 12a8 8 0 018-8v8z"
              ></path>
            </svg>
            <p className="text-lg font-medium">{message}</p>
          </div>
        ) : error ? (
          <>
            <h1 className="text-2xl font-bold mb-2">Gagal</h1>
            <p className="mb-4">{message}</p>
            <button
              onClick={() => router.push("/")}
              className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Kembali ke Beranda
            </button>
          </>
        ) : (
          <>
            <h1 className="text-3xl font-bold mb-4">🎉 Pesanan Berhasil!</h1>
            <p className="text-base mb-6">{message}</p>
            <button
              onClick={() => router.push("/orders")}
              className="inline-block px-6 py-2 bg-white text-teal-700 font-semibold rounded-full shadow-md hover:bg-gray-100 transition duration-200"
            >
              Lihat Detail Pesanan
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default SuccessPage;
