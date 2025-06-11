"use client";
import React from "react";
import { FaFacebookF, FaTiktok, FaInstagram } from "react-icons/fa";

const SocialIcons = () => {
  const openLink = (url: string) => {
    window.open(url, "_blank");
  };

  return (
    <>
      <span
        role="link"
        tabIndex={0}
        onClick={() => openLink("https://facebook.com")}
        onKeyDown={(e) => e.key === "Enter" && openLink("https://facebook.com")}
        aria-label="Facebook"
        className="hover:text-blue-600 transition-colors duration-300 cursor-pointer"
      >
        <FaFacebookF size={24} />
      </span>

      <span
        role="link"
        tabIndex={0}
        onClick={() => openLink("https://tiktok.com")}
        onKeyDown={(e) => e.key === "Enter" && openLink("https://tiktok.com")}
        aria-label="TikTok"
        className="hover:text-black transition-colors duration-300 cursor-pointer"
      >
        <FaTiktok size={24} />
      </span>

      <span
        role="link"
        tabIndex={0}
        onClick={() => openLink("https://instagram.com")}
        onKeyDown={(e) => e.key === "Enter" && openLink("https://instagram.com")}
        aria-label="Instagram"
        className="hover:text-pink-600 transition-colors duration-300 cursor-pointer"
      >
        <FaInstagram size={24} />
      </span>
    </>
  );
};

export default SocialIcons;
