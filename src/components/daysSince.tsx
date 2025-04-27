import { oneDayInMs } from '~constants';

interface DaysSinceProps {
  name: string;
  date: string;
}

export const DaysSince = ({ name, date }: DaysSinceProps) => {
  if (!date) {
    return null;
  }

  const daysSince = Math.floor((new Date().getTime() - new Date(date).getTime()) / oneDayInMs);
  const prettyDate = daysSince === 0 ? 'Today' : daysSince === 1 ? 'Yesterday' : `${daysSince} days ago`;

  return (
    <>
      <span className="item-label" title="The date the property was listed">
        {name}:
      </span>
      <span title={`${name} on ${new Date(date).toLocaleDateString()}`}>{prettyDate}</span>
    </>
  );
};
