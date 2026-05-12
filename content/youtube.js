async function hideYouTubeMoreSection() {
  const enabled = await getSetting('youtube', 'hideMoreSection');
  if (!enabled) return;
  const guideSections = document.querySelectorAll('ytd-guide-section-renderer');

  guideSections.forEach(section => {
    const titleElement = section.querySelector('yt-formatted-string#guide-section-title');
    if (titleElement && titleElement.textContent.trim() === 'More from YouTube') {
      section.style.display = 'none';
    }
  });
}

async function hideYouTubeExploreSection() {
  const enabled = await getSetting('youtube', 'hideExploreSection');
  if (!enabled) return;
  const guideSections = document.querySelectorAll('ytd-guide-section-renderer');

  guideSections.forEach(section => {
    const titleElement = section.querySelector('yt-formatted-string#guide-section-title');
    if (titleElement && titleElement.textContent.trim() === 'Explore') {
      section.style.display = 'none';
    }
  });
}

async function hideYouTubeSettingsSection() {
  const enabled = await getSetting('youtube', 'hideSettingsSection');
  if (!enabled) return;
  const guideSections = document.querySelectorAll('ytd-guide-section-renderer');

  guideSections.forEach(section => {
    const items = section.querySelectorAll('ytd-guide-entry-renderer');
    let hasSettingsItems = false;

    items.forEach(item => {
      const titleElement = item.querySelector('yt-formatted-string.title');
      if (titleElement) {
        const title = titleElement.textContent.trim();
        if (title === 'Settings' || title === 'Report history' || title === 'Help' || title === 'Send feedback') {
          hasSettingsItems = true;
        }
      }

      const link = item.querySelector('a#endpoint');
      if (link) {
        const linkTitle = link.getAttribute('title');
        if (linkTitle === 'Settings' || linkTitle === 'Report history' || linkTitle === 'Help' || linkTitle === 'Send feedback') {
          hasSettingsItems = true;
        }
      }
    });

    if (hasSettingsItems) {
      section.style.display = 'none';
    }
  });
}

async function hideYouTubeFooter() {
  const enabled = await getSetting('youtube', 'hideFooter');
  if (!enabled) return;
  const footer = document.querySelector('#footer.ytd-guide-renderer');
  if (footer) {
    footer.style.display = 'none';
  }
}

async function hideYouTubeCreateButton() {
  const enabled = await getSetting('youtube', 'hideCreateButton');
  if (!enabled) return;
  const createButton = document.querySelector('button[aria-label="Create"]');
  if (createButton) {
    const buttonRenderer = createButton.closest('ytd-button-renderer');
    if (buttonRenderer) {
      buttonRenderer.style.display = 'none';
    }
  }

  const createByText = Array.from(document.querySelectorAll('ytd-button-renderer')).find(renderer => {
    const textContent = renderer.textContent.trim();
    return textContent === 'Create' || textContent.includes('Create');
  });
  if (createByText) {
    createByText.style.display = 'none';
  }
}

async function hideYouTubeNotificationsButton() {
  const enabled = await getSetting('youtube', 'hideNotificationsButton');
  if (!enabled) return;
  const notificationsButton = document.querySelector('ytd-notification-topbar-button-renderer');
  if (notificationsButton) {
    notificationsButton.style.display = 'none';
  }

  const notificationsByAria = document.querySelector('button[aria-label="Notifications"]');
  if (notificationsByAria) {
    const container = notificationsByAria.closest('ytd-notification-topbar-button-renderer');
    if (container) {
      container.style.display = 'none';
    }
  }
}

