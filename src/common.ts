import { multipliers, oneDayInMs } from '~constants';

export const getMiddle = (lower: number, upper: number) => {
  return Math.round((lower + upper) / 2);
};

export const buggerAllChange = (first: number, second: number) => {
  return (first / second) * 100 > 99.6;
};

export const roundUp = (value: number) => {
  if (value < 1_000_000) {
    return Math.round(value / 5000) * 5000;
  }
  return Math.round(value / 10_000) * 10_000;
};

export const roundDown = (value: number) => {
  if (value < 1_000_000) {
    return Math.floor(value / 5000) * 5000;
  }
  return Math.floor(value / 10_000) * 10_000;
};

export const cachePrice = (id: number, price: number) => {
  if (price) {
    const cache = { timestamp: Date.now(), price };
    localStorage.setItem(id.toString(), JSON.stringify(cache));
  }
};

export const getCachedPrice = (id: number | string) => {
  const cache = localStorage.getItem(id.toString());
  if (cache) {
    const { timestamp, price } = JSON.parse(cache);
    // If the cache is older than one day get an updated price
    if (Date.now() - timestamp <= oneDayInMs) {
      return price;
    }
  }

  return null;
};

export const convertToPrettyNumber = (value: string) => {
  if (!value) {
    return;
  }

  const cleaned = value.replace('$', '');
  const unit = cleaned.slice(-1).toLocaleLowerCase();
  const number = parseFloat(cleaned.slice(0, -1));

  if (multipliers[unit]) {
    return (number * multipliers[unit]).toLocaleString('en-AU', { style: 'currency', currency: 'AUD', minimumFractionDigits: 0 });
  } else {
    return value;
  }
};
