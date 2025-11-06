import logo from 'data-base64:../../assets/logo.svg';
import type { PlasmoCSUIProps } from 'plasmo';
import type { FC } from 'react';
import { useEffect, useState } from 'react';
import { priceFetchError, priceUnavailable, projectUnsupported, propertySeeker, seeking } from '~constants';

interface MapBannerCSUIProps extends PlasmoCSUIProps {
  fetchPrice: (url: string) => Promise<string>;
  isProjectUrl?: (url: string) => boolean;
  containerStyleOverrides: (element: Element) => void;
}

const LoadingBar = () => (
  <>
    <span className="map-banner__sr-only">{seeking}</span>
    <span className="map-banner__loading" aria-hidden="true">
      <span className="map-banner__loading-bar" />
    </span>
  </>
);

export const MapBanner: FC<MapBannerCSUIProps> = ({ anchor, fetchPrice, isProjectUrl = () => false, containerStyleOverrides }) => {
  const { element } = anchor;
  const [price, setPrice] = useState<string>(null);
  const [error, setError] = useState<string>(null);

  const url = element?.querySelector<HTMLAnchorElement>('a[href]')?.href ?? null;
  const isProject = url ? isProjectUrl(url) : false;

  useEffect(() => {
    if (!element) {
      return;
    }

    containerStyleOverrides(element);
  }, [element, containerStyleOverrides]);

  useEffect(() => {
    if (!url) {
      return;
    }

    if (isProject) {
      setPrice(projectUnsupported);
      setError(null);
      return;
    }

    setError(null);
    setPrice(null);

    const fetchPriceForListing = async () => {
      try {
        const result = await fetchPrice(url);
        setPrice(result ?? priceUnavailable);
      } catch (error) {
        console.warn('Failed to fetch price for banner', error);
        setError(priceFetchError);
      }
    };

    fetchPriceForListing();
  }, [url, isProject, fetchPrice]);

  const isLoading = Boolean(url && !price && !error);
  const displayPrice = error ?? price ?? seeking;

  return (
    <div className="map-banner__wrapper">
      <div className="map-banner">
        <img className="map-banner__logo" src={logo} alt={propertySeeker + ' logo'} title={propertySeeker} width={24} height={24} />
        <div className="map-banner__content">
          <span className="map-banner__title">{propertySeeker}</span>
          <a
            className="map-banner__price"
            aria-live="polite"
            href={url ?? undefined}
            target={url ? '_blank' : undefined}
            rel="noopener noreferrer">
            {isLoading ? <LoadingBar /> : displayPrice}
          </a>
        </div>
      </div>
    </div>
  );
};
