"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

const PayPage = () => {
  const router = useRouter();
  const { id } = useParams();

  const [name, setName] = useState("");       // tambahan state name
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  const notify = (message: string) => {
    toast.dismiss();
    toast(message, {
      theme: "dark",
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: false,
    });
  };

  const handleSaveInfo = async (): Promise<boolean> => {
    if (!id) {
      notify("ID pesanan tidak ditemukan.");
      return false;
    }

    if (!name.trim() || !address.trim() || !phone.trim()) {  // cek name juga
      notify("Nama, alamat, dan No. Telepon wajib diisi.");
      return false;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,          // kirim name juga
          address,
          phone,
          status: "Dalam proses..",
        }),
      });

      if (!res.ok) throw new Error("Gagal simpan data alamat");

      notify("Data berhasil disimpan.");
      return true;
    } catch (error) {
      console.error(error);
      notify("Terjadi kesalahan saat menyimpan data.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleMidtransPayment = async () => {
    const saved = await handleSaveInfo();
    if (!saved || !id) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/midtrans/${id}`, { method: "POST" });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();

      if (data.redirect_url) {
        window.location.href = data.redirect_url;
      } else {
        throw new Error("Gagal mendapatkan URL Midtrans");
      }
    } catch (error) {
      console.error(error);
      notify("Terjadi kesalahan saat memproses pembayaran.");
    } finally {
      setLoading(false);
    }
  };

  const handleCOD = async () => {
    const saved = await handleSaveInfo();
    if (!saved || !id) return;

    setLoading(true);
    try {
      await fetch(`/api/confirm-cod/${id}`, { method: "PUT" });
      router.push(`/success?order_id=${id}&method=cod`);
    } catch (error) {
      console.error(error);
      notify("Terjadi kesalahan saat konfirmasi COD.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-16 p-6 bg-white rounded-xl shadow-lg flex flex-col gap-6">
      <ToastContainer />

      <h1 className="text-2xl font-semibold text-center text-gray-800">
        Masukkan Nama, Alamat dan No. Telepon
      </h1>

      <input
        type="text"
        placeholder="Nama lengkap"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="p-3 border rounded-md"
        disabled={loading}
      />

      <input
        type="text"
        placeholder="Alamat lengkap"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        className="p-3 border rounded-md"
        disabled={loading}
      />
      <input
        type="tel"
        placeholder="No. Telepon"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        className="p-3 border rounded-md"
        disabled={loading}
      />

      <button
        onClick={handleMidtransPayment}
        disabled={loading}
        className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-lg font-medium shadow-lg hover:from-indigo-600 hover:to-purple-600 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Memproses..." : "Bayar via Midtrans"}
      </button>

      <button
        onClick={handleCOD}
        disabled={loading}
        className="bg-gradient-to-r from-green-500 to-teal-500 text-white py-3 rounded-lg font-medium shadow-lg hover:from-teal-500 hover:to-green-500 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Memproses..." : "Bayar di Tempat (COD)"}
      </button>
    </div>
  );
};

export default PayPage;
