import { cacheIsValid, getBrowserCache, updateBrowserCache } from '~common';
import { sevenDaysInMs } from '~constants';

// Avoid async until https://issues.chromium.org/issues/40753031 is fixed.
chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request.type === 'getPropertyInsights') {
    getPropertyInsights(request.cacheKey, request.address).then(data => {
      sendResponse(data);
    });
  }

  if (request.type === 'getWalkScore') {
    getWalkScore(request.cacheKey, request.address).then(data => {
      sendResponse(data);
    });
  }

  return true;
});

const getPropertyInsights = async (cacheKey: string, address: string) => {
  try {
    console.log(`Get property insights for ${address}`);

    const cache = await getBrowserCache(cacheKey);
    if (cacheIsValid(cache?.propertyTimestamp, sevenDaysInMs) && cache?.propertyUrl) {
      console.log('Using cached property insights');
      return {
        value: cache.propertyValue,
        confidence: cache.propertyConfidence,
        url: cache.propertyUrl
      };
    }

    const suggestion = await getSuggestedAddress(address);
    if (suggestion === null) {
      return null;
    }

    // Suggestions include a realestate.com.au url but we want the property.com.au url.
    // Try to manually create the Property url.
    const propertyUrl = getPropertyUrl(suggestion);
    const response = await fetch(propertyUrl);
    const data = await response.text();

    // TODO: Getting node:buffer errors when using cheerio so use regex for now
    const valueRegex = /data-testid="valuation-sub-brick-price-text"[^>]*>([\s\S]*?)<\/[^>]+>/;
    const valueConfidenceRegex = /data-testid="valuation-sub-brick-confidence"[^>]*>([\s\S]*?)<\/[^>]+>/;

    const valueMatch = data.match(valueRegex);
    const valueConfidenceMatch = data.match(valueConfidenceRegex);

    const property = {
      value: valueMatch?.[1],
      confidence: valueConfidenceMatch?.[1],
      url: response.url
    };

    await updateBrowserCache(cacheKey, cache => {
      cache.propertyValue = property.value;
      cache.propertyConfidence = property.confidence;
      cache.propertyUrl = property.url;
      cache.propertyTimestamp = Date.now();
      return cache;
    });

    return property;
  } catch (error) {
    console.log('Failed to get property data', address, error);
  }
};

const getSuggestedAddress = async (address: string): Promise<Suggestion> => {
  const addressStreetNumber = address.split(' ')[0].trim();

  const firstAttemptResponse = await fetch(
    `https://suggest.realestate.com.au/consumer-suggest/suggestions?max=6&type=address&src=property-seeker&query=${encodeURIComponent(address)}`
  );
  const firstAttemptData = (await firstAttemptResponse.json()) as SuggestionResponse;
  if (firstAttemptData._embedded?.suggestions?.length) {
    const { streetNumber } = firstAttemptData._embedded.suggestions[0].source;

    // Check the street number is correct. The street number for apartments includes the unit and building number.
    if (streetNumber.includes(addressStreetNumber)) {
      return firstAttemptData._embedded.suggestions[0];
    }
  }

  console.log('No first round suggestions found for address', address);

  // If the suburb is generic on the listing, e.g. Sydney instead of Ultimo, suggestions don't work.
  // Try to search for the street number and name instead.
  const secondAddress = address.split(',')[0];
  const secondAttemptResponse = await fetch(
    `https://suggest.realestate.com.au/consumer-suggest/suggestions?max=6&type=address&src=property-seeker&query=${encodeURIComponent(secondAddress)}`
  );
  const secondAttemptData = (await secondAttemptResponse.json()) as SuggestionResponse;
  if (secondAttemptData._embedded?.suggestions?.length) {
    const { streetNumber, state } = secondAttemptData._embedded.suggestions[0].source;

    // Check the street number is correct. The street number for apartments includes the unit and building number.
    // Since we only used the street number and name, check the best match is in the same state.
    if (streetNumber.includes(addressStreetNumber) && address.toLocaleLowerCase().includes(state.toLocaleLowerCase())) {
      return secondAttemptData._embedded.suggestions[0];
    }
  }

  console.log('No second round suggestions found for address', secondAddress);

  // Address isn't an aparment so it can skip the third attempt
  if (!address.includes('/')) {
    return null;
  }

  // Some apartments might not be listed on Property yet, so try the building instead.
  // This allows us to at least link to the building for more insights.
  const thirdAddress = address.substring(address.indexOf('/') + 1);
  const thirdAttemptResponse = await fetch(
    `https://suggest.realestate.com.au/consumer-suggest/suggestions?max=6&type=address&src=property-seeker&query=${encodeURIComponent(thirdAddress)}`
  );
  const thirdAttemptData = (await thirdAttemptResponse.json()) as SuggestionResponse;
  if (thirdAttemptData._embedded?.suggestions?.length) {
    // The building might be the the first suggestion so search for a matching street number
    const suggestion = thirdAttemptData._embedded.suggestions.find(x => x.source.streetNumber.includes(addressStreetNumber));
    if (suggestion) {
      return suggestion;
    }
  }

  console.log('No third round suggestions found for address', thirdAddress);
  return null;
};

const getPropertyUrl = (suggestion: Suggestion) => {
  if (!suggestion) {
    return null;
  }

  const {
    id,
    source: { state, suburb, postcode, streetName, streetNumber }
  } = suggestion;
  // Property has some nice auto address fixing redirects but try some best effort matching to reduce the calls.
  const fixedSuburb = suburb.replace(/ /g, '-').toLocaleLowerCase();
  const fixedStreetName = streetName.replace(/ /g, '-').toLocaleLowerCase();
  const fixedStreetNumber = streetNumber.replace(/\//g, '-').toLocaleLowerCase();

  return `https://www.property.com.au/${state.toLocaleLowerCase()}/${fixedSuburb}-${postcode}/${fixedStreetName}/${fixedStreetNumber}-pid-${id}/`;
};

const getWalkScore = async (cacheKey: string, address: string) => {
  try {
    console.log(`Get walk score for ${address}`);

    const cache = await getBrowserCache(cacheKey);
    if (cacheIsValid(cache?.walkScoreTimestamp, sevenDaysInMs) && cache?.walkScore) {
      console.log('Using cached walk score');
      return {
        walkScore: cache.walkScore,
        transportScore: cache?.transportScore, // Transport score isn't gauranteed
        url: cache.walkScoreUrl
      };
    }

    // Remove unit numbers, remove commas, replace spaces with dashes, and convert to lowercase
    const fixedAddress = address
      .substring(address.indexOf('/') + 1)
      .split(',')
      .join('')
      .split(' ')
      .join('-')
      .toLocaleLowerCase();
    const response = await fetch(`https://www.walkscore.com/score/${encodeURIComponent(fixedAddress)}`);
    const data = await response.text();

    const walkScoreRegex = /\/walk\/score\/(\d+)\.svg/;
    const transportScoreRegex = /\/transit\/score\/(\d+)\.svg/;
    const walkScoreMatch = walkScoreRegex.exec(data);
    const transportScoreMatch = transportScoreRegex.exec(data);

    await updateBrowserCache(cacheKey, cache => {
      cache.walkScore = walkScoreMatch?.[1];
      cache.transportScore = transportScoreMatch?.[1];
      cache.walkScoreUrl = response.url;
      cache.walkScoreTimestamp = Date.now();
      return cache;
    });

    return {
      walkScore: walkScoreMatch?.[1],
      transportScore: transportScoreMatch?.[1],
      url: response.url
    };
  } catch (error) {
    console.log('Failed to get walk score', address, error);
  }
};
