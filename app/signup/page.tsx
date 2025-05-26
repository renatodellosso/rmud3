"use client";

import useRedirectIfSessionIdIsPresent from "lib/hooks/useRedirectIfSessionIdIsPresent";
import { socket } from "lib/socket";
import Link from "next/link";
import { useState } from "react";

export default function SignUp() {
  useRedirectIfSessionIdIsPresent();
  const [submitting, setSubmitting] = useState(false);
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  function signUp() {
    if (
      typeof email !== "string" ||
      typeof username !== "string" ||
      typeof password !== "string" ||
      typeof confirmPassword !== "string"
    ) {
      setError("One or more fields are not strings");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setSubmitting(true);
    setError("");

    socket.emit(
      "signUp",
      email,
      username,
      password,
      (sessionId: string | undefined, error: string | undefined) => {
        setSubmitting(false);
        if (sessionId) {
          window.location.href = "/selectSave";
          localStorage.setItem("sessionId", sessionId);
        } else {
          setError(error || "Unknown error");
        }
      }
    );
  }

  return (
    <div className="h-screen flex flex-col">
      <Link href="/" className="text-3xl text-white font-bold">
        RMUD3
      </Link>
      <div className="grow flex flex-col justify-center items-center">
        <form action={signUp} className="flex flex-col gap-2">
          <h1 className="text-xl w-full text-center">Sign Up</h1>
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
            type="text"
            name="username"
            placeholder="Username"
            disabled={submitting}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
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
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            disabled={submitting}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="py-1 px-2"
          />
          <button type="submit" disabled={submitting} className="py-1 px-2">
            Sign Up
          </button>
        </form>
        {error && <p className="text-red-500">{error}</p>}
      </div>
    </div>
  );
}
