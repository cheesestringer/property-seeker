import styles from 'data-text:../styles/styles.css';
import type { PlasmoCSConfig, PlasmoGetInlineAnchorList, PlasmoGetStyle } from 'plasmo';
import { Realestate } from '../components/realestate';

// TODO: PR for types of globs
export const config: PlasmoCSConfig = {
  matches: ['https://www.realestate.com.au/*']
};

export const getStyle: PlasmoGetStyle = () => {
  const style = document.createElement('style');
  style.textContent = styles;
  return style;
};

export const getInlineAnchorList: PlasmoGetInlineAnchorList = async () => document.querySelectorAll<HTMLElement>('[class*=Styles__StyledCard]');

const RealestateMap = ({ anchor }) => {
  const { element } = anchor;
  if (element.parentElement) {
    element.parentElement.style.overflow = 'unset';
  }

  return (
    <div style={{ position: 'absolute', top: '-15px', width: '100%' }} data-plasmo-target="map-card">
      <Realestate anchor={anchor} />
    </div>
  );
};

export default RealestateMap;
