const defaultSettings = {
  youtube: {
    hideMoreSection: true,
    hideExploreSection: true,
    hideSettingsSection: true,
    hideFooter: true,
    hideCreateButton: true,
    hideNotificationsButton: true,
    hideAutoDubbedBadge: true,
    hideFeedNudge: true,
    hideAllShorts: false,
    hideVideoSuggestions: false,
    searchFocus: true
  },
  linkedin: {
    searchFocus: true
  },

  gmail: {
    hideUpgradeButton: true
  },
  googleCalendar: {
    hideTermsPrivacy: true,
    hideBookingPages: true,
    hideSupportButton: true,
    hideSidePanelToggle: true,
    hideCreateButton: true,
    hideSwitchButtons: true,
    hideSearchPeople: true,
    hideMiniMonth: true,
    hideBirthdays: true,
    hideTasks: true,
    hideNavigationButtons: true,
    hideViewSwitcher: true,
    hideUpgradeButton: true
  },
  x: {
    hideNavCreatorStudio: false,
    hideTrendingSidebar: true,
    hideGrok: true,
    hideChat: true,
    hideNavLogo: false,
    hideNavHome: false,
    hideNavExplore: false,
    hideNavNotifications: false,
    hideNavFollow: false,
    hideNavMessages: false,
    hideNavGrok: false,
    hideNavProfile: false,
    hideNavPremium: false,
    hideNavBookmarks: false,
    hideNavArticles: false,
    hideNavMore: false,
    centerNavSidebar: false,
    floatPostButton: false,
    shiftTimelineRight: false
  },
  discord: {
    hideGiftButton: true,
    hideGifButton: true,
    hideStickerButton: true,
    hideEmojiButton: false,
    hideAppsButton: true,
    hideAddServerButton: true,
    hideDiscoverButton: true,
    hideDownloadAppsButton: true,
    hideHelpButton: true,
    hideEventsItem: true,
    hideServerBoostsItem: true,
    redirectToFirstServer: true
  },
  browser: {
    tabNumbering: true,
    blockInstagram: false,
    blockYouTube: false,
    blockLinkedIn: false,
    blockX: false
  }
};

let cachedSettings = { ...defaultSettings };

function mergeSettingsWithDefaults(settings) {
  const merged = { ...defaultSettings };
  Object.keys(merged).forEach(platform => {
    merged[platform] = { ...merged[platform], ...(settings?.[platform] || {}) };
  });
  return merged;
}

async function loadSettingsOnce() {
  return new Promise((resolve) => {
    try {
      chrome.storage.sync.get(['webfixSettings'], (result) => {
        cachedSettings = mergeSettingsWithDefaults(result.webfixSettings || {});
        resolve(cachedSettings);
      });
    } catch {
      cachedSettings = mergeSettingsWithDefaults({});
      resolve(cachedSettings);
    }
  });
}

async function getSetting(platform, key) {
  const value = cachedSettings?.[platform]?.[key];
  return value !== undefined ? value : defaultSettings[platform]?.[key] ?? true;
}

function setSetting(platform, key, value) {
  chrome.storage.sync.get(['webfixSettings'], (result) => {
    const settings = mergeSettingsWithDefaults(result.webfixSettings || {});
    if (!settings[platform]) settings[platform] = {};
    settings[platform][key] = value;
    chrome.storage.sync.set({ webfixSettings: settings });
  });
}
