"use client";

import { useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

const DeleteButton = ({ id }: { id: string }) => {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === "loading") {
    return <p>Loading...</p>;
  }

  if (status === "unauthenticated" || !session?.user.isAdmin) {
    return null;
  }

  const handleDelete = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/products`, {
        method: "DELETE",
      });

      if (res.ok) {
        router.push("/menu");
        toast("The product has been deleted!");
      } else {
        const data = await res.json();
        toast.error(data.message || "Failed to delete product.");
      }
    } catch (error) {
      toast.error("Network error, please try again.");
    }
  };

  return (
    <button
      className="bg-red-400 hover:bg-red-500 text-white p-2 rounded-full ml-6"
      onClick={handleDelete}
      aria-label="Delete product"
    >
      <Image src="/delete.png" alt="Delete icon" width={20} height={20} />
    </button>
  );
};

export default DeleteButton;
