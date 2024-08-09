import logo from 'data-base64:../../assets/logo.svg';
import type { PlasmoCSUIProps } from 'plasmo';
import { useEffect, useState, type FC } from 'react';
import { propertySeeker, seeking } from '~constants';
import { getPrice } from '~services/realestateService';

export const Realestate: FC<PlasmoCSUIProps> = ({ anchor }) => {
  const [message, setMessage] = useState('');
  const [range, setRange] = useState<string>(null);

  useEffect(() => {
    handleListing();
  }, []);

  const getListingPrice = async (url: string) => {
    try {
      if (url.toLocaleLowerCase().includes('/project/')) {
        setMessage('Projects not supported');
        return;
      }

      const price = await getPrice(url);
      setRange(price);
    } catch (error) {
      setMessage('Failed to get price 😵');
    }
  };

  const handleListing = async () => {
    const { element } = anchor;

    // Handle property listings
    if (element.className === 'property-info__middle-content') {
      getListingPrice(element.baseURI);
      return;
    }

    // Handle map listings
    if (element.className.includes('Styles__HeadlineText')) {
      const link = element.parentElement.querySelector<HTMLAnchorElement>('a');
      const url = new URL(link.href);
      getListingPrice(url.origin + url.pathname);
      return;
    }

    // Handle list listings
    if (element.className === 'residential-card__title') {
      const link = element.parentElement.querySelector<HTMLAnchorElement>('.residential-card__address-heading > a');
      if (!link?.href) {
        return;
      }

      const observer = new IntersectionObserver(async entries => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            observer.disconnect();
            getListingPrice(link.href);
          }
        }
      });

      observer.observe(anchor.element);
    }
  };

  return (
    <div className="container">
      <img className="logo" src={logo} alt={propertySeeker} title={propertySeeker} />
      {message && <span className="message">{message}</span>}
      {!message && <span className="price">{range ? range : seeking}</span>}
    </div>
  );
};
