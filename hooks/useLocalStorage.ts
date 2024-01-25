import { useCallback, useState } from 'react';

export const useLocalStorage = (
  key: string,
  defaultValue: string
): [string, (newValue: string) => void] => {
  const [value, setValue] = useState<string>(
    typeof window !== 'undefined' ? window.localStorage.getItem(key) || defaultValue : defaultValue
  );

  const setItem = useCallback(
    (newValue: string) => {
      if (typeof window === 'undefined') {
        return;
      }

      try {
        setValue(newValue);
        window.localStorage.setItem(key, newValue);
      } catch (err) {}
    },
    [key]
  );

  return [value, setItem];
};
