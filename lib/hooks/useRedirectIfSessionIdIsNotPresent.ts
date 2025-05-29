import { useEffect } from "react";

export default function useRedirectIfSessionIdIsNotPresent() {
  useEffect(() => {
    const sessionId = localStorage.getItem("sessionId");
    if (!sessionId) {
      window.location.href = "/signin";
    }
  }, []);
}
