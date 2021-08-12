const handleScriptInjection = (tab) => {
  chrome.tabs.executeScript(
    tab.id,
    {
      code: "var injected = window.seekerInjected; window.seekerInjected = true; injected;"
    },
    async response => {
      // Already injected
      if (response[0]) {
        getPrice(tab);
      } else {
        chrome.tabs.executeScript(tab.id, { file: "seeker.js" }, () => getPrice(tab));
      }
    }
  );
};

const getPrice = async (tab) => {
  try {
    const response = await fetch(tab.url);
    const text = await response.text();
    const doc = new DOMParser().parseFromString(text, 'text/html');

    const nodes = doc.querySelectorAll("script");
    for (const node of nodes) {
      if (node.innerText.includes("marketing_price_range")) {
        const first = node.innerText.split(`marketing_price_range\\":\\"`)[1];
        const second = first.split(`\\",`)[0];
        const price = second.split("_");
        chrome.tabs.sendMessage(tab.id, { message: 'update', price: `$${price[0]} to $${price[1]}` });
      }
    }
  }
  catch (exception) {
    console.log(exception);
  }
};

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.url) {
    handleScriptInjection(tab);
  }
});
