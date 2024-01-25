import { useState, useEffect } from 'react';

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

  useEffect(() => {
    if (options?.skip) {
      return;
    }

    const fetchKey = async () => {
      setLoading(true);
      setError(undefined);
      setRegion(DEFAULT_REGION);
      setKey('');

      try {
        const response = await fetch(`/api/tts/${provider}`);
        const json = await response.json();
        setKey(json.token);
        setRegion(json.region);
        options?.onKeyUpdated?.(json.token);
        options?.onRegionUpdated?.(json.region || DEFAULT_REGION);
      } catch (err) {
        setError(`${err}`);
      } finally {
        setLoading(false);
      }
    };

    fetchKey();
  }, [provider, options]);

  return { key, region, loading, error };
};
