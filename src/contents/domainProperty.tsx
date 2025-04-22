import domainStyles from 'data-text:../styles/domain.css';
import styles from 'data-text:../styles/styles.css';
import type { PlasmoCSConfig, PlasmoGetInlineAnchor, PlasmoGetStyle } from 'plasmo';
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

export const getInlineAnchor: PlasmoGetInlineAnchor = async () =>
  document.querySelector<HTMLElement>('[data-testid="listing-details__summary-left-column"]')?.parentElement;

const DomainProperty = ({ anchor }) => {
  return <Domain anchor={anchor} />;
};

export default DomainProperty;
