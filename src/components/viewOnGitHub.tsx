import gitHubIcon from 'data-base64:../../assets/gitHub.svg';

export const ViewOnGitHub = () => {
  return (
    <a href="https://github.com/cheesestringer/property-seeker" target="_blank" aria-label="Raise an issue or feature request on GitHub">
      <img className="icon" src={gitHubIcon} alt="Github icon" title="Raise an issue or feature request on GitHub" />
    </a>
  );
};
