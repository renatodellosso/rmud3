"use client";

import Link from "next/link";

export default function Page() {
  return (
    <div className="flex flex-col gap-2 items-center justify-center h-screen">
      <h1 className="text-3xl text-white font-bold">RMUD3</h1>
      <Link
        href="/signin"
        className="w-1/8 bg-black hover:bg-gray-600 border-1 border-white text-center text-white py-1 px-2"
      >
        Sign In
      </Link>
      <Link
        href="/signup"
        className="w-1/8 bg-black hover:bg-gray-600 border-1 border-white text-center text-white py-1 px-2"
      >
        Create Account
      </Link>
    </div>
  );
}
