import logo from 'data-base64:../../assets/logo.svg';
import styleText from 'data-text:./realestate.css';
import type { PlasmoCSConfig, PlasmoCSUIProps, PlasmoGetInlineAnchor, PlasmoGetInlineAnchorList, PlasmoGetStyle } from 'plasmo';
import { useEffect, useState, type FC } from 'react';
import { getPrice } from '~services/realEstateService';

export const config: PlasmoCSConfig = {
  matches: ['https://www.realestate.com.au/*']
};

export const getInlineAnchor: PlasmoGetInlineAnchor = async () => ({
  element: document.querySelector<HTMLElement>('.property-info__middle-content'),
  insertPosition: 'beforeend'
});

export const getInlineAnchorList: PlasmoGetInlineAnchorList = async () => document.querySelectorAll<HTMLElement>('.residential-card__title');

export const getStyle: PlasmoGetStyle = () => {
  const style = document.createElement('style');
  style.textContent = styleText;
  return style;
};

const RealEstate: FC<PlasmoCSUIProps> = ({ anchor }) => {
  const [range, setRange] = useState<string>(null);

  useEffect(() => {
    handleListing();
  }, []);

  const handleListing = async () => {
    const { element } = anchor;
    if (element.className === 'property-info__middle-content') {
      const price = await getPrice(element.baseURI);
      setRange(price);
      return;
    }

    const link = element.parentElement.querySelector<HTMLAnchorElement>('.residential-card__address-heading > a');
    if (!link?.href) {
      return;
    }

    const observer = new IntersectionObserver(async entries => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          observer.disconnect();
          const price = await getPrice(link.href);
          setRange(price);
        }
      }
    });

    observer.observe(anchor.element);
  };

  return (
    <div className="container">
      <img className="logo" src={logo} alt="Property Seeker" title="Property Seeker" />
      <span className="price">{range ? range : 'Seeking...'}</span>
    </div>
  );
};

export default RealEstate;
