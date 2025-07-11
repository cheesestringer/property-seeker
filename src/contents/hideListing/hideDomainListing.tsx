import hideListingStyles from 'data-text:./hideListing.css';
import type { PlasmoCSConfig, PlasmoGetInlineAnchorList, PlasmoGetStyle } from 'plasmo';
import { HideListing } from '~components/hideListing';

export const config: PlasmoCSConfig = {
  matches: ['https://www.domain.com.au/*']
};

export const getStyle: PlasmoGetStyle = () => {
  const style = document.createElement('style');
  style.textContent = hideListingStyles;
  return style;
};

export const getInlineAnchorList: PlasmoGetInlineAnchorList = async () => {
  const elements = [...document.querySelectorAll<HTMLElement>('[data-testid="results"] > li')].filter(element => {
    if (element.getAttribute('data-testid').includes('adSpot')) {
      return false;
    }

    if (element.querySelector('[data-testid="listing-card-topspot"]')) {
      return false;
    }

    if (element.querySelector('[data-testid="listing-card-project"]')) {
      return false;
    }

    return true;
  });

  return elements.map(element => ({
    element: element,
    insertPosition: 'beforebegin'
  }));
};

const HideDomainListing = ({ anchor }) => {
  const element = anchor?.element as HTMLElement | null;
  return (
    <HideListing
      anchor={anchor}
      linkSelector={() => element?.querySelector('a')?.href}
      addressSelector={() => element?.querySelector(`[data-testid="address-wrapper"]`)?.textContent}
    />
  );
};

export default HideDomainListing;
