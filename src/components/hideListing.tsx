import logo from 'data-base64:../../assets/logo.svg';
import type { PlasmoCSUIProps } from 'plasmo';
import { useCallback, useEffect, useState, type FC } from 'react';
import { getBrowserCache, getCleanUrl, updateBrowserCache } from '~common';
import { propertySeeker } from '~constants';

const setVisibility = (element: HTMLElement, isVisible: boolean) => {
  element.style.display = isVisible ? 'none' : 'list-item';
};

const HideContainer = ({ toggleListing }: { toggleListing: () => void }) => (
  <div className="container container--hide">
    <button className="button button--hide" onClick={toggleListing} aria-label="Hide listing" aria-pressed="false">
      Hide
    </button>
  </div>
);

const ShowContainer = ({ toggleListing, address }: { toggleListing: () => void; address: string }) => (
  <div className="container container--show">
    <img src={logo} className="logo" alt={propertySeeker + ' logo'} title={propertySeeker} />
    <span className="heading">{`Hidden | ${address ?? 'Unlisted address'}`}</span>
    <button className="button" onClick={toggleListing} aria-label="Show listing" aria-pressed="true">
      Show
    </button>
  </div>
);

interface HideListingCSUIProps extends PlasmoCSUIProps {
  linkSelector: () => string | null;
  addressSelector: () => string | null;
}

export const HideListing: FC<HideListingCSUIProps> = ({ anchor, linkSelector, addressSelector }) => {
  const { element } = anchor;
  const [cacheKey, setCacheKey] = useState('');
  const [hidden, setHidden] = useState(false);
  const [address, setAddress] = useState('');

  useEffect(() => {
    const link = linkSelector();
    if (!link) {
      return;
    }

    const key = getCleanUrl(link);
    setCacheKey(key);

    const address = addressSelector();
    setAddress(address);

    getBrowserCache(key).then(cache => {
      const isHidden = cache?.hidden ?? false;
      setHidden(isHidden);
      setVisibility(element as HTMLElement, isHidden);
    });
  }, [element]);

  const toggleListing = useCallback(async () => {
    const toggle = !hidden;
    setHidden(toggle);
    setVisibility(element as HTMLElement, toggle);

    await updateBrowserCache(cacheKey, cache => {
      cache.hidden = toggle;
      return cache;
    });
  }, [hidden, element, cacheKey]);

  return hidden ? <ShowContainer toggleListing={toggleListing} address={address} /> : <HideContainer toggleListing={toggleListing} />;
};
