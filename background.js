chrome.action.onClicked.addListener(async (tab) => {
  if (!tab?.id) return;
  try {
    await chrome.tabs.sendMessage(tab.id, { action: 'togglePopup' });
  } catch {
    // Content script not loaded (restricted page) - ignore
  }
});

function isAllowedTab(url) {
  return url && !url.startsWith('chrome://') && !url.startsWith('chrome-extension://');
}

function updateAllTabNumbers(windowId) {
  const queryOptions = windowId ? { windowId } : { currentWindow: true };
  chrome.tabs.query(queryOptions, (tabs) => {
    tabs.forEach(t => {
      if (t.id && isAllowedTab(t.url)) {
        chrome.tabs.sendMessage(t.id, { action: 'updateTabNumber' }).catch(() => {});
      }
    });
  });
}

// Handle requests for tab index
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request?.action === 'getTabIndex') {
    chrome.tabs.query({ currentWindow: true }, (tabs) => {
      const currentTab = tabs.find(tab => tab.id === sender.tab.id);
      if (currentTab) {
        const tabIndex = tabs.indexOf(currentTab) + 1;
        sendResponse({ tabIndex });
      } else {
        sendResponse({ tabIndex: null });
      }
    });
    return true;
  }

  return undefined;
});

chrome.tabs.onCreated.addListener(() => {
  setTimeout(updateAllTabNumbers, 100);
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && isAllowedTab(tab.url)) {
    updateAllTabNumbers();
  }
});

chrome.tabs.onRemoved.addListener(() => {
  updateAllTabNumbers();
});

chrome.tabs.onMoved.addListener((tabId, moveInfo) => {
  updateAllTabNumbers(moveInfo.windowId);
});

chrome.tabs.onActivated.addListener(() => {
  updateAllTabNumbers();
});
