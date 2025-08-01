import realestateStyles from 'data-text:../styles/realestate.css';
import styles from 'data-text:../styles/styles.css';
import type { PlasmoCSConfig, PlasmoGetInlineAnchorList, PlasmoGetStyle } from 'plasmo';
import { Realestate } from '~components/realestate';

// contains each li element
const propertyList = document.querySelector('ul.tiered-results');

if (propertyList) {
  const observer = new MutationObserver(() => {
    propertyList
      .querySelectorAll('article.residential-card--compressed-view')
      .forEach(el => el.classList.remove('residential-card--compressed-view'));
  });

  observer.observe(propertyList, {
    childList: true,
    subtree: true
  });
}

export const config: PlasmoCSConfig = {
  matches: ['https://www.realestate.com.au/*']
};

export const getStyle: PlasmoGetStyle = () => {
  const style = document.createElement('style');
  style.textContent = styles + realestateStyles;
  return style;
};

export const getInlineAnchorList: PlasmoGetInlineAnchorList = async () => document.querySelectorAll<HTMLElement>('.residential-card__content');

const RealestateListing = ({ anchor }) => <Realestate anchor={anchor} />;

export default RealestateListing;
