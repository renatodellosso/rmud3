"use client";

import { socket } from "lib/socket";
import { useState } from "react";

export default function SignIn() {
  const [submitting, setSubmitting] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function signIn(form: FormData) {
    if (typeof email !== "string" || typeof password !== "string") {
      return;
    }

    setSubmitting(true);

    socket.emit("signIn", email, password, (sessionId: string | undefined) => {
      setSubmitting(false);
      if (sessionId) {
        window.location.href = "/";
        localStorage.setItem("sessionId", sessionId);
      } else {
        alert("Invalid email or password");
      }
    });
  }

  return (
    <div className="h-screen flex flex-col">
      <div>
        <h1 className="text-3xl text-white font-bold">RMUD3</h1>
      </div>
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
      </div>
    </div>
  );
}
