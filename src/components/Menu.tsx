"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import CartIcon from "./CartIcon";

const links = [
  { id: 1, title: "Homepage", url: "/" },
  { id: 2, title: "Shop", url: "/menu" },
  { id: 3, title: "Contact", url: "/contact" },
];

const Menu = () => {
  const [open, setOpen] = useState(false);
  const { data: session, status } = useSession();
  const isLoggedIn = status === "authenticated";

  useEffect(() => {
    if (status === "authenticated") {
      toast.success("Berhasil login!", {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
      });
    }
  }, [status]);

  const handleLogout = () => {
    toast.info("Berhasil logout!", {
      position: "top-right",
      autoClose: 3000,
      theme: "colored",
    });
    setOpen(false);
    setTimeout(() => signOut({ callbackUrl: "/" }), 500);
  };

  return (
    <>
      <ToastContainer />
      <div className="relative z-50">
        <Image
          src={open ? "/close.png" : "/open.png"}
          alt="Toggle Menu"
          width={30}
          height={30}
          onClick={() => setOpen(!open)}
          className="cursor-pointer filter brightness-0"
        />
      </div>

      {/* Sliding Menu */}
      <div
        className={`fixed top-0 left-0 h-full bg-teal-700 text-white z-40 transition-transform duration-300 ease-in-out ${
          open ? "translate-x-0" : "-translate-x-full"
        } w-[70%] flex flex-col gap-8 pt-16 px-6`}
      >
        {/* Brand Name */}
        <div className="text-3xl font-bold border-b border-white pb-4">
          BapakTani
        </div>

        {/* Menu Links */}
        <nav className="flex flex-col gap-6 flex-grow">
          {links.map((item) => (
            <Link
              href={item.url}
              key={item.id}
              onClick={() => setOpen(false)}
              className="block text-left text-xl font-medium relative after:content-[''] after:absolute after:left-0 after:-bottom-1 after:w-0 after:h-[2px] after:bg-white after:transition-all hover:after:w-full hover:text-white active:text-orange-500"
            >
              {item.title}
            </Link>
          ))}

          {isLoggedIn && (
            <Link
              href="/orders"
              onClick={() => setOpen(false)}
              className="block text-left text-xl font-medium relative after:content-[''] after:absolute after:left-0 after:-bottom-1 after:w-0 after:h-[2px] after:bg-white after:transition-all hover:after:w-full hover:text-white active:text-orange-500"
            >
              ORDERS
            </Link>
          )}

          {isLoggedIn ? (
            <button
              onClick={handleLogout}
              className="text-left text-xl font-medium bg-transparent border-none cursor-pointer relative after:content-[''] after:absolute after:left-0 after:-bottom-1 after:w-0 after:h-[2px] after:bg-white after:transition-all hover:after:w-full hover:text-white active:text-orange-500"
            >
              LOGOUT
            </button>
          ) : (
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="block text-left text-xl font-medium relative after:content-[''] after:absolute after:left-0 after:-bottom-1 after:w-0 after:h-[2px] after:bg-white after:transition-all hover:after:w-full hover:text-white active:text-orange-500"
            >
              LOGIN
            </Link>
          )}

          {/* Cart selalu ada paling bawah */}
          <div
            onClick={() => setOpen(false)}
            className="block text-left text-xl font-medium relative cursor-pointer hover:text-white active:text-orange-500"
          >
          <CartIcon />
          </div>
        </nav>
      </div>
    </>
  );
};

export default Menu;
