chrome.runtime.onMessage.addListener(request => {
  if (request && request.message === 'update') {
    if (request.url !== window.location.href) {
      return;
    }

    const element = document.querySelector('.property-info-address');
    if (!element) {
      return;
    }

    const range = document.createElement('span');
    range.style = 'display: block; padding-top: 1.5rem;';
    range.innerText = `Range: $${request.price[0]}`;
    if (request.price[1]) {
      range.innerText += ` to $${request.price[1]}`;
    }

    element.append(range);
  }
});
