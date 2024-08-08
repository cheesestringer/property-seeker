import type { PlasmoCSConfig, PlasmoGetInlineAnchor, PlasmoGetStyle } from 'plasmo';
import { Domain } from '~components/domain';

export const config: PlasmoCSConfig = {
  matches: ['https://www.domain.com.au/*'],
  exclude_matches: ['https://www.domain.com.au/rent/*']
};

export const getInlineAnchor: PlasmoGetInlineAnchor = async () => document.querySelector<HTMLElement>('[data-testid*="summary-title"]');

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
    }
    .logo {
      height: 40px;
    }
    span {
      padding-left: 5px;
    }
    .message {
      font-size: 20px;
    }
    .price {
      font-size: 25px;
      font-weight: bold;
    }
  `;
  return style;
};

const DomainProperty = ({ anchor }) => {
  return <Domain anchor={anchor} />;
};
export default DomainProperty;
