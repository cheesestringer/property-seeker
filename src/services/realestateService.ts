import Bottleneck from 'bottleneck';
import { cacheIsValid, convertToPrettyNumber, getBrowserCache, isDevelopment, updateBrowserCache } from '~common';

const limiter = new Bottleneck({
  reservoir: 2,
  reservoirRefreshAmount: 2,
  reservoirRefreshInterval: 1000,
  maxConcurrent: 1
});

const realestateRateLimitedFetch = (url: string | URL | globalThis.Request, options?: RequestInit) => {
  return limiter.schedule(() => fetch(url, options));
};

const PRICE_CODE_MAPPING = {
  '001S': '$0 - $100,000',
  '002S': '$100,000 - $200,000',
  '003S': '$200,000 - $300,000',
  '005S': '$300,000 - $400,000',
  '006S': '$400,000 - $500,000',
  '008S': '$500,000 - $600,000',
  '010S': '$600,000 - $750,000',
  '014S': '$750,000 - $1,000,000',
  '017S': '$1,000,000 - $1,500,000',
  '018S': '$1,500,000 - $2,000,000',
  '020S': '$2,000,000 - $2,500,000',
  '021S': '$2,500,000 - $3,000,000',
  '022S': '$3,000,000 - $3,500,000',
  '024S': '$3,500,000 - $4,000,000',
  '025S': '$4,000,000 - $4,500,000',
  '026S': '$4,500,000 - $5,000,000',
  '027S': '$5,000,000+'
};

const PRICE_CODE_PATTERN = /^\d{3}[A-Z]$/;

const resolvePriceCode = (value: string | undefined | null) => {
  if (!value) {
    return null;
  }

  const trimmedValue = value.trim();
  if (!trimmedValue) {
    return null;
  }

  const normalized = trimmedValue.startsWith('$') ? trimmedValue.slice(1) : trimmedValue;

  if (PRICE_CODE_PATTERN.test(normalized)) {
    return PRICE_CODE_MAPPING[normalized] ?? null;
  }

  return trimmedValue;
};

const extractPrice = (text: string) => {
  const cleaned = text.replace(/\\/g, '');
  const match = cleaned.match(/"marketing_price_range":"(.*?)"/);
  if (match) {
    const marketingPrice = match[1];
    if (PRICE_CODE_MAPPING[marketingPrice]) {
      return PRICE_CODE_MAPPING[marketingPrice];
    }

    // Keep the old logic for now as a fallback
    const fallbackPrice = marketingPrice.split('_').map(price => `$${price}`);
    if (fallbackPrice.length == 2) {
      const lower = convertToPrettyNumber(fallbackPrice[0]);
      const upper = convertToPrettyNumber(fallbackPrice[1]);
      if (isDevelopment()) {
        console.table({ lower, upper, match: marketingPrice });
      }
      return `${lower}-${upper}`;
    } else {
      const value = fallbackPrice[0];
      let prettyValue = convertToPrettyNumber(value);
      if (value === '$5m') {
        // Range on realestate.com.au maxes out at 5 million so show a + symbol
        return prettyValue + '+';
      }
      return prettyValue;
    }
  }
  return null;
};

export const getPrice = async (url: string): Promise<string> => {
  try {
    const cache = await getBrowserCache(url);
    if (cacheIsValid(cache.timestamp) && cache?.price) {
      const resolvedPrice = resolvePriceCode(cache.price);
      if (resolvedPrice) {
        // Cleanup the cache
        if (resolvedPrice !== cache.price) {
          updateBrowserCache(url, cached => {
            cached.price = resolvedPrice;
            return cached;
          });
        }
        return resolvedPrice;
      }

      const cachedTrimmed = cache.price.trim();
      const normalized = cachedTrimmed.startsWith('$') ? cachedTrimmed.slice(1) : cachedTrimmed;
      if (!PRICE_CODE_PATTERN.test(normalized)) {
        return cache.price;
      }
    }

    const response = await realestateRateLimitedFetch(url);
    const text = await response.text();
    const price = extractPrice(text);
    if (price) {
      updateBrowserCache(url, cache => {
        cache.price = price;
        cache.timestamp = Date.now();
        return cache;
      });
    }

    return price;
  } catch (error) {
    console.log(error);
    throw error;
  }
};
