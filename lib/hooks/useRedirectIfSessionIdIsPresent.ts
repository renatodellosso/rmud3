import { useEffect } from "react";
import { socket } from "lib/socket";

export default function useRedirectIfSessionIdIsPresent() {
  useEffect(() => {
    const sessionId = localStorage.getItem("sessionId");
    if (sessionId) {
      socket.emit("setSessionId", sessionId, (success: boolean) => {
        if (success) {
          window.location.href = "/selectSave";
        }
      });
    }
  }, []);
}
