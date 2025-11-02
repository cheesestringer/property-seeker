import realcommercialStyles from 'data-text:../styles/realcommercial.css';
import styles from 'data-text:../styles/styles.css';
import type { PlasmoCSConfig, PlasmoGetInlineAnchorList, PlasmoGetShadowHostId, PlasmoGetStyle } from 'plasmo';
import { Realcommercial } from '~components/realcommercial';

export const config: PlasmoCSConfig = {
  matches: ['https://www.realcommercial.com.au/*']
};

export const getStyle: PlasmoGetStyle = () => {
  const style = document.createElement('style');
  style.textContent = styles + realcommercialStyles;
  return style;
};

export const getInlineAnchorList: PlasmoGetInlineAnchorList = async () => {
  const elements = [...document.querySelectorAll<HTMLElement>('[class*="Footer_actionBar"]')];
  return elements.map(element => ({
    element: element,
    insertPosition: 'beforebegin'
  }));
};

export const getShadowHostId: PlasmoGetShadowHostId = ({ element }) => {
  const container = element as HTMLElement | null;
  return container?.querySelector<HTMLAnchorElement>('a[href]')?.href;
};

const RealcommericalListing = ({ anchor }) => <Realcommercial anchor={anchor} />;

export default RealcommericalListing;
