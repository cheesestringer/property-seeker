import mapsIcon from 'data-base64:../../assets/maps.svg';

interface ViewOnMapsProps {
  address: string;
}

export const ViewOnMaps = ({ address }: ViewOnMapsProps) => {
  if (!address) {
    return null;
  }

  return (
    <a href={`https://www.google.com/maps?q=${address}`} target="_blank" rel="noreferrer">
      <img className="maps" src={mapsIcon} alt="Maps" title="View on Google Maps" />
    </a>
  );
};
