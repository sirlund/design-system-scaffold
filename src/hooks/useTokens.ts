import { useEffect, useState } from 'react';

/**
 * Hook to safely load design tokens that might not exist yet
 */
export function useTokens<T>(importPath: string, exportName: string) {
  const [tokens, setTokens] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Dynamically import tokens at runtime
    import(/* @vite-ignore */ importPath)
      .then((module) => {
        setTokens(module[exportName] || ({} as T));
        // Try to load CSS if it exists
        const cssPath = importPath.replace(/\.(ts|tsx|js|jsx)$/, '.css');
        return import(/* @vite-ignore */ cssPath).catch(() => {
          // CSS doesn't exist, that's ok
        });
      })
      .catch(() => {
        // Tokens don't exist yet
        setTokens({} as T);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [importPath, exportName]);

  return { tokens, loading, hasTokens: tokens !== null && Object.keys(tokens).length > 0 };
}
