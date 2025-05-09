import hideListingStyles from 'data-text:./hideListing.css';
import hideListingRealestateStyles from 'data-text:./hideListingRealestate.css';
import type { PlasmoCSConfig, PlasmoGetInlineAnchorList, PlasmoGetStyle } from 'plasmo';
import { HideListing } from '~components/hideListing';

export const config: PlasmoCSConfig = {
  matches: ['https://www.realestate.com.au/*']
};

export const getStyle: PlasmoGetStyle = () => {
  const style = document.createElement('style');
  style.textContent = hideListingStyles + hideListingRealestateStyles;
  return style;
};

export const getInlineAnchorList: PlasmoGetInlineAnchorList = async () => {
  const elements = [...document.querySelectorAll<HTMLElement>('.tiered-results--exact > li')].filter(element => {
    if (!element) {
      return false;
    }
    const child = element.firstElementChild as HTMLElement;
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
  return (
    <HideListing
      anchor={anchor}
      linkSelector={() => anchor.element?.querySelector('a')}
      addressSelector={() => anchor.element?.querySelector('a')?.textContent}
    />
  );
};

export default HideRealestateListing;
