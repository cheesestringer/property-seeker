import hideListingStyles from 'data-text:../hideListing.css';
import hideRealestateListingStyles from 'data-text:./hideRealestateListing.css';
import type { PlasmoCSConfig, PlasmoGetInlineAnchorList, PlasmoGetStyle } from 'plasmo';
import { HideListing } from '~components/hideListing';

export const config: PlasmoCSConfig = {
  matches: ['https://www.realestate.com.au/*']
};

export const getStyle: PlasmoGetStyle = () => {
  const style = document.createElement('style');
  style.textContent = hideListingStyles + hideRealestateListingStyles;
  return style;
};

export const getInlineAnchorList: PlasmoGetInlineAnchorList = async () => {
  const elements = [...document.querySelectorAll<HTMLElement>('.tiered-results--exact > li')].filter(element => {
    if (!element) {
      return false;
    }
    const child = element.firstElementChild as HTMLElement;
    if (!child) {
      return false;
    }

    if (child.className.includes('CarouselPlaceholder') || child.className.includes('CarouselContainer')) {
      return false;
    }

    if (child.nodeName === 'ASIDE') {
      return false;
    }

    return true;
  });

  return elements.map(element => ({
    element: element,
    insertPosition: 'beforebegin'
  }));
};

const HideRealestateListing = ({ anchor }) => {
  const element = anchor?.element as HTMLElement | null;
  return (
    <HideListing
      anchor={anchor}
      linkSelector={() => element?.querySelector('a')?.href}
      addressSelector={() => element?.querySelector('a')?.textContent}
    />
  );
};

export default HideRealestateListing;
