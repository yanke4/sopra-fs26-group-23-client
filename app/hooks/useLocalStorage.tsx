import { useEffect, useState } from "react";

interface LocalStorage<T> {
  value: T;
  set: (newVal: T) => void;
  clear: () => void;
}

/**
 * This custom function/hook safely handles SSR by checking
 * for the window before accessing browser localStorage.
 * IMPORTANT: It has a local react state AND a localStorage state.
 * When initializing the state with a default value,
 * clearing will revert to this default value for the state and
 * the corresponding token gets deleted in the localStorage.
 *
 * @param key - The key from localStorage, generic type T.
 * @param defaultValue - The default value if nothing is in localStorage yet.
 * @returns An object containing:
 *  - value: The current value (synced with localStorage).
 *  - set: Updates both react state & localStorage.
 *  - clear: Resets state to defaultValue and deletes localStorage key.
 */
export default function useLocalStorage<T>(
  key: string,
  defaultValue: T,
): LocalStorage<T> {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === "undefined") return defaultValue;
    try {
      const stored = globalThis.localStorage.getItem(key);
      if (stored) {
        return JSON.parse(stored) as T;
      }
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
    }
    return defaultValue;
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleUpdate = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail.key === key) {
        setValue(detail.value as T);
      }
    };
    window.addEventListener("localStorage-update", handleUpdate);
    return () =>
      window.removeEventListener("localStorage-update", handleUpdate);
  }, [key]);

  // Simple setter that updates both state and localStorage
  const set = (newVal: T) => {
    setValue(newVal);
    if (typeof window !== "undefined") {
      globalThis.localStorage.setItem(key, JSON.stringify(newVal));
      window.dispatchEvent(
        new CustomEvent("localStorage-update", {
          detail: { key, value: newVal },
        }),
      );
    }
  };

  // Removes the key from localStorage and resets the state
  const clear = () => {
    setValue(defaultValue);
    if (typeof window !== "undefined") {
      globalThis.localStorage.removeItem(key);
      window.dispatchEvent(
        new CustomEvent("localStorage-update", {
          detail: { key, value: defaultValue },
        }),
      );
    }
  };

  return { value, set, clear };
}
