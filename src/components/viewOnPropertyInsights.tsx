import realestateIcon from 'data-base64:../../assets/realestate.png';
import { useEffect, useState } from 'react';
import { useIntersectionObserver } from '~hooks/useObserver';

interface ViewOnPropertyInsightsProps {
  address: string;
}

export const ViewOnPropertyInsights = ({ address }: ViewOnPropertyInsightsProps) => {
  const [isVisible, containerRef] = useIntersectionObserver<HTMLSpanElement>();
  const [url, setUrl] = useState('');

  const getPropertyInsights = async () => {
    try {
      const response = await fetch(
        `https://suggest.realestate.com.au/consumer-suggest/suggestions?max=6&type=address&src=property-seeker&query=${address}`
      );
      const data = (await response.json()) as SuggestionResponse;
      const bestMatchUrl = data._embedded?.suggestions?.[0]?.source?.url;
      if (bestMatchUrl) {
        setUrl(bestMatchUrl);
      }
    } catch (error) {
      console.log('Failed to find property insights url', error);
    }
  };

  useEffect(() => {
    if (isVisible && address) {
      getPropertyInsights();
    }
  }, [isVisible, address]);

  return (
    <span ref={containerRef}>
      {url && (
        <a href={url} target="_blank" rel="noreferrer" aria-label="View property on realestate.com.au Property Insights">
          <img className="icon" src={realestateIcon} alt="Property Insights icon" title="View property on realestate.com.au Property Insights" />
        </a>
      )}
    </span>
  );
};
