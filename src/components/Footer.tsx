import Link from "next/link";
import React from "react";
import SocialIcons from "./SocialIcons"; // langsung import tanpa dynamic

import { FaPhone } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-white text-black">
      <div
        className="
          flex flex-col md:flex-row
          items-center md:items-center
          justify-between
          h-20 md:h-24
          px-6 md:px-20 lg:px-40
          py-4
          gap-4 md:gap-0
        "
      >
        {/* Kiri: Brand name */}
        <div className="flex-shrink-0">
          <Link
            href="/"
            className="
              font-bold text-xl relative px-1
              cursor-pointer
              text-black transition-colors duration-300 ease-in-out
              hover:text-teal-700 focus:text-teal-700
              hover:scale-105 focus:scale-105
              outline-none inline-block
            "
          >
            BapakTani
          </Link>
        </div>

        {/* Tengah: Social media icons */}
        <div className="flex flex-grow justify-center gap-6 items-center">
          <SocialIcons />
        </div>

        {/* Kanan: Phone number */}
        <div
          tabIndex={0}
          className="
            hidden md:flex flex-shrink-0 items-center gap-2 px-1 cursor-pointer
            text-black transition-colors duration-300 ease-in-out
            hover:text-teal-700 focus:text-teal-700
            hover:scale-105 focus:scale-105
            outline-none
          "
        >
          <FaPhone size={20} />
          <span>0823 1416 9288</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
