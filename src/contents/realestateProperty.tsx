import type { PlasmoCSConfig, PlasmoGetInlineAnchor, PlasmoGetStyle } from 'plasmo';
import { Realestate } from '../components/realestate';

export const config: PlasmoCSConfig = {
  matches: ['https://www.realestate.com.au/*']
};

// Inline the stylesheets since css files currently get bundled in to content scripts as resources
export const getStyle: PlasmoGetStyle = () => {
  const style = document.createElement('style');
  style.textContent = `
    #plasmo-shadow-container {
      z-index: 1 !important;
    }
    .container {
      display: flex;
      align-items: center;
      margin-bottom: 0.25rem;
    }
    .logo {
      height: 40px;
    }
    span {
      padding-left: 5px;
    }
    .message {
      font-size: 15px;
    }
    .price {
      font-size: 18px;
      font-weight: 600;
    }
  `;
  return style;
};

export const getInlineAnchor: PlasmoGetInlineAnchor = async () => ({
  element: document.querySelector<HTMLElement>('.property-info__middle-content'),
  insertPosition: 'beforeend'
});

const RealestateProperty = ({ anchor }) => <Realestate anchor={anchor} />;

export default RealestateProperty;
