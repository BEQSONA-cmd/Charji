import { useEffect, useState } from "react";
import { useStatic } from "./useStatic";

function useLocalStorageHook<T>(key: string, initialValue: T): [T, (value: T) => void] {
    const [hydrated, setHydrated] = useState(false);

    useEffect(() => {
        setHydrated(true);
    }, []);

    const getStoredValue = (): T => {
        if (typeof window === "undefined") return initialValue;

        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.error(`Error reading localStorage key "${key}":`, error);
            return initialValue;
        }
    };

    const [storedValue, setStoredValue] = useStatic<T>(key, getStoredValue());

    const setValue = (value: T) => {
        try {
            const valueToStore = value instanceof Function ? value(storedValue) : value;
            setStoredValue(valueToStore);
            if (typeof window !== "undefined") {
                window.localStorage.setItem(key, JSON.stringify(valueToStore));
            }
        } catch (error) {
            console.error(`Error setting localStorage key "${key}":`, error);
        }
    };

    return [hydrated ? storedValue : initialValue, setValue];
}

export const useLocalStorage = (key: string, initialValue?: any) => useLocalStorageHook(key, initialValue);
