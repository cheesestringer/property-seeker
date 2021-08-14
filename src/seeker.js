chrome.runtime.onMessage.addListener(request => {
  if (request && request.message === 'update') {
    if (request.url !== window.location.href) {
      return;
    }

    const element = document.querySelector(".property-info-address");
    element.innerText += `\n$${request.price[0]}`;
    if (request.price[1]) {
      element.innerText += ` to $${request.price[1]}`;
    };
  }
});