async function hideYouTubeAllShorts() {
  const enabled = await getSetting('youtube', 'hideAllShorts');
  if (!enabled) return;

  const sidebarShorts = document.querySelectorAll('ytd-guide-entry-renderer, ytd-mini-guide-entry-renderer');
  sidebarShorts.forEach(entry => {
    const titleElement = entry.querySelector('yt-formatted-string.title, span.title');
    if (titleElement && titleElement.textContent.trim().toLowerCase() === 'shorts') {
      entry.style.display = 'none';
    }
    const link = entry.querySelector('a#endpoint[title="Shorts"], a#endpoint[aria-label="Shorts"]');
    if (link) {
      entry.style.display = 'none';
    }
  });

  const shortsShelves = document.querySelectorAll('ytd-rich-shelf-renderer, ytd-shelf-renderer');
  shortsShelves.forEach(shelf => {
    const title = shelf.querySelector('span#title, div#title-text span#title');
    if (title && title.textContent.trim().toLowerCase() === 'shorts') {
      shelf.style.display = 'none';
    }
  });

  const reelShelves = document.querySelectorAll('ytd-reel-shelf-renderer');
  reelShelves.forEach(shelf => {
    shelf.style.display = 'none';
  });

  const shortsVideos = document.querySelectorAll('ytd-video-renderer, ytd-compact-video-renderer, ytd-grid-video-renderer');
  shortsVideos.forEach(video => {
    const badges = video.querySelectorAll('badge-shape, .ytd-badge-supported-renderer');
    let isShorts = false;

    badges.forEach(badge => {
      const badgeText = badge.textContent?.toLowerCase() || '';
      if (badgeText.includes('shorts') || badgeText.includes('short')) {
        isShorts = true;
      }
    });

    const link = video.querySelector('a#thumbnail[href*="/shorts/"]');
    if (link) {
      isShorts = true;
    }

    if (video.classList.contains('ytd-shorts') ||
      video.getAttribute('data-shorts') ||
      video.querySelector('[class*="shorts"]')) {
      isShorts = true;
    }

    if (isShorts) {
      video.style.display = 'none';
    }
  });

  const searchResults = document.querySelectorAll('ytd-video-renderer');
  searchResults.forEach(result => {
    const link = result.querySelector('a[href*="/shorts/"]');
    if (link) {
      result.style.display = 'none';
    }
  });

  const recommendations = document.querySelectorAll('ytd-compact-video-renderer');
  recommendations.forEach(rec => {
    const link = rec.querySelector('a[href*="/shorts/"]');
    if (link) {
      rec.style.display = 'none';
    }
  });

  const sectionsWithShorts = document.querySelectorAll('ytd-rich-section-renderer, ytd-rich-grid-renderer, ytd-rich-shelf-renderer');
  sectionsWithShorts.forEach(section => {
    const shortsContent = section.querySelector('[href*="/shorts/"], [class*="shorts"], badge-shape');
    if (shortsContent) {
      const badgeText = shortsContent.textContent?.toLowerCase() || '';
      if (badgeText.includes('shorts') || badgeText.includes('short') || shortsContent.getAttribute('href')?.includes('/shorts/')) {
        section.style.display = 'none';
      }
    }

    const sectionTitle = section.querySelector('#title, .title, yt-formatted-string');
    if (sectionTitle) {
      const titleText = sectionTitle.textContent?.toLowerCase() || '';
      if (titleText.includes('shorts')) {
        section.style.display = 'none';
      }
    }
  });

  const gridSections = document.querySelectorAll('ytd-grid-renderer, ytd-expanded-shelf-contents-renderer');
  gridSections.forEach(grid => {
    const shortsVideos = grid.querySelectorAll('[href*="/shorts/"], badge-shape');
    let hasShorts = false;

    shortsVideos.forEach(video => {
      const badgeText = video.textContent?.toLowerCase() || '';
      if (badgeText.includes('shorts') || badgeText.includes('short') || video.getAttribute('href')?.includes('/shorts/')) {
        hasShorts = true;
      }
    });

    if (hasShorts) {
      grid.style.display = 'none';
    }
  });

  const gridShelves = document.querySelectorAll('grid-shelf-view-model.ytGridShelfViewModelHost');
  gridShelves.forEach(shelf => {
    const shortsContent = shelf.querySelector('ytm-shorts-lockup-view-model, ytm-shorts-lockup-view-model-v2, [href*="/shorts/"]');
    if (shortsContent) {
      shelf.style.display = 'none';
    }

    const titleElement = shelf.querySelector('span.yt-core-attributed-string');
    if (titleElement && titleElement.textContent.trim().toLowerCase() === 'shorts') {
      shelf.style.display = 'none';
    }
  });

  const allElements = document.querySelectorAll('[class*="shorts"], [id*="shorts"]');
  allElements.forEach(element => {
    const className = element.className.toLowerCase();
    const id = element.id.toLowerCase();
    if (className.includes('shorts') || id.includes('shorts')) {
      element.style.display = 'none';
    }
  });
}

async function hideYouTubeAutoDubbedBadge() {
  const enabled = await getSetting('youtube', 'hideAutoDubbedBadge');
  if (!enabled) return;
  const badges = document.querySelectorAll('badge-shape.yt-badge-shape');

  badges.forEach(badge => {
    const badgeText = badge.querySelector('div.yt-badge-shape__text');
    if (badgeText && badgeText.textContent.trim() === 'Auto-dubbed') {
      badge.style.display = 'none';
    }
  });

  const allBadges = document.querySelectorAll('badge-shape');
  allBadges.forEach(badge => {
    const text = badge.textContent.trim();
    if (text === 'Auto-dubbed' || text.includes('Auto-dubbed')) {
      badge.style.display = 'none';
    }
  });
}

