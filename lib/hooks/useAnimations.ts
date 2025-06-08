import { socket } from "lib/socket";
import { useEffect } from "react";

export default function useAnimations() {
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
          element.classList.add("damage-animation");
          element.classList.remove("!border-red-500");
        }

        setTimeout(() => {
          for (const element of elements) {
            element.classList.remove("damage-animation");
          }
        }, 500);
      }, 500);
    });

    socket.on("died", () => {
      // Find all elements with borders or text colors
      const elements = Array.from(document.querySelectorAll("*"));

      for (const element of elements) {
        element.classList.add("opacity-0", "death-animation");
      }

      setTimeout(() => {
        for (const element of elements) {
          element.classList.remove("opacity-0");
        }

        setTimeout(() => {
          for (const element of elements) {
            element.classList.remove("death-animation");
          }
        }, 2500);
      }, 2500);
    });

    return () => {
      socket.off("tookDamage");
      socket.off("died");
    };
  }, [socket]);
}
