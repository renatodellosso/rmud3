import { useEffect } from "react";

export default function useRedirectIfSessionIdIsPresent() {
  useEffect(() => {
    const sessionId = localStorage.getItem("sessionId");
    if (sessionId) {
      window.location.href = "/selectSave";
    }
  }, []);
}
