chrome.runtime.onMessage.addListener(request => {
  if (request && request.message === 'update') {
    const element = document.querySelector(".property-info-address");
    element.innerText += `\n${request.price}`;
  }
});
