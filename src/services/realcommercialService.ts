import { buggerAllChange, getMiddle, isDevelopment, roundUp, toCurrencyFormat, updateBrowserCache } from '~common';

export const getProperty = async (cacheKey: string, id: string): Promise<Realcommerical.ModifiedPropertyResponse> => {
  const response = await fetch(`https://api.realcommercial.com.au/listing-ui/listings/${id}`, {
    headers: { 'content-type': 'application/json' }
  });

  if (!response.ok) {
    throw new Error(`${response.status}`);
  }

  const data = (await response.json()) as Realcommerical.ModifiedPropertyResponse;
  await updateBrowserCache(cacheKey, cache => {
    if (data.listing?.daysActive) {
      const date = new Date();
      date.setDate(date.getDate() - data.listing.daysActive);
      // Modify the response to include the calcualted listed date
      data.listedAt = date.toISOString();
      cache.listedDate = date.toISOString();
    }

    cache.updatedDate = data.listing?.lastUpdatedAt;
    return cache;
  });
  return data;
};

const getFilter = (summary: Realcommerical.PropertyResponse): object => {
  const filter = { 'within-radius': 'excludesurrounding' };

  const { tenureType, attributes } = summary.listing;
  if (tenureType) {
    filter['tenure-type'] = tenureType;
  }

  const floorArea = attributes.find(x => x.id === 'floor-area')?.value;
  if (floorArea) {
    const value = floorArea.replace('m²', '').trim();
    if (value.includes('-')) {
      const values = value.split('-');
      filter['floor-area'] = { minimuim: values[0].trim(), maximum: values[1].trim() };
    } else {
      filter['floor-area'] = { minimuim: value, maximum: value };
    }
  }

  const landArea = attributes.find(x => x.id === 'land-area')?.value;
  if (landArea) {
    const value = landArea.replace('m²', '').trim();
    if (value.includes('-')) {
      const values = value.split('-');
      filter['land-size'] = { minimuim: values[0].trim(), maximum: values[1].trim() };
    } else {
      filter['land-size'] = { minimuim: value, maximum: value };
    }
  }
  return filter;
};

export const getAndCachePrice = async (cacheKey: string, summary: Realcommerical.PropertyResponse, signal: AbortSignal): Promise<string> => {
  const price = await getPrice(summary, signal);
  await updateBrowserCache(cacheKey, cache => {
    cache.price = toCurrencyFormat(price);
    cache.timestamp = Date.now();
    return cache;
  });

  return toCurrencyFormat(price);
};

const getPrice = async (summary: Realcommerical.PropertyResponse, signal: AbortSignal): Promise<number> => {
  let minimum = 50_000;
  let maximum = 500_000_000;
  let searchValue = getMiddle(minimum, maximum);

  const filter = getFilter(summary);
  const { id, address } = summary.listing;
  const localities = [{ locality: address.suburb, subdivision: address.state, postcode: address.postcode }];

  const maxRequests = 14;
  for (let i = 0; i < maxRequests; i++) {
    try {
      const response = await fetch('https://api.realcommercial.com.au/listing-ui/searches?featureFlags=marketTrendsSlice3', {
        headers: { 'content-type': 'application/json' },
        method: 'POST',
        body: JSON.stringify({
          channel: summary.listing.availableChannels.includes('for-sale') ? 'buy' : 'sold',
          localities: localities,
          filters: {
            'price-range': { minimum: searchValue.toString(), maximum: maximum.toString() },
            ...filter
          },
          page: 1,
          'page-size': 60
        }),
        signal
      });

      if (!response.ok) {
        throw new Error(`${response.status}`);
      }

      const data = await response.json();
      const ids = data.listings.map(x => x.id);
      if (ids.includes(id)) {
        minimum = searchValue;
        searchValue = getMiddle(minimum, maximum);

        // Check percentage change between the old search value and the new search value to save on requests.
        // Commerical ranges are larger so we can be more generous with the percentage.
        if (buggerAllChange(minimum, searchValue, 99)) {
          if (isDevelopment()) {
            console.table({ search: searchValue.toLocaleString(), min: minimum.toLocaleString(), max: maximum.toLocaleString() });
            console.log(`Property ${id} found: $${searchValue.toLocaleString()} after ${i + 1} requests.`, roundUp(searchValue));
          }

          return roundUp(searchValue);
        }
      } else {
        maximum = searchValue;
        searchValue = getMiddle(minimum, maximum);

        // Check percentage change between the old search value and the new search value to save on requests.
        // Commerical ranges are larger so we can be more generous with the percentage.
        if (buggerAllChange(searchValue, maximum, 99)) {
          if (isDevelopment()) {
            console.table({ search: searchValue.toLocaleString(), min: minimum.toLocaleString(), max: maximum.toLocaleString() });
            console.log(`Property ${id} missing: $${minimum.toLocaleString()} after ${i + 1} requests.`, roundUp(minimum));
          }

          return roundUp(minimum);
        }
      }
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  console.log(`Failed to find property in ${maxRequests} requests`);
  return roundUp(searchValue);
};
