import logo from 'data-base64:../../assets/logo.svg';
import type { PlasmoCSUIProps } from 'plasmo';
import { useEffect, useState, type FC } from 'react';
import { getCleanUrl } from '~common';
import { propertySeeker, seeking } from '~constants';
import { useIntersectionObserver } from '~hooks/useObserver';
import { getPrice } from '~services/realestateService';
import { PropertyInsights } from './propertyInsights';
import { ViewOnGitHub } from './viewOnGitHub';
import { ViewOnMaps } from './viewOnMaps';
import { ViewOnPropertyInsights } from './viewOnPropertyInsights';
import { WalkScore } from './walkScore';

export const Realestate: FC<PlasmoCSUIProps> = ({ anchor }) => {
  const { element } = anchor;
  const [isVisible, containerRef] = useIntersectionObserver<HTMLDivElement>();

  const [cacheKey, setCacheKey] = useState<string>(null);
  const [range, setRange] = useState<string>(null);

  useEffect(() => {
    if (isVisible) {
      handleListing();
    }
  }, [isVisible]);

  const getListingPrice = async (href: string) => {
    try {
      const cleanUrl = getCleanUrl(href);

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

    // Handle list listings
    if (element.className === 'residential-card__content') {
      const link = element.querySelector<HTMLAnchorElement>('.residential-card__address-heading > a');
      if (!link?.href) {
        return;
      }

      getListingPrice(link.href);
    }
  };

  const listAddress = element.querySelector(`[class='residential-card__address-heading']`)?.textContent;
  const propertyAddress = document.querySelector(`[class='property-info-address']`)?.textContent;
  const mapAddress = element.querySelector(`[class*='Styles__AddressLink']`)?.textContent;
  const address = listAddress ?? propertyAddress ?? mapAddress;

  return (
    <div className="card" onClick={e => e.stopPropagation()} ref={containerRef}>
      <div className="card-header">
        <img className="logo" src={logo} alt={propertySeeker + ' logo'} title={propertySeeker} />
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
          <PropertyInsights cacheKey={cacheKey} address={address} />
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
