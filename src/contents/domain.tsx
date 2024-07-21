import logo from 'data-base64:../../assets/logo.svg';
import styleText from 'data-text:./domain.css';
import type { PlasmoCSConfig, PlasmoCSUIProps, PlasmoGetInlineAnchor, PlasmoGetInlineAnchorList, PlasmoGetStyle } from 'plasmo';
import { useEffect, useState, type FC } from 'react';
import { cachePrice, getCachedPrice } from '~common';
import { getFilter, getPrice, getPropertyDetails, getPropertyType } from '~services/domainService';

export const config: PlasmoCSConfig = {
  matches: ['https://www.domain.com.au/*'],
  exclude_matches: ['https://www.domain.com.au/rent/*']
};

export const getInlineAnchor: PlasmoGetInlineAnchor = async () => document.querySelector<HTMLElement>('[data-testid*="summary-title"]');

export const getInlineAnchorList: PlasmoGetInlineAnchorList = async () => document.querySelectorAll<HTMLElement>('p[data-testid="listing-card-price"]');

export const getStyle: PlasmoGetStyle = () => {
  const style = document.createElement('style');
  style.textContent = styleText;
  return style;
};

const Domain: FC<PlasmoCSUIProps> = ({ anchor }) => {
  const [message, setMessage] = useState('');
  const [range, setRange] = useState<number>(null);
  const [propertyListing, setPropertyListing] = useState(false);
  const controller = new AbortController();

  useEffect(() => {
    handleListing();
  }, []);

  const handleListing = async () => {
    const { element } = anchor;
    const testid = element.attributes.getNamedItem('data-testid').value;
    if (testid === 'listing-details__listing-summary-title-name') {
      setPropertyListing(true);
      setMessage(`Projects not supported`);
      return;
    }

    if (testid === 'listing-details__summary-title') {
      setPropertyListing(true);
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

  const getPropertyPrice = async (url: string): Promise<number> => {
    const parsedId = url.split('-').pop();
    const cachedPrice = getCachedPrice(parsedId);
    if (cachedPrice) {
      return cachedPrice;
    }

    const details = await getPropertyDetails(url);
    if (details == null) {
      return;
    }

    const {
      props: { id, listingSummary, street, footer }
    } = details;

    const type = getPropertyType(listingSummary.propertyType);
    if (!type) {
      setMessage(`Unhandled property type '${listingSummary.propertyType}'`);
      return;
    }

    const searchMode = listingSummary.mode === 'buy' ? 'sale' : 'sold-listings';
    const filter = getFilter(listingSummary, street);
    const price = await getPrice(id, searchMode, type, footer.suburb.slug, filter, controller.signal);

    // If the price is below 60k don't bother caching since something is probably wrong
    if (price > 60_000) {
      cachePrice(id, price);
    }

    return price;
  };

  return (
    <div className={propertyListing ? 'container property' : 'container listing'}>
      <img className="logo" src={logo} alt="Property Seeker" title="Property Seeker" />
      {message && <span className="message">{message}</span>}
      {!message && (
        <span className="price">{range ? range.toLocaleString('en-AU', { style: 'currency', currency: 'AUD', minimumFractionDigits: 0 }) : 'Seeking...'}</span>
      )}
    </div>
  );
};

export default Domain;
