import { useState, useEffect } from 'react';
import { LOCAL_STORAGE_KEY } from '@/config/constants';
import { useLocalStorage } from './useLocalStorage';

const DEFAULT_REGION = 'eastus';

type Options = {
  skip?: boolean;
  onKeyUpdated?: (key: string) => void;
  onRegionUpdated?: (region: string) => void;
};

export const useKey = (provider: 'azure' | 'elevenlabs', options?: Options) => {
  const [key, setKey] = useState<string>('');
  const [region, setRegion] = useState<string>(DEFAULT_REGION);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>();

  const [, setStorageKey] = useLocalStorage(LOCAL_STORAGE_KEY, '');

  useEffect(() => {
    if (options?.skip) {
      return;
    }

    const fetchKey = async () => {
      if (typeof window === 'undefined') {
        return;
      }

      setLoading(true);
      setError(undefined);
      setRegion(DEFAULT_REGION);
      setKey('');

      let tempAuth = window.localStorage.getItem(LOCAL_STORAGE_KEY);

      if (!tempAuth) {
        tempAuth = prompt('Please enter your password to access the TTS API');
        setStorageKey(tempAuth || '');
      }

      try {
        const response = await fetch(`/api/tts/${provider}`, {
          headers: {
            Authorization: `Basic ${tempAuth}`,
          },
        });
        const json = await response.json();
        setKey(json.token);
        setRegion(json.region);
        options?.onKeyUpdated?.(json.token);
        options?.onRegionUpdated?.(json.region || DEFAULT_REGION);
      } catch (err) {
        setError(`${err}`);
        setStorageKey('');
        alert('Password is invalid or expired. Please try again.');
        window.location.reload();
      } finally {
        setLoading(false);
      }
    };

    fetchKey();
  }, [provider, options, setStorageKey]);

  return { key, region, loading, error };
};
