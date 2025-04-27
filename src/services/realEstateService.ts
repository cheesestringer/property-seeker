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

const extractPrice = (text: string) => {
  const cleaned = text.replace(/\\/g, '');
  const match = cleaned.match(/"marketing_price_range":"(.*?)"/);
  if (match) {
    const price = match[1].split('_').map(price => `$${price}`);
    if (price.length == 2) {
      const lower = convertToPrettyNumber(price[0]);
      const upper = convertToPrettyNumber(price[1]);
      if (isDevelopment()) {
        console.table({ lower, upper, match: match[1] });
      }
      return `${lower}-${upper}`;
    } else {
      const value = price[0];
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
      return cache.price;
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
