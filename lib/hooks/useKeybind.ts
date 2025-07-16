import { useEffect } from "react";

export default function useKeybind(
  key: string | ((event: KeyboardEvent) => boolean),
  callback: (event: KeyboardEvent) => void,
  deps: any[] = []
) {
  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.defaultPrevented) {
      return; // If the event is already handled, do nothing
    }

    if (
      (typeof key === "string" && event.key === key) ||
      (typeof key === "function" && key(event))
    ) {
      event.preventDefault();
      callback(event);
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [key, callback, ...deps]);
}
