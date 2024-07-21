import { convertToPrettyNumber } from '~common';
import { oneDayInMs } from '~constants';

const extractPrice = (text: string) => {
  const cleaned = text.replace(/\\/g, '');
  const match = cleaned.match(/"marketing_price_range":"(.*?)"/);
  if (match) {
    const price = match[1].split('_').map(price => `$${price}`);
    if (price.length == 2) {
      const lower = convertToPrettyNumber(price[0]);
      const upper = convertToPrettyNumber(price[1]);
      console.log(lower, upper);
      return `${lower}-${upper}`;
    } else {
      return convertToPrettyNumber(price[0]);
    }
  }
  return null;
};

export const getPrice = async (url: string): Promise<string> => {
  try {
    const cache = localStorage.getItem(url);
    if (cache) {
      const { timestamp, price } = JSON.parse(cache);
      if (Date.now() - timestamp <= oneDayInMs) {
        return price;
      }
    }

    const response = await fetch(url);
    const text = await response.text();
    const price = extractPrice(text);
    if (price) {
      const cache = { timestamp: Date.now(), price };
      localStorage.setItem(url, JSON.stringify(cache));
    }
    return price;
  } catch (error) {
    console.log(error);
    throw error;
  }
};
