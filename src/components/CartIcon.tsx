"use client";

import { useCartStore } from "@/utils/store";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import React, { useState, useEffect } from "react";

const CartIcon = () => {
  const { data: session, status } = useSession();
  const totalItems = useCartStore((state) => state.totalItems);
  const displayTotalItems = status === "authenticated" ? totalItems : 0;

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  if (session?.user?.isAdmin) {
    return (
      <div className="flex items-center gap-4">
        <div className="relative w-8 h-8 md:w-5 md:h-5">
          <Image
            src="/cart.png"
            alt="Cart"
            fill
            sizes="100%"
            className="object-contain"
          />
        </div>
        <Link href="/add" className="p-1 bg-teal-700 text-white rounded-md inline-block">
          Add product
        </Link>
      </div>
    );
  }

  return (
    <Link href="/cart" className="flex items-center gap-4">
      <div className="relative w-8 h-8 md:w-5 md:h-5">
        <Image
          src="/cart.png"
          alt="Cart"
          fill
          sizes="100%"
          className="object-contain"
        />
      </div>
      {status === "loading" ? <span>Cart (...) </span> : <span>Cart ({displayTotalItems})</span>}
    </Link>
  );
};

export default CartIcon;
