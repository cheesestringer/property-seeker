import logo from 'data-base64:../../assets/logo.svg';
import type { PlasmoCSUIProps } from 'plasmo';
import { useEffect, useState, type FC } from 'react';
import { cachePrice, getCachedPrice, toCurrencyFormat } from '~common';
import { propertySeeker, seeking } from '~constants';
import { getFilter, getPrice, getPropertyDetails, getPropertyType } from '~services/domainService';
import { ViewOnMaps } from './viewOnMaps';
import { ViewOnPropertyInsights } from './viewOnPropertyInsights';

export const Domain: FC<PlasmoCSUIProps> = ({ anchor }) => {
  const { element } = anchor;
  const [message, setMessage] = useState('');
  const [range, setRange] = useState<number>(null);
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
    if (testid === 'listing-details__summary-title') {
      const price = await getPropertyPrice(element.baseURI);
      setRange(price);
      return;
    }

    const container = element.parentElement.parentElement;
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
            setRange(price);
          }
        }
      },
      { rootMargin: '-10px' }
    );

    observer.observe(container);
  };

  const getPropertyPrice = async (href: string): Promise<number> => {
    const url = new URL(href);
    const parsedId = url.pathname.split('-').pop();
    const cachedPrice = getCachedPrice(parsedId);
    if (cachedPrice) {
      return cachedPrice;
    }

    const details = await getPropertyDetails(url.origin + url.pathname);
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
    cachePrice(id, price);

    return price;
  };

  // Only show the maps icon when a property has been selected
  const address = document.querySelector(`[data-testid='listing-details__button-copy-wrapper'] h1`)?.textContent;

  return (
    <div className="container" onClick={event => event.stopPropagation()}>
      <img className="logo" src={logo} alt={propertySeeker} title={propertySeeker} />
      {message && <span className="message">{message}</span>}
      {!message && <span className="price">{range ? toCurrencyFormat(range) : seeking}</span>}
      <ViewOnPropertyInsights address={address} />
      <ViewOnMaps address={address} />
    </div>
  );
};
