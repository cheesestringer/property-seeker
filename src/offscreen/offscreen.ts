chrome.runtime.onMessage.addListener(request => {
  if (request.type === 'openDocument') {
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = request.url;

    iframe.onload = () => {
      setTimeout(() => {
        chrome.runtime.sendMessage({ type: 'closeDocument' });
      }, 5000);
    };

    document.body.appendChild(iframe);
  }
});
