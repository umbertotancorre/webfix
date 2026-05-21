async function initialize() {
  await loadSettingsOnce();

  preloadPopupAssets();

  const site = getCurrentSite();

  updateTabTitleWithNumber();
  watchTitleChanges();

  document.addEventListener('visibilitychange', async () => {
    if (!document.hidden) {
      const enabled = await getSetting('browser', 'tabNumbering');
      if (enabled) {
        updateTabTitleWithNumber();
      }
    }
  });

  if (site === 'youtube') {
    runYouTube();
    handleYouTubeSearchFocus();
  } else if (site === 'linkedin') {
    handleLinkedInSearchFocus();
  } else if (site === 'x') {
    runX();
  } else if (site === 'gmail') {
    runGmail();
  } else if (site === 'googleCalendar') {
    runGoogleCalendar();
  } else if (site === 'discord') {
    runDiscord();
  }
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'updateTabNumber') {
    updateTabTitleWithNumber();
    return true;
  }
  if (request.action === 'togglePopup') {
    togglePopup();
    return true;
  }
});

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'sync' && changes.webfixSettings) {
    const newSettings = changes.webfixSettings.newValue;
    const oldSettings = changes.webfixSettings.oldValue;

    cachedSettings = mergeSettingsWithDefaults(newSettings || {});

    const newTabNumbering = newSettings?.browser?.tabNumbering;
    const oldTabNumbering = oldSettings?.browser?.tabNumbering;

    if (newTabNumbering !== oldTabNumbering) {
      updateTabTitleWithNumber();
    }

    const newBlockInstagram = newSettings?.browser?.blockInstagram;
    const oldBlockInstagram = oldSettings?.browser?.blockInstagram;

    if (newBlockInstagram !== oldBlockInstagram) {
      const hostname = window.location.hostname;
      if (hostname.includes('instagram.com') || hostname.includes('instagr.am')) {
        window.location.reload();
      }
    }

    const newBlockYouTube = newSettings?.browser?.blockYouTube;
    const oldBlockYouTube = oldSettings?.browser?.blockYouTube;

    if (newBlockYouTube !== oldBlockYouTube) {
      const hostname = window.location.hostname;
      if (hostname.includes('youtube.com') || hostname.includes('youtu.be')) {
        window.location.reload();
      }
    }

    const newBlockLinkedIn = newSettings?.browser?.blockLinkedIn;
    const oldBlockLinkedIn = oldSettings?.browser?.blockLinkedIn;

    if (newBlockLinkedIn !== oldBlockLinkedIn) {
      const hostname = window.location.hostname;
      if (hostname.includes('linkedin.com')) {
        window.location.reload();
      }
    }

    const newBlockX = newSettings?.browser?.blockX;
    const oldBlockX = oldSettings?.browser?.blockX;

    if (newBlockX !== oldBlockX) {
      const hostname = window.location.hostname;
      if (hostname.includes('x.com') || hostname.includes('twitter.com')) {
        window.location.reload();
      }
    }
  }
});

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initialize);
} else {
  initialize();
}

const observer = new MutationObserver((mutations) => {
  const site = getCurrentSite();

  if (site === 'youtube') {
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === 1) {
            const element = node;

            if (element.matches && (
              element.matches('ytd-feed-nudge-renderer') ||
              element.querySelector('ytd-feed-nudge-renderer')
            )) {
              let nudgeElement = element.matches('ytd-feed-nudge-renderer') ? element : element.querySelector('ytd-feed-nudge-renderer');
              if (nudgeElement) {
                const titleElement = nudgeElement.querySelector('#title');
                if (titleElement && titleElement.textContent.trim() === 'Your watch history is off') {
                  const richSection = nudgeElement.closest('ytd-rich-section-renderer');
                  if (richSection) {
                    richSection.remove();
                  } else {
                    nudgeElement.remove();
                  }
                }
              }
            }

            if (element.matches && element.matches('ytd-rich-section-renderer')) {
              const nudge = element.querySelector('ytd-feed-nudge-renderer');
              if (nudge) {
                const titleElement = nudge.querySelector('#title');
                if (titleElement && titleElement.textContent.trim() === 'Your watch history is off') {
                  element.remove();
                }
              }
            }
          }
        });
      }
    });

    runYouTube();

  } else if (site === 'x') {
    runX();
  } else if (site === 'gmail') {
    runGmail();
  } else if (site === 'googleCalendar') {
    runGoogleCalendar();
  } else if (site === 'discord') {
    runDiscord();
  }
});

function startObserver() {
  if (document.body) {
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'class', 'aria-label']
    });
  } else {
    setTimeout(startObserver, 100);
  }
}

startObserver();

setInterval(() => {
  const site = getCurrentSite();

  if (site === 'youtube') {
    runYouTube();
  } else if (site === 'x') {
    runX();
  } else if (site === 'gmail') {
    runGmail();
  } else if (site === 'googleCalendar') {
    runGoogleCalendar();
  } else if (site === 'discord') {
    runDiscord();
  }
}, 1000);
