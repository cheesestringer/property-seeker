import { useEffect, useState } from 'react';
import { seeking } from '~constants';
import { useIntersectionObserver } from '~hooks/useObserver';

interface PropertyInsightsProps {
  cacheKey: string;
  address: string;
  retail?: boolean;
}

export const PropertyInsights = ({ cacheKey, address, retail = true }: PropertyInsightsProps) => {
  const [isVisible, containerRef] = useIntersectionObserver<HTMLSpanElement>();

  const [loading, setLoading] = useState(true);
  const [value, setValue] = useState('');
  const [valueConfidence, setValueConfidence] = useState('');
  const [propertyUrl, setPropertyUrl] = useState('');

  const getPropertyInsights = async () => {
    try {
      const response = await chrome.runtime.sendMessage({ type: 'getPropertyInsights', cacheKey, address });
      setValue(response?.value);
      setValueConfidence(response?.confidence);
      setPropertyUrl(response?.url);
    } catch (error) {
      console.log('Failed to find property insights', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isVisible && address && cacheKey) {
      getPropertyInsights();
    }
  }, [isVisible, address, cacheKey]);

  const ConfidenceBadge = ({ confidence }: { confidence: string }) => {
    if (propertyUrl) {
      return (
        <a href={propertyUrl} target="_blank" rel="noreferrer" title="View more details on property.com.au" aria-label="View more details on property.com.au">
          <span className={`confidence-badge ${confidence?.toLocaleLowerCase()}`}>{confidence}</span>
        </a>
      );
    }

    return <span className={`confidence-badge ${confidence?.toLocaleLowerCase()}`}>Unavailable</span>;
  };

  return (
    <>
      <span
        className="item-label"
        title={
          retail
            ? 'The PropTrack value esimate is calculated using automated statistical models based on available local property data, including the type of property, recent sales and local price trends.'
            : null
        }
        ref={containerRef}>
        {retail ? 'Value estimate' : 'Property insights'}:
      </span>
      <span>
        {loading ? (
          <>{seeking}</>
        ) : value ? (
          <>
            {value} <ConfidenceBadge confidence={valueConfidence} />
          </>
        ) : (
          <ConfidenceBadge confidence="Building insights" />
        )}
      </span>
    </>
  );
};
