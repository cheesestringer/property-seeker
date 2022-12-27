chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    handleScriptInjection(tab);
  }
});

const handleScriptInjection = tab => {
  chrome.tabs.executeScript(
    tab.id,
    {
      code: 'var injected = window.seekerInjected; window.seekerInjected = true; injected;'
    },
    async response => {
      // Already injected
      if (response[0]) {
        if (tab.url.toLowerCase().includes(constants.domainHost)) {
          getDomainRange(tab);
        } else {
          getRealEstateRange(tab);
        }
      } else {
        if (tab.url.toLowerCase().includes(constants.domainHost)) {
          chrome.tabs.executeScript(tab.id, { file: 'domain.js' }, () => getDomainRange(tab));
        } else {
          chrome.tabs.executeScript(tab.id, { file: 'realestate.js' }, () => getRealEstateRange(tab));
        }
      }
    }
  );
};

const getRealEstateRange = async tab => {
  try {
    const url = tab.url.toLowerCase();

    // Not viewing a property
    if (url.includes('/buy/') || url.includes('/rent/') || url.includes('/sold/') || url.includes('/property/')) {
      return;
    }

    const response = await fetch(tab.url);
    const text = await response.text();
    const doc = new DOMParser().parseFromString(text, 'text/html');

    const nodes = doc.querySelectorAll('script');
    for (const node of nodes) {
      if (node.innerText.includes('marketing_price_range')) {
        const text = node.innerText.split(`marketing_price_range`)[1];
        const cleaned = text.replace(/\\/g, '');
        const first = cleaned.split(`":"`)[1];
        const second = first.split(`",`)[0];
        const price = second.split('_');
        chrome.tabs.sendMessage(tab.id, {
          message: 'update',
          url: tab.url,
          price: price
        });
      }
    }
  } catch (exception) {
    console.log(exception);
  }
};

const constants = {
  domainHost: 'https://www.domain.com.au/',
  buy: 'buy',
  sold: 'sold'
};

const getDomainRange = async tab => {
  const url = tab.url.toLowerCase();

  // Not viewing a property
  if (url === constants.domainHost || url.includes('/sale/')) {
    return;
  }

  try {
    const {
      props: { id, listingSummary, map }
    } = await fetchJson(tab.url);

    // Ignore rentals
    const mode = listingSummary.mode.toLowerCase();
    if (mode !== constants.buy && mode !== constants.sold) {
      return;
    }

    let filter = listingSummary.beds ? `&bedrooms=${getFilterMax(listingSummary.beds)}` : '';
    filter += listingSummary.baths ? `&bathrooms=${getFilterMax(listingSummary.baths)}` : '';
    filter += listingSummary.parking ? `&carspaces=${getFilterMax(listingSummary.parking)}` : '';
    if (mode === constants.buy && listingSummary.status !== 'underOffer') {
      filter += '&excludeunderoffer=1';
    }
    filter += '&ssubs=0';

    const location = map.suburbProfileUrl.split('/').pop();
    const type = getPropertyType(listingSummary.propertyType);
    if (!type) {
      console.log('Unhandled property type: ', listingSummary.propertyType);
      return;
    }

    // Seems like domain sets the lower range to 0 so we only need to calculate the upper range
    const searchMode = mode === constants.buy ? 'sale' : 'sold-listings';
    const maxPrice = await getMaxPrice(id, searchMode, location, type, filter);

    chrome.tabs.sendMessage(tab.id, {
      message: 'update',
      url: tab.url,
      price: `$${maxPrice.toLocaleString()}`
    });
  } catch (exception) {
    console.log(`Failed to find price for ${tab.url}`, exception);
  }
};

// Domain search breaks when the property value exceeds what's available on the filter UI
const getFilterMax = value => {
  return value > 5 ? `5-any` : `${value}-${value}`;
};

const getMaxPrice = async (id, mode, location, type, query) => {
  let minimum = 50000;
  let maximum = 12000000;
  let searchValue = getMiddle(minimum, maximum);

  for (let i = 0; i < 12; i++) {
    const data = await fetchJson(`${constants.domainHost}${mode}/${location}/${type}/?price=${searchValue}-${maximum}${query}`);
    if (data.props.listingSearchResultIds.includes(id)) {
      minimum = searchValue;
      searchValue = getMiddle(searchValue, maximum);

      // Check percentage change to save on requests
      if (buggerAllChange(minimum, searchValue)) {
        console.log(`Property ${id} found: $${minimum.toLocaleString()} found after ${i + 1} requests.`);
        return roundUp(minimum);
      }
    } else {
      maximum = searchValue;
      searchValue = getMiddle(minimum, searchValue);

      // Check percentage change to save on requests
      if (buggerAllChange(searchValue, maximum)) {
        console.log(`Property ${id} missing: $${maximum.toLocaleString()} found after ${i + 1} requests.`);
        return roundDown(maximum);
      }
    }
  }

  return roundUp(searchValue);
};

const fetchJson = async url => {
  const response = await fetch(url, {
    headers: { accept: 'application/json' }
  });
  return response.json();
};

const getPropertyType = value => {
  const type = value && value.toLowerCase();
  if (type === 'house') {
    return 'house';
  }

  if (type.includes('apartment')) {
    return 'apartment';
  }

  if (type === 'townhouse') {
    return 'town-house';
  }

  return null;
};

const getMiddle = (lower, upper) => {
  return Math.round((lower + upper) / 2);
};

const buggerAllChange = (first, second) => {
  return (first / second) * 100 > 98;
};

const roundUp = value => {
  return Math.ceil(value / 100000) * 100000;
};

const roundDown = value => {
  return Math.floor(value / 100000) * 100000;
};
