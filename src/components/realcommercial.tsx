import logo from 'data-base64:../../assets/logo.svg';
import type { PlasmoCSUIProps } from 'plasmo';
import { useEffect, useState, type FC } from 'react';
import { cacheIsValid, getBrowserCache } from '~common';
import { propertySeeker, seeking } from '~constants';
import { useIntersectionObserver } from '~hooks/useObserver';
import { getAndCachePrice, getProperty } from '~services/realcommercialService';
import { DaysSince } from './daysSince';
import { PropertyInsights } from './propertyInsights';
import { ViewOnGitHub } from './viewOnGitHub';
import { ViewOnMaps } from './viewOnMaps';
import { ViewOnPropertyInsights } from './viewOnPropertyInsights';
import { WalkScore } from './walkScore';

export const Realcommercial: FC<PlasmoCSUIProps> = ({ anchor }) => {
  const { element } = anchor;
  const [isVisible, containerRef] = useIntersectionObserver<HTMLDivElement>();

  const [range, setRange] = useState<string>();
  const [cacheKey, setCacheKey] = useState<string>();
  const [listedDate, setListedDate] = useState<string>(null);
  const [updatedDate, setUpdatedDate] = useState<string>(null);

  const controller = new AbortController();

  useEffect(() => {
    if (isVisible) {
      handleListing();
    }
  }, [isVisible]);

  const getPropertyPrice = async (href: string) => {
    try {
      const url = new URL(href);
      const cleanUrl = url.origin + url.pathname;
      setCacheKey(cleanUrl);

      const cache = await getBrowserCache(cleanUrl);
      if (cacheIsValid(cache.timestamp) && cache?.price) {
        setListedDate(cache.listedDate);
        setUpdatedDate(cache.updatedDate);
        setRange(cache.price);
        return;
      }

      const parsedId = cleanUrl.split('-').pop();
      const details = await getProperty(cleanUrl, parsedId);
      setListedDate(details?.listedAt);
      setUpdatedDate(details?.listing?.lastUpdatedAt);

      const price = await getAndCachePrice(cleanUrl, details, controller.signal);
      setRange(price);
    } catch (error) {
      setRange('Failed to get price 😵');
    }
  };

  const handleListing = async () => {
    // Handle property listings
    if (element.className.includes('PriceBar_wrapper')) {
      await getPropertyPrice(element.baseURI);
      return;
    }

    // Handle list listings
    if (element.className.includes('Footer_actionBar')) {
      const href = element.querySelector<HTMLAnchorElement>('a')?.href;
      await getPropertyPrice(href);
      return;
    }

    // TODO: Handle map views
  };

  const address =
    element?.parentElement?.querySelector('[class*="Address_container"]')?.textContent ??
    element?.parentElement?.parentElement?.querySelector('[class*="Address_wrapper"]')?.textContent;

  return (
    <div className="card" ref={containerRef}>
      <div className="card-header">
        <img className="logo" src={logo} alt={propertySeeker} title={propertySeeker} />
        <span>Property Seeker</span>
      </div>
      <div className="card-body">
        <div className="items">
          <div className="item">
            <span className="item-label" title="The price range is automatically calculated using the price sliders.">
              Price:
            </span>
            <span>{range ?? seeking}</span>
          </div>
          <div className="item extra">
            <PropertyInsights cacheKey={cacheKey} address={address} retail={false} />
          </div>
          <div className="item extra">
            <DaysSince name="Listed" date={listedDate} />
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
