import { useEffect, useState } from 'react';
import { seeking } from '~constants';
import { useIntersectionObserver } from '~hooks/useObserver';

interface PropertyInsightsProps {
  cacheKey: string;
  address: string;
  retail?: boolean;
  showSizeOnly?: boolean;
}

export const PropertyInsights = ({ cacheKey, address, retail = true, showSizeOnly = false }: PropertyInsightsProps) => {
  const [isVisible, containerRef] = useIntersectionObserver<HTMLSpanElement>();

  const [loading, setLoading] = useState(true);
  const [value, setValue] = useState('');
  const [valueConfidence, setValueConfidence] = useState('');
  const [propertyUrl, setPropertyUrl] = useState('');
  const [landSize, setLandSize] = useState('');
  const [floorSize, setFloorSize] = useState('');

  const getPropertyInsights = async () => {
    try {
      const response = await chrome.runtime.sendMessage({ type: 'getPropertyInsights', cacheKey, address });
      setValue(response?.value);
      setValueConfidence(response?.confidence);
      setPropertyUrl(response?.url);
      setLandSize(response?.landSize);
      setFloorSize(response?.floorSize);

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

  const PropertySizeInfo = () => {
    if (!landSize && !floorSize) return null;

    return (
      <div className="property-size-info">
        {landSize && (
          <div className="size-item" title="Land Size">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fill-rule="evenodd" clip-rule="evenodd" d="M21.5 1a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0V3H7v.5a.5.5 0 0 1-1 0v-2a.5.5 0 0 1 1 0V2h14v-.5a.5.5 0 0 1 .5-.5ZM6 8.5A2.5 2.5 0 0 1 8.5 6h11A2.5 2.5 0 0 1 22 8.5v11a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 6 19.5v-11ZM8.5 7A1.5 1.5 0 0 0 7 8.5v11A1.5 1.5 0 0 0 8.5 21h11a1.5 1.5 0 0 0 1.5-1.5v-11A1.5 1.5 0 0 0 19.5 7h-11Zm-5 15a.5.5 0 0 0 0-1H3V7h.5a.5.5 0 0 0 0-1h-2a.5.5 0 0 0 0 1H2v14h-.5a.5.5 0 0 0 0 1h2Z" fill="currentColor"></path>
            </svg>
            <span>{landSize}</span>
          </div>
        )}
        {floorSize && (
          <div className="size-item" title="Floor Area">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fill-rule="evenodd" clip-rule="evenodd" d="M3.5 4A2.5 2.5 0 0 0 1 6.5v11A2.5 2.5 0 0 0 3.5 20h17a2.5 2.5 0 0 0 2.5-2.5v-11A2.5 2.5 0 0 0 20.5 4h-17ZM8 6.5V5H3.5A1.5 1.5 0 0 0 2 6.5V11h6V9.5a.5.5 0 0 1 1 0v4a.5.5 0 0 1-1 0V12H2v5.5A1.5 1.5 0 0 0 3.5 19H8v-2.5a.5.5 0 0 1 1 0V19h11.5a1.5 1.5 0 0 0 1.5-1.5V10h-9.5a.5.5 0 0 1 0-1H22V6.5A1.5 1.5 0 0 0 20.5 5H9v1.5a.5.5 0 0 1-1 0Z" fill="currentColor"></path>
            </svg>
            <span>{floorSize}</span>
          </div>
        )}
      </div>
    );
  };

  // If showSizeOnly is true, only render the size information
  if (showSizeOnly) {
    return (
      <>
        <span className="item-label" ref={containerRef}>
          Property size:
        </span>
        <span>
          {loading ? (
            <>{seeking}</>
          ) : landSize || floorSize ? (
            <PropertySizeInfo />
          ) : (
            'Not available'
          )}
        </span>
      </>
    );
  }

  // Otherwise render the normal property insights
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
