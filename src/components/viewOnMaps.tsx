import mapsIcon from 'data-base64:../../assets/maps.svg';

interface ViewOnMapsProps {
  address: string;
}

export const ViewOnMaps = ({ address }: ViewOnMapsProps) => {
  if (!address) {
    return null;
  }

  return (
    <a href={`https://www.google.com/maps?q=${address}`} target="_blank" rel="noreferrer" aria-label="View on Google Maps">
      <img className="icon" src={mapsIcon} alt="Google Maps icon" title="View on Google Maps" />
    </a>
  );
};