function findYouTubeSearchInput() {
  const searchInputSelectors = [
    'input#search',
    'input[name="search_query"]',
    'input[aria-label*="Search"]',
    'input[placeholder*="Search"]',
    'input[type="search"]',
    'form[role="search"] input',
    'input[aria-label*="search"]',
    'input[aria-label*="Search YouTube"]',
    'input[aria-label*="search YouTube"]'
  ];

  let searchInput = null;
  for (const selector of searchInputSelectors) {
    try {
      searchInput = document.querySelector(selector);
      if (searchInput && searchInput.offsetParent !== null) {
        const rect = searchInput.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          break;
        }
      }
      searchInput = null;
    } catch (e) {
      continue;
    }
  }

  if (!searchInput) {
    const allInputs = document.querySelectorAll('input[type="text"], input[type="search"]');
    for (const input of allInputs) {
      const ariaLabel = input.getAttribute('aria-label')?.toLowerCase() || '';
      const placeholder = input.getAttribute('placeholder')?.toLowerCase() || '';
      const name = input.getAttribute('name')?.toLowerCase() || '';

      if ((ariaLabel.includes('search') || placeholder.includes('search') || name.includes('search')) &&
        input.offsetParent !== null) {
        const rect = input.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          searchInput = input;
          break;
        }
      }
    }
  }

  return searchInput;
}

async function hideYouTubeFeedNudge() {
  const enabled = await getSetting('youtube', 'hideFeedNudge');
  if (!enabled) return;
  const feedNudges = document.querySelectorAll('ytd-feed-nudge-renderer');
  feedNudges.forEach(nudge => {
    const titleElement = nudge.querySelector('#title');
    if (titleElement && titleElement.textContent.trim() === 'Your watch history is off') {
      const richSection = nudge.closest('ytd-rich-section-renderer');
      if (richSection) {
        richSection.remove();
      } else {
        nudge.remove();
      }
      return;
    }
  });

  const richSections = document.querySelectorAll('ytd-rich-section-renderer');
  richSections.forEach(section => {
    const nudge = section.querySelector('ytd-feed-nudge-renderer');
    if (nudge) {
      const titleElement = nudge.querySelector('#title');
      if (titleElement && titleElement.textContent.trim() === 'Your watch history is off') {
        section.remove();
      }
    }
  });
}

async function hideYouTubeVideoSuggestions() {
  const enabled = await getSetting('youtube', 'hideVideoSuggestions');
  if (!enabled) return;
  const suggestions = document.querySelector('ytd-watch-next-secondary-results-renderer');
  if (suggestions) {
    suggestions.style.display = 'none';
  }
}

let youtubeSearchListenerAdded = false;
function handleYouTubeSearchFocus() {
  if (youtubeSearchListenerAdded) return;
  youtubeSearchListenerAdded = true;

  document.addEventListener('keydown', async (e) => {
    const enabled = await getSetting('youtube', 'searchFocus');
    if (!enabled) return;

    if (e.key === 's' || e.key === 'S') {
      if (isUserTyping()) {
        return;
      }

      if (e.ctrlKey || e.metaKey || e.altKey || e.shiftKey) {
        return;
      }

      const searchInput = findYouTubeSearchInput();

      if (searchInput) {
        e.preventDefault();
        e.stopPropagation();
        searchInput.focus();
        if (searchInput.value) {
          searchInput.select();
        }
      }
    }

    if (e.key === 'Escape') {
      const activeElement = document.activeElement;
      const searchInput = findYouTubeSearchInput();

      if (searchInput && activeElement === searchInput) {
        e.preventDefault();
        e.stopPropagation();
        searchInput.blur();
      }
    }
  }, true);
}

async function runYouTube() {
  await Promise.all([
    hideYouTubeMoreSection(),
    hideYouTubeExploreSection(),
    hideYouTubeSettingsSection(),
    hideYouTubeFooter(),
    hideYouTubeCreateButton(),
    hideYouTubeNotificationsButton(),
    hideYouTubeAutoDubbedBadge(),
    hideYouTubeFeedNudge(),
    hideYouTubeAllShorts(),
    hideYouTubeVideoSuggestions()
  ]);
}
