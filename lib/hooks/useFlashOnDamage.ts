import { socket } from "lib/socket";
import { useEffect } from "react";

export default function useFlashOnDamage() {
  useEffect(() => {
    socket.on("tookDamage", (amount) => {
      // Find all elements with a class that starts with "border-" or are button
      const elements = Array.from(
        document.querySelectorAll("*[class*='border']")
      ).concat(Array.from(document.getElementsByTagName("button")));

      for (const element of elements) {
        element.classList.add("!border-red-500");
      }

      setTimeout(() => {
        for (const element of elements) {
          element.classList.add("flash-border");
          element.classList.remove("!border-red-500");
        }

        setTimeout(() => {
          for (const element of elements) {
            element.classList.remove("flash-border");
          }
        }, 500);
      }, 500);
    });

    return () => {
      socket.off("tookDamage");
    };
  }, [socket]);
}
