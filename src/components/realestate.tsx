import logo from 'data-base64:../../assets/logo.svg';
import type { PlasmoCSUIProps } from 'plasmo';
import { useEffect, useState, type FC } from 'react';
import { propertySeeker, seeking } from '~constants';
import { getPrice } from '~services/realestateService';
import { PropertyInsights } from './propertyInsights';
import { ViewOnGitHub } from './viewOnGitHub';
import { ViewOnMaps } from './viewOnMaps';
import { ViewOnPropertyInsights } from './viewOnPropertyInsights';
import { WalkScore } from './walkScore';

export const Realestate: FC<PlasmoCSUIProps> = ({ anchor }) => {
  const { element } = anchor;
  const [cacheKey, setCacheKey] = useState<string>(null);
  const [range, setRange] = useState<string>(null);

  useEffect(() => {
    handleListing();
  }, []);

  const getListingPrice = async (href: string) => {
    try {
      const url = new URL(href);
      const cleanUrl = url.origin + url.pathname;

      if (cleanUrl.toLocaleLowerCase().includes('/project/')) {
        setRange('Projects not supported');
        return;
      }

      setCacheKey(cleanUrl);
      const price = await getPrice(cleanUrl);
      setRange(price ?? 'Unavailable');
    } catch (error) {
      setRange('Failed to get price 😵');
    }
  };

  const handleListing = async () => {
    // Handle property listings
    if (element.className === 'property-info__middle-content') {
      getListingPrice(element.baseURI);
      return;
    }

    // Handle map listings
    if (element.className.includes('Styles__StyledCard')) {
      const link = element.querySelector<HTMLAnchorElement>('a');
      getListingPrice(link.href);
      return;
    }

    if (element.className === 'residential-card__content') {
      const link = element.querySelector<HTMLAnchorElement>('.residential-card__address-heading > a');
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

  const listAddress = element.querySelector(`[class='residential-card__address-heading']`)?.textContent;
  const propertyAddress = document.querySelector(`[class='property-info-address']`)?.textContent;
  const mapAddress = element.querySelector(`[class*='Styles__AddressLink']`)?.textContent;
  const address = listAddress ?? propertyAddress ?? mapAddress;

  return (
    <div className="card" onClick={e => e.stopPropagation()}>
      <div className="card-header">
        <img className="logo" src={logo} alt={propertySeeker} title={propertySeeker} />
        <span>Property Seeker</span>
      </div>
      <div className="card-body">
        <div className="items">
          <div className="item">
            <span className="item-label" title="The price range is extracted from the realestate.com.au property listing.">
              Price:
            </span>
            <span>{range ?? seeking}</span>
          </div>
          <div className="item">
            <PropertyInsights cacheKey={cacheKey} address={address} />
          </div>
        </div>
      </div>
      <div className="card-footer">
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
