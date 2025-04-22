import logo from 'data-base64:../../assets/logo.svg';
import type { PlasmoCSUIProps } from 'plasmo';
import { useEffect, useState, type FC } from 'react';
import { cacheIsValid, getBrowserCache, toCurrencyFormat, updateBrowserCache } from '~common';
import { propertySeeker, seeking } from '~constants';
import { getFilter, getPrice, getPropertyDetails, getPropertyType } from '~services/domainService';
import { PropertyInsights } from './propertyInsights';
import { ViewOnGitHub } from './viewOnGitHub';
import { ViewOnMaps } from './viewOnMaps';
import { ViewOnPropertyInsights } from './viewOnPropertyInsights';
import { WalkScore } from './walkScore';

export const Domain: FC<PlasmoCSUIProps> = ({ anchor }) => {
  const { element } = anchor;
  const [message, setMessage] = useState('');
  const [cacheKey, setCacheKey] = useState<string>(null);
  const [range, setRange] = useState<string>(null);
  const controller = new AbortController();

  useEffect(() => {
    handleListing();
  }, []);

  const handleListing = async () => {
    const testid = element.attributes.getNamedItem('data-testid')?.value;
    if (testid === 'listing-details__listing-summary-title-name') {
      setMessage(`Projects not supported`);
      return;
    }

    // Handle property listings
    const listingSummary = element.querySelector<HTMLAnchorElement>('[data-testid="listing-details__summary-title"]');
    if (listingSummary) {
      const price = await getPropertyPrice(element.baseURI);
      setRange(toCurrencyFormat(price));
      return;
    }

    const container = element.parentElement;
    const link = container.querySelector('a');
    if (!link?.href) {
      setMessage(`Projects not supported`);
      return;
    }

    const observer = new IntersectionObserver(
      async entries => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            observer.disconnect();
            const price = await getPropertyPrice(link.href);
            setRange(toCurrencyFormat(price));
          }
        }
      },
      { rootMargin: '-10px' }
    );

    observer.observe(container);
  };

  const getPropertyPrice = async (href: string): Promise<number | string> => {
    const url = new URL(href);
    const cleanUrl = url.origin + url.pathname;
    setCacheKey(cleanUrl);

    const cache = await getBrowserCache(cleanUrl);
    if (cacheIsValid(cache.timestamp) && cache?.price) {
      return cache.price;
    }

    const details = await getPropertyDetails(cleanUrl);
    if (details == null) {
      return;
    }

    const {
      props: { id, listingSummary, street, footer }
    } = details;

    const type = getPropertyType(listingSummary.propertyType);
    if (!type) {
      setMessage(`Unhandled type '${listingSummary.propertyType}'`);
      return;
    }

    const searchMode = listingSummary.mode === 'buy' ? 'sale' : 'sold-listings';
    const filter = getFilter(listingSummary, street);
    const price = await getPrice(id, searchMode, type, footer.suburb.slug, filter, controller.signal);
    await updateBrowserCache(cleanUrl, cache => {
      cache.price = toCurrencyFormat(price);
      cache.timestamp = Date.now();
      return cache;
    });

    return price;
  };

  const address =
    document.querySelector(`[data-testid='listing-details__button-copy-wrapper'] h1`)?.textContent ??
    element.parentElement.parentElement.querySelector('[data-testid="address-wrapper"]')?.textContent;

  return (
    <div className="card" onClick={e => e.stopPropagation()}>
      <div className="card-header">
        <img className="logo" src={logo} alt={propertySeeker} title={propertySeeker} />
        <span>Property Seeker</span>
      </div>
      <div className="card-body">
        <div className="items">
          <div className="item">
            <span className="item-label" title="The price range is automatically calculated using Domain's price sliders.">
              Price:
            </span>
            <span>{range ?? seeking}</span>
          </div>
          <div className="item extra">
            <PropertyInsights cacheKey={cacheKey} address={address} />
          </div>
        </div>
      </div>
      <div className="card-footer">
        <span className="tiny">View the property for more insights.</span>
        <WalkScore cacheKey={cacheKey} address={address} />
        <div className="links">
          <ViewOnPropertyInsights address={address} />
          <ViewOnMaps address={address} />
          <ViewOnGitHub />
        </div>
      </div>
    </div>
  );
};
