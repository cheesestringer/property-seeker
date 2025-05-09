import { multipliers, oneDayInMs } from '~constants';
import type { PropertyCache } from '~models';

export const isDevelopment = () => {
  return process.env.NODE_ENV === 'development';
};

export const toCurrencyFormat = (value: number | string, locale = 'en-AU', currency = 'AUD') => {
  return value.toLocaleString(locale, { style: 'currency', currency, minimumFractionDigits: 0 });
};

export const getMiddle = (lower: number, upper: number) => {
  return Math.round((lower + upper) / 2);
};

export const buggerAllChange = (first: number, second: number, percentage = 99.6) => {
  return (first / second) * 100 > percentage;
};

export const roundUp = (value: number) => {
  if (value > 5_000_000) {
    return Math.round(value / 1_000_000) * 1_000_000;
  }

  if (value > 1_000_000) {
    return Math.round(value / 100_000) * 100_000;
  }

  return Math.round(value / 10_000) * 10_000;
};

export const getBrowserCache = async (key: string): Promise<PropertyCache> => {
  try {
    const storage = await chrome.storage.local.get(key);
    const cache = JSON.parse(storage[key] || '{}') as PropertyCache;
    return cache;
  } catch (error) {
    console.error('Failed to get browser cache', error);
    return {} as PropertyCache;
  }
};

export const updateBrowserCache = async (key: string, updateFn: (data: PropertyCache) => PropertyCache) => {
  try {
    const currentCache = await getBrowserCache(key);
    const updatedCache = updateFn(currentCache);

    chrome.storage.local.set({ [key]: JSON.stringify(updatedCache) });
  } catch (error) {
    console.error('Failed to update browser cache', error);
  }
};

export const cacheIsValid = (timestamp: number, expiry: number = oneDayInMs) => {
  if (!timestamp) {
    return null;
  }

  return Date.now() - timestamp <= expiry;
};

export const convertToPrettyNumber = (value: string) => {
  if (!value) {
    return;
  }

  const cleaned = value.replace('$', '');
  const unit = cleaned.slice(-1).toLocaleLowerCase();
  const number = parseFloat(cleaned.slice(0, -1));

  if (multipliers[unit]) {
    return toCurrencyFormat(number * multipliers[unit]);
  } else {
    return value;
  }
};

export const getCleanUrl = (href: string) => {
  try {
    const url = new URL(href);
    return url.origin + url.pathname;
  } catch (error) {
    console.log('Failed to create clean url', href);
    throw error;
  }
}