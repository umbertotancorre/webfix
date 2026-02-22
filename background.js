// Handle extension icon click: toggle in-page popup via content script
chrome.action.onClicked.addListener(async (tab) => {
  if (!tab?.id) return;

  // Best-effort: try message first, then inject if needed
  try {
    await chrome.tabs.sendMessage(tab.id, { action: 'togglePopup' });
    return;
  } catch {
    // Content script not loaded, try injecting it
    try {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['content.js']
      });
      // Wait a bit for script to initialize, then send message
      setTimeout(async () => {
        try {
          await chrome.tabs.sendMessage(tab.id, { action: 'togglePopup' });
        } catch {
          // Still failed - ignore (might be restricted page)
        }
      }, 200);
    } catch {
      // Injection failed (restricted page) - ignore
    }
  }
});

// Handle requests for tab index + forward settings updates
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request?.action === 'getTabIndex') {
    chrome.tabs.query({ currentWindow: true }, (tabs) => {
      const currentTab = tabs.find(tab => tab.id === sender.tab.id);
      if (currentTab) {
        const tabIndex = tabs.indexOf(currentTab) + 1; // 1-based index
        sendResponse({ tabIndex });
      } else {
        sendResponse({ tabIndex: null });
      }
    });
    return true; // async response
  }

  return undefined;
});

// Notify all tabs to update their numbers when a new tab is created
chrome.tabs.onCreated.addListener((tab) => {
  // Wait for the tab to be ready, then update all tabs
  const updateAllTabs = () => {
    chrome.tabs.query({ currentWindow: true }, (tabs) => {
      tabs.forEach(t => {
        if (t.id && t.url && !t.url.startsWith('chrome://') && !t.url.startsWith('chrome-extension://')) {
          // Try to send message, if it fails (content script not loaded), retry after a delay
          chrome.tabs.sendMessage(t.id, { action: 'updateTabNumber' }).catch(() => {
            // Content script might not be loaded yet, retry after a longer delay
            if (t.id === tab.id) {
              setTimeout(() => {
                chrome.tabs.sendMessage(t.id, { action: 'updateTabNumber' }).catch(() => { });
              }, 500);
            }
          });
        }
      });
    });
  };

  // Initial update after short delay
  setTimeout(updateAllTabs, 100);
  // Also update after longer delay to catch tabs that load slowly
  setTimeout(updateAllTabs, 500);
});

// Notify all tabs to update their numbers when a tab is updated (URL changes, etc.)
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // Only update when the tab is fully loaded (status === 'complete')
  if (changeInfo.status === 'complete' && tab.url && !tab.url.startsWith('chrome://') && !tab.url.startsWith('chrome-extension://')) {
    chrome.tabs.query({ currentWindow: true }, (tabs) => {
      tabs.forEach(t => {
        if (t.id && t.url && !t.url.startsWith('chrome://') && !t.url.startsWith('chrome-extension://')) {
          chrome.tabs.sendMessage(t.id, { action: 'updateTabNumber' }).catch(() => { });
        }
      });
    });
  }
});

// Notify all tabs to update their numbers when a tab is closed
chrome.tabs.onRemoved.addListener((tabId, removeInfo) => {
  chrome.tabs.query({ currentWindow: true }, (tabs) => {
    tabs.forEach(tab => {
      if (tab.id && tab.url && !tab.url.startsWith('chrome://') && !tab.url.startsWith('chrome-extension://')) {
        chrome.tabs.sendMessage(tab.id, { action: 'updateTabNumber' }).catch(() => { });
      }
    });
  });
});

// Notify all tabs to update their numbers when tabs are reordered
chrome.tabs.onMoved.addListener((tabId, moveInfo) => {
  chrome.tabs.query({ windowId: moveInfo.windowId }, (tabs) => {
    tabs.forEach(tab => {
      if (tab.id && tab.url && !tab.url.startsWith('chrome://') && !tab.url.startsWith('chrome-extension://')) {
        chrome.tabs.sendMessage(tab.id, { action: 'updateTabNumber' }).catch(() => { });
      }
    });
  });
});

// Notify all tabs to update their numbers when a tab is activated (clicked)
chrome.tabs.onActivated.addListener((activeInfo) => {
  chrome.tabs.query({ windowId: activeInfo.windowId }, (tabs) => {
    tabs.forEach(tab => {
      if (tab.id && tab.url && !tab.url.startsWith('chrome://') && !tab.url.startsWith('chrome-extension://')) {
        chrome.tabs.sendMessage(tab.id, { action: 'updateTabNumber' }).catch(() => { });
      }
    });
  });
});




