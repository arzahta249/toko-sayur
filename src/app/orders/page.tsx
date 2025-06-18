"use client";

import { OrderType } from "@/types/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React from "react";
import { toast } from "react-toastify";

const OrdersPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();

  React.useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  const { isLoading, error, data } = useQuery({
    queryKey: ["orders"],
    queryFn: () =>
      fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/orders`).then((res) =>
        res.json()
      ),
    enabled: status === "authenticated",
  });

  const mutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => {
      return fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/orders/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });
    },
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast.success("Status pesanan berhasil diubah!");
    },
    onError() {
      toast.error("Gagal mengubah status pesanan.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => {
      return fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/orders/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast.success("Pesanan berhasil dihapus!");
    },
    onError() {
      toast.error("Gagal menghapus pesanan.");
    },
  });

  const handleUpdate = (e: React.FormEvent<HTMLFormElement>, id: string) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const select = form.elements.namedItem("status") as HTMLSelectElement;
    const status = select.value;

    mutation.mutate({ id, status });
  };

  const handleDelete = (id: string) => {
    const confirmBox = document.createElement("div");
    confirmBox.className = "fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50";
    confirmBox.innerHTML = `
      <div class="bg-white p-6 rounded-lg shadow-md max-w-sm w-full text-center">
        <h3 class="text-lg font-semibold mb-4">Hapus Pesanan</h3>
        <p class="text-sm text-gray-600 mb-6">Apakah Anda yakin ingin menghapus pesanan ini?</p>
        <div class="flex justify-center gap-4">
          <button id="cancelBtn" class="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded">Batal</button>
          <button id="deleteBtn" class="bg-red-500 text-white hover:bg-red-600 px-4 py-2 rounded">Hapus</button>
        </div>
      </div>
    `;
    document.body.appendChild(confirmBox);

    confirmBox.querySelector("#cancelBtn")?.addEventListener("click", () => {
      confirmBox.remove();
    });

    confirmBox.querySelector("#deleteBtn")?.addEventListener("click", () => {
      deleteMutation.mutate(id);
      confirmBox.remove();
    });
  };

  if (status === "loading" || isLoading) return <div>Loading...</div>;
  if (!data || !Array.isArray(data)) return <div>Belum ada pesanan.</div>;

  return (
    <div className="p-4 md:p-8">
      <h2 className="text-xl font-semibold mb-4">Riwayat Pesanan</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm md:text-base border border-gray-200">
          <thead className="bg-gray-100">
            <tr className="text-left">
              <th className="p-3 w-32">Nama</th>
              <th className="p-3 w-28">Tanggal</th>
              <th className="p-3 w-36">Harga</th>
              <th className="hidden md:table-cell p-3 w-40">Produk</th>
              <th className="p-3 w-40">Alamat</th>
              <th className="p-3 w-40">Telepon</th>
              <th className="p-3 w-64">Status</th>
              {session?.user?.isAdmin && <th className="p-3 w-12">Aksi</th>}
            </tr>
          </thead>
          <tbody>
            {data.map((item: OrderType) => (
              <React.Fragment key={item.id}>
                <tr
                  className={`${
                    item.status !== "pesanan sampai" ? "bg-cyan-50" : "bg-gray-50"
                  } border-b border-gray-200`}
                >
                  <td className="p-3">{item.name || "Tanpa Nama"}</td>
                  <td className="p-3">
                    {item.createdAt
                      ? new Date(item.createdAt).toLocaleDateString("id-ID")
                      : "-"}
                  </td>
                  <td className="p-3">Rp {item.price.toLocaleString("id-ID")}</td>
                  <td className="hidden md:table-cell p-3">
                    {item.products?.[0]?.title || "-"}
                  </td>
                  <td className="p-3">{item.address || "-"}</td>
                  <td className="p-3">{item.phone || "-"}</td>
                  <td className="p-3">
                    {session?.user && !session.user.isAdmin ? (
                      <div className="flex flex-col gap-2 md:flex-row md:items-center">
                        <span>{item.status}</span>
                        {item.status?.trim().toLowerCase() === "menunggu pembayaran" && (
                          <button
                            onClick={() => router.push(`/pay/${item.id}`)}
                            className="bg-teal-600 text-white px-4 py-1 rounded hover:bg-teal-700 transition"
                          >
                            Bayar
                          </button>
                        )}
                      </div>
                    ) : (
                      <form
                        className="flex items-center gap-2 justify-between w-full"
                        onSubmit={(e) => handleUpdate(e, item.id)}
                      >
                        <select
                          defaultValue={item.status}
                          name="status"
                          className="p-2 ring-1 ring-red-100 rounded-md w-32"
                        >
                          <option value="menunggu pembayaran">Menunggu pembayaran</option>
                          <option value="dalam pemprosesan">Dalam pemprosesan</option>
                          <option value="sedang dikirim">Sedang dikirim</option>
                          <option value="pesanan sampai">Pesanan sampai</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                        <button type="submit" className="bg-teal-600 p-2 rounded-full">
                          <Image src="/edit.png" alt="edit" width={20} height={20} />
                        </button>
                      </form>
                    )}
                  </td>
                  {session?.user?.isAdmin && (
                    <td className="p-3">
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                      >
                        Hapus
                      </button>
                    </td>
                  )}
                </tr>
                <tr className="bg-white border-b border-gray-100">
                  <td colSpan={8} className="px-3 py-2 text-xs text-gray-500">
                    Order ID: {item.order_id ? item.order_id.replace(/^ORDER/i, "") : item.id}
                  </td>
                </tr>
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrdersPage;
