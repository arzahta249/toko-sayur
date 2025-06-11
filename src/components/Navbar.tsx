import React from "react";
import Menu from "./Menu";
import Link from "next/link";
import CartIcon from "./CartIcon";
import UserLinks from "./UserLinks";

const Navbar = () => {
  const user = false;
  const linkStyle =
    "relative after:content-[''] after:absolute after:left-0 after:-bottom-1 after:w-0 after:h-[2px] after:bg-teal-700 after:transition-all hover:after:w-full hover:text-teal-700 active:text-orange-500";

  return (
    <div className="h-12 text-black p-4 flex items-center justify-between border-b-2 border-b-teal-700 uppercase md:h-24 lg:px-20 xl:px-40">
      {/* LEFT LINKS */}
      <div className="hidden md:flex gap-4 flex-1">
        <Link href="/" className={linkStyle}>
          Homepage
        </Link>
        <Link href="/menu" className={linkStyle}>
          Shop
        </Link>
        <Link href="/contact" className={linkStyle}>
          Contact
        </Link>
      </div>

      {/* LOGO */}
      <div className="text-xl md:font-bold flex-1 md:text-center">
        <Link href="/">BapakTani</Link>
      </div>

      {/* MOBILE MENU */}
      <div className="md:hidden">
        <Menu />
      </div>

      {/* RIGHT LINKS */}
      <div className="hidden md:flex gap-4 items-center justify-end flex-1">
        <UserLinks />
        <CartIcon />
      </div>
    </div>
  );
};

export default Navbar;

