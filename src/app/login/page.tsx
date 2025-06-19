"use client";
import { signIn, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";

const LoginPage = () => {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/");
    }
  }, [status, router]);

  if (status === "loading") {
    return <p>Loading...</p>;
  }

  return (
    <div className="p-4 min-h-[calc(100vh-6rem)] md:min-h-[calc(100vh-9rem)] flex items-center justify-center bg-gray-50 ">
      <div className="shadow-2xl rounded-md overflow-hidden flex flex-col md:flex-row max-w-4xl w-full h-auto md:h-[70vh] bg-white">
        <div className="relative h-48 md:h-full md:w-1/2 flex-shrink-0">
          <Image
            src="/loginBg.png"
            alt="Login Background"
            fill
            className="object-cover md:rounded-l-md"
            priority
          />
        </div>
        <div className="p-8 md:p-10 flex flex-col justify-center gap-6 flex-1">
          <h1 className="font-bold text-2xl md:text-3xl">Welcome</h1>
          <p className="text-sm md:text-base">
            Log into your account or create a new one using social buttons
          </p>

          <button
            className="flex items-center gap-4 p-3 ring-1 ring-orange-100 rounded-md hover:bg-orange-50 transition"
            onClick={() =>
              signIn("google", {
                callbackUrl: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000/",
              })
              
            }
          >
            <Image
              src="/google.png"
              alt="Google Icon"
              width={20}
              height={20}
              className="object-contain"
            />
            <span className="flex-grow text-left">Sign in with Google</span>
          </button>

          <button className="flex items-center gap-4 p-3 ring-1 ring-blue-100 rounded-md hover:bg-blue-50 transition">
            <Image
              src="/facebook.png"
              alt="Facebook Icon"
              width={20}
              height={20}
              className="object-contain"
            />
            <span className="flex-grow text-left">Sign in with Facebook</span>
          </button>

          <p className="text-sm">
            Have a problem?
            <Link className="underline ml-1" href="/">
              Contact us
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
