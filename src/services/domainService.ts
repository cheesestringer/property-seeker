import { buggerAllChange, getMiddle, isDevelopment, roundDown, roundUp } from '~common';

// Search won't work if the filter value exceeds what's available on the UI
const getFilterMax = (value: number) => {
  return value > 5 ? `5-any` : `${value}-${value}`;
};

export const getFilter = (summary: ListingSummary, street: string): string => {
  let filter = summary ? `&bedrooms=${getFilterMax(summary.beds)}` : '';
  filter += summary.baths ? `&bathrooms=${getFilterMax(summary.baths)}` : '';
  filter += summary.parking ? `&carspaces=${getFilterMax(summary.parking)}` : '';
  if (summary.mode === 'buy' && summary.status !== 'underOffer') {
    filter += '&excludeunderoffer=1';
  }
  filter += '&ssubs=0';
  if (street) {
    filter += `&street=${street.toLocaleLowerCase()}`;
  }
  return filter;
};

export const getPropertyType = (value: string) => {
  const type = value?.toLocaleLowerCase();
  if (type === 'house') {
    return 'house';
  }

  if (type === 'new house & land') {
    return 'new-house-land';
  }

  if (type === 'new home designs') {
    return 'new-home-designs';
  }

  if (type === 'terrace') {
    return type;
  }

  if (type === 'villa') {
    return type;
  }

  if (type === 'duplex') {
    return type;
  }

  if (type === 'semi-detached') {
    return type;
  }

  if (type.includes('new apartments')) {
    return 'new-apartments';
  }

  if (type === 'apartment / unit / flat') {
    return 'apartment-unit-flat';
  }

  if (type === 'studio') {
    return type;
  }

  if (type === 'penthouse') {
    return 'pent-house';
  }

  if (type === 'block of units') {
    return 'block-of-units';
  }

  if (type === 'townhouse') {
    return 'town-house';
  }

  if (type === 'acreage / semi-rural') {
    return 'acreage-semi-rural';
  }

  if (type === 'vacant land') {
    return 'vacant-land';
  }

  if (type === 'new land') {
    return 'new-land';
  }

  if (type === 'development site') {
    return 'development-site';
  }

  console.warn('Unhandled property type', type);
  return null;
};

export const getPropertyDetails = async (url: string): Promise<PropertyResponse> => {
  try {
    const response = await fetch(url, {
      headers: { accept: 'application/json' }
    });

    if (!response.ok) {
      throw new Error(`${response.status}`);
    }

    return (await response.json()) as PropertyResponse;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const getPrice = async (id: number, mode: string, type: string, location: string, filter: string, signal: AbortSignal): Promise<number> => {
  // TODO: Need to fix properties that exist outside of the max
  let minimum = 50_000;
  let maximum = 30_000_000;
  let searchValue = getMiddle(minimum, maximum);

  const maxRequests = 14;
  for (let i = 0; i < maxRequests; i++) {
    const url = `${window.location.origin}/${mode}/${location}/${type}/?price=${searchValue}-${maximum}${filter}`;
    try {
      const response = await fetch(url, {
        headers: { accept: 'application/json' },
        signal
      });

      if (!response.ok) {
        throw new Error(`${response.status}`);
      }

      const data = (await response.json()) as SearchResponse;
      if (data.props.listingSearchResultIds.includes(id)) {
        minimum = searchValue;
        searchValue = getMiddle(minimum, maximum);

        // Check percentage change between the old search value and the new search value to save on requests
        if (buggerAllChange(minimum, searchValue)) {
          if (isDevelopment()) {
            console.table({ search: searchValue.toLocaleString(), min: minimum.toLocaleString(), max: maximum.toLocaleString() });
            console.log(`Property ${id} found: $${searchValue.toLocaleString()} after ${i + 1} requests.`, roundUp(searchValue));
          }

          return roundUp(searchValue);
        }
      } else {
        maximum = searchValue;
        searchValue = getMiddle(minimum, maximum);

        // Check percentage change between the old search value and the new search value to save on requests
        if (buggerAllChange(searchValue, maximum)) {
          if (isDevelopment()) {
            console.table({ search: searchValue.toLocaleString(), min: minimum.toLocaleString(), max: maximum.toLocaleString() });
            console.log(`Property ${id} missing: $${maximum.toLocaleString()} after ${i + 1} requests.`, roundDown(maximum));
          }

          return roundDown(maximum);
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
