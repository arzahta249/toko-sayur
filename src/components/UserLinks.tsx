"use client";

import { signOut, useSession } from "next-auth/react";
import Link from "next/link";

const UserLinks = () => {
  const { status } = useSession();
  const linkStyle =
    "relative after:content-[''] after:absolute after:left-0 after:-bottom-1 after:w-0 after:h-[2px] after:bg-teal-700 after:transition-all hover:after:w-full hover:text-teal-700 active:text-orange-500";

  return (
    <div className="flex gap-4 items-center">
      {status === "authenticated" ? (
        <>
          <Link href="/orders" className={linkStyle}>
            Orders
          </Link>
          <span
            className={`${linkStyle} cursor-pointer text-red-600`}
            onClick={() => signOut()}
          >
            Logout
          </span>
        </>
      ) : (
        <Link href="/login" className={linkStyle}>
          Login
        </Link>
      )}
    </div>
  );
};

export default UserLinks;
