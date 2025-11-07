import mapBannerStyles from 'data-text:../mapBanner.css';
import type { PlasmoCSConfig, PlasmoCSUIProps, PlasmoGetInlineAnchorList, PlasmoGetStyle } from 'plasmo';
import { MapBanner } from '~components/mapBanner';
import { getPrice } from '~services/realestateService';

export const config: PlasmoCSConfig = {
  matches: ['https://www.realestate.com.au/*']
};

export const getStyle: PlasmoGetStyle = () => {
  const style = document.createElement('style');
  style.textContent = mapBannerStyles;
  return style;
};

export const getInlineAnchorList: PlasmoGetInlineAnchorList = async () => document.querySelectorAll<HTMLElement>('[class*=Styles__StyledCard]');

const styleOverrides = (element: Element) => {
  const host = element as HTMLElement;
  if (host) {
    // Override bottom border so banner looks like part of the card
    host.style.borderRadius = '0.75rem 0.75rem 0 0';
  }

  const parent = host.parentElement as HTMLElement | null;
  if (parent) {
    // Override heights to prevent cropping of the card
    parent.style.height = 'auto';
  }

  const imageContainer = host.querySelector<HTMLElement>('[class*=Styles__ImageContainer]');
  if (imageContainer) {
    // Add heights to images so it fills the container
    imageContainer.style.height = 'auto';
  }
};

const MapBannerRealestate = ({ anchor }: PlasmoCSUIProps) => {
  return (
    <MapBanner
      anchor={anchor}
      fetchPrice={getPrice}
      isProjectUrl={url => url.toLocaleLowerCase().includes('/project/')}
      containerStyleOverrides={styleOverrides}
    />
  );
};

export default MapBannerRealestate;
