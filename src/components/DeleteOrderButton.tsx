"use client";

import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

const DeleteOrderButton = ({ id }: { id: string }) => {
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm("Are you sure want to delete this order?")) return;

    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to delete order");
      }

      toast.success("Order deleted!");
      router.refresh(); // refresh halaman supaya update
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <button onClick={handleDelete} className="btn-delete">
      Delete Order
    </button>
  );
};

export default DeleteOrderButton;
