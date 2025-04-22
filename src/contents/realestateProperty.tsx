import realestateStyles from 'data-text:../styles/realestate.css';
import styles from 'data-text:../styles/styles.css';
import type { PlasmoCSConfig, PlasmoGetInlineAnchor, PlasmoGetStyle } from 'plasmo';
import { Realestate } from '../components/realestate';

export const config: PlasmoCSConfig = {
  matches: ['https://www.realestate.com.au/*']
};

export const getStyle: PlasmoGetStyle = () => {
  const style = document.createElement('style');
  style.textContent = styles + realestateStyles;
  return style;
};

export const getInlineAnchor: PlasmoGetInlineAnchor = async () => document.querySelector<HTMLElement>('.property-info__middle-content');

const RealestateProperty = ({ anchor }) => <Realestate anchor={anchor} />;

export default RealestateProperty;
