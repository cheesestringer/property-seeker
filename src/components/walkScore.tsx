import { useEffect, useState } from 'react';
import { useIntersectionObserver } from '~hooks/useObserver';

interface WalkScoreProps {
  cacheKey: string;
  address: string;
}

export const WalkScore = ({ cacheKey, address }: WalkScoreProps) => {
  const [isVisible, containerRef] = useIntersectionObserver();

  const [walkScore, setWalkScore] = useState('');
  const [transportScore, setTransportScore] = useState('');
  const [url, setUrl] = useState('');

  const getWalkScore = async () => {
    try {
      const response = await chrome.runtime.sendMessage({ type: 'getWalkScore', cacheKey, address });
      setWalkScore(response.walkScore);
      setTransportScore(response.transportScore);
      setUrl(response.url);
    } catch (error) {}
  };

  useEffect(() => {
    if (isVisible && address && cacheKey) {
      getWalkScore();
    }
  }, [isVisible, address, cacheKey]);

  const getBadgeColor = (score: string) => {
    const numericScore = parseInt(score, 10);
    if (isNaN(numericScore)) return '#e0e0e0'; // Light gray for "N/A"
    if (numericScore >= 90) return '#c8e6c9'; // Green
    if (numericScore >= 70) return '#dcedc8'; // Light green
    if (numericScore >= 50) return '#fff9c4'; // Yellow
    if (numericScore >= 25) return '#fff9c4'; // Orange
    return '#ffcdd2'; // Red
  };

  return (
    <div ref={containerRef} className="walk-score-container">
      <a
        href={url ?? 'https://www.walkscore.com/score/'}
        target="_blank"
        rel="noreferrer"
        title={`Walk Score: ${walkScore ? `${walkScore}/100` : 'N/A'}`}>
        <div className="badge" style={{ backgroundColor: getBadgeColor(walkScore) }}>
          <span role="img" aria-label="Walk emoji">
            🚶
          </span>
          <span className="score">{walkScore || 'N/A'}</span>
        </div>
      </a>
      <a
        href={url ?? 'https://www.walkscore.com/score/'}
        target="_blank"
        rel="noreferrer"
        title={`Transport Score: ${transportScore ? `${transportScore}/100` : 'N/A'}`}>
        <div className="badge" style={{ backgroundColor: getBadgeColor(transportScore) }}>
          <span role="img" aria-label="Transport emoji">
            🚌
          </span>
          <span className="score">{transportScore || 'N/A'}</span>
        </div>
      </a>
    </div>
  );
};
