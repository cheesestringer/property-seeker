chrome.runtime.onMessage.addListener(request => {
  if (request && request.message === 'update') {
    if (request.url !== window.location.href) {
      return;
    }

    const element = document.querySelector('div[data-testid=listing-details__button-copy-wrapper]');
    if (!element) {
      return;
    }

    const range = document.createElement('span');
    range.id = 'range';
    range.style = 'display: block; margin-top: 8px;';
    range.innerText = `Estimate: ${request.price}`;
    element.parentNode.appendChild(range);
  }
});
