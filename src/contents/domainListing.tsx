import type { PlasmoCSConfig, PlasmoGetInlineAnchorList, PlasmoGetStyle } from 'plasmo';
import { Domain } from '~components/domain';

export const config: PlasmoCSConfig = {
  matches: ['https://www.domain.com.au/*'],
  exclude_matches: ['https://www.domain.com.au/rent/*']
};

export const getInlineAnchorList: PlasmoGetInlineAnchorList = async () => document.querySelectorAll<HTMLElement>('p[data-testid="listing-card-price"]');

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
      height: 32px;
    }
    span {
      padding-left: 5px;
    }
    .message {
      font-size: 15px;
    }
    .price {
      font-weight: bold;
    }
  `;
  return style;
};

const DomainListing = ({ anchor }) => {
  return <Domain anchor={anchor} />;
};
export default DomainListing;
