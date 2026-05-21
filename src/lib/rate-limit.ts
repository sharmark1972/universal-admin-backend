type Options = {
  uniqueTokenPerInterval?: number;
  interval?: number;
};

export function rateLimit(options: Options) {
  // Use a simple Map-based cache instead of LRUCache to avoid import issues
  const tokenCache = new Map<string, { count: number; resetTime: number }>();

  return {
    check: (limit: number, token: string) =>
      new Promise<{
        success: boolean;
        limit: number;
        remaining: number;
        reset: number;
      }>((resolve) => {
        const now = Date.now();
        const interval = options.interval || 60000;
        const resetTime = now + interval;
        
        // Get or create token entry
        let tokenData = tokenCache.get(token);
        
        // Reset if expired
        if (!tokenData || now >= tokenData.resetTime) {
          tokenData = { count: 0, resetTime };
        }
        
        tokenData.count += 1;
        tokenCache.set(token, tokenData);
        
        // Clean up expired entries periodically
        if (tokenCache.size > (options.uniqueTokenPerInterval || 500)) {
          for (const [key, data] of tokenCache.entries()) {
            if (now >= data.resetTime) {
              tokenCache.delete(key);
            }
          }
        }

        const currentUsage = tokenData.count;
        const isRateLimited = currentUsage >= limit;

        return resolve({
          success: !isRateLimited,
          limit,
          remaining: isRateLimited ? 0 : limit - currentUsage,
          reset: tokenData.resetTime,
        });
      }),
  };
}