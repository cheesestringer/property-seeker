import styles from 'data-text:../styles/styles.css';
import type { PlasmoCSConfig, PlasmoGetInlineAnchor, PlasmoGetStyle } from 'plasmo';
import { Realcommercial } from '~components/realcommercial';

export const config: PlasmoCSConfig = {
  matches: ['https://www.realcommercial.com.au/*']
};

export const getStyle: PlasmoGetStyle = () => {
  const style = document.createElement('style');
  style.textContent = styles;
  return style;
};

export const getInlineAnchor: PlasmoGetInlineAnchor = async () => document.querySelector<HTMLElement>('[class*=PriceBar_wrapper]');

const RealcommericalProperty = ({ anchor }) => <Realcommercial anchor={anchor} />;

export default RealcommericalProperty;
