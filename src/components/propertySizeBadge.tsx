import floorSizeIcon from 'data-base64:../../assets/floorSizeIcon.svg';
import landSizeIcon from 'data-base64:../../assets/landSizeIcon.svg';

interface PropertySizeBadgeProps {
  landSize: string;
  floorSize: string;
}

export const PropertySizeBadge = ({ landSize, floorSize }: PropertySizeBadgeProps) => {
  const badgeColour = '#e0e0e0'; // light gray

  return (
    <div className="badge property-sizes-container" style={{ backgroundColor: badgeColour }}>
      <div className="property-size" title={`Land size: ${landSize || 'N/A'}`}>
        <img className="small-icon" src={landSizeIcon} alt="land size icon" />
        <span className="score">{landSize || 'N/A'}</span>
      </div>
      <div className="property-size" title={`Floor area: ${floorSize || 'N/A'}`}>
        <img className="small-icon" src={floorSizeIcon} alt="floor area icon" />
        <span className="score">{floorSize || 'N/A'}</span>
      </div>
    </div>
  );
};
