import domainStyles from 'data-text:../styles/domain.css';
import styles from 'data-text:../styles/styles.css';
import type { PlasmoCSConfig, PlasmoGetInlineAnchorList, PlasmoGetShadowHostId, PlasmoGetStyle } from 'plasmo';
import { Domain } from '~components/domain';

export const config: PlasmoCSConfig = {
  matches: ['https://www.domain.com.au/*'],
  exclude_matches: ['https://www.domain.com.au/rent/*']
};

export const getStyle: PlasmoGetStyle = () => {
  const style = document.createElement('style');
  style.textContent = styles + domainStyles;
  return style;
};

export const getInlineAnchorList: PlasmoGetInlineAnchorList = async () => {
  const elements = [...document.querySelectorAll<HTMLElement>('[data-testid="listing-card-price-wrapper"]')];
  return elements
    .filter(element => element?.parentElement?.parentElement?.nodeName !== 'A') // Remove project elements
    .map(element => ({ element: element?.parentElement }));
};

export const getShadowHostId: PlasmoGetShadowHostId = ({ element }) => {
  const container = element as HTMLElement | null;
  return container?.querySelector<HTMLAnchorElement>('a[href]')?.href;
};

const DomainListing = ({ anchor }) => {
  return <Domain anchor={anchor} />;
};

export default DomainListing;
