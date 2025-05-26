"use client";

import useRedirectIfSessionIdIsPresent from "lib/hooks/useRedirectIfSessionIdIsPresent";
import { socket } from "lib/socket";
import Link from "next/link";
import { useState } from "react";

export default function SignIn() {
  useRedirectIfSessionIdIsPresent();
  const [submitting, setSubmitting] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function signIn() {
    if (typeof email !== "string" || typeof password !== "string") {
      return setError("One or more fields are not strings");
    }

    setSubmitting(true);
    setError("");

    socket.emit("signIn", email, password, (sessionId: string | undefined) => {
      setSubmitting(false);
      if (sessionId) {
        window.location.href = "/play";
        localStorage.setItem("sessionId", sessionId);
      } else {
        setError("Invalid email or password");
      }
    });
  }

  return (
    <div className="h-screen flex flex-col">
      <Link href="/" className="text-3xl text-white font-bold">
        RMUD3
      </Link>
      <div className="grow flex flex-col justify-center items-center">
        <form action={signIn} className="flex flex-col gap-2">
          <h1 className="text-xl w-full text-center">Sign In</h1>
          <input
            type="email"
            name="email"
            placeholder="Email"
            disabled={submitting}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="py-1 px-2"
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            disabled={submitting}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="py-1 px-2"
          />
          <button type="submit" disabled={submitting} className="py-1 px-2">
            Sign In
          </button>
        </form>
        {error && <p className="text-red-500">{error}</p>}
      </div>
    </div>
  );
}
