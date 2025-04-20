import type { PlasmoCSConfig, PlasmoGetInlineAnchorList, PlasmoGetStyle } from 'plasmo';
import { Realestate } from '../components/realestate';

// TODO: PR for types of globs
export const config: PlasmoCSConfig = {
  matches: ['https://www.realestate.com.au/*']
};

// Inline the stylesheets since css files currently get bundled in to content scripts as resources
export const getStyle: PlasmoGetStyle = () => {
  const style = document.createElement('style');
  style.textContent = `
    .container {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-bottom: 0.25rem;
    }
    .logo {
      height: 30px;
    }
    .message {
      font-size: 15px;
    }
    .price {
      font-size: 15px;
      font-weight: 600;
    }
  `;
  return style;
};

export const getInlineAnchorList: PlasmoGetInlineAnchorList = async () => document.querySelectorAll<HTMLElement>('[class*=Styles__HeadlineText]');

const RealestateMap = ({ anchor }) => {
  return <Realestate anchor={anchor} />;
};

export default RealestateMap;
