// Multi-Site Browser Enhancement - Content Script

// Immediate blocking for Instagram, YouTube, and LinkedIn (before anything else loads)
(function() {
  const hostname = window.location.hostname;
  const isInstagram = hostname.includes('instagram.com') || hostname.includes('instagr.am');
  const isYouTube = hostname.includes('youtube.com') || hostname.includes('youtu.be');
  const isLinkedIn = hostname.includes('linkedin.com');

  if (isInstagram || isYouTube || isLinkedIn) {
    // Check if blocking is enabled in storage
    chrome.storage.sync.get(['webfixSettings'], (result) => {
      const settings = result.webfixSettings || {};
      const blockInstagram = settings.browser?.blockInstagram;
      const blockYouTube = settings.browser?.blockYouTube;
      const blockLinkedIn = settings.browser?.blockLinkedIn;

      if ((isInstagram && blockInstagram) || (isYouTube && blockYouTube) || (isLinkedIn && blockLinkedIn)) {
        // Block immediately before any content loads
        window.location.replace('about:blank');
      }
    });
  }
})();

// Site detection
function getCurrentSite() {
  const hostname = window.location.hostname;
  if (hostname.includes('chatgpt.com')) {
    return 'chatgpt';
  } else if (hostname.includes('linkedin.com')) {
    return 'linkedin';
  } else if (hostname.includes('youtube.com') || hostname.includes('youtu.be')) {
    return 'youtube';
  } else if (hostname.includes('n8n') || hostname.includes('hstgr.cloud')) {
    return 'n8n';
  } else if (hostname.includes('mail.google.com')) {
    return 'gmail';
  } else if (hostname.includes('notion.so')) {
    return 'notion';
  } else if (hostname.includes('calendar.google.com')) {
    return 'googleCalendar';
  }
  return null;
}

// ==================== STORAGE MANAGEMENT ====================

// Default settings - all enabled by default
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
    searchFocus: true
  },
  linkedin: {
    searchFocus: true
  },
  chatgpt: {
    hideAtlas: true,
    hideCodex: true,
    hideLibrary: true,
    hideImages: true
  },
  n8n: {
    hideInsightsWrapper: true
  },
  gmail: {
    hideUpgradeButton: true
  },
  notion: {
    hideAIButton: true
  },
  googleCalendar: {
    hideTermsPrivacy: true,
    hideBookingPages: true,
    hideSupportButton: true,
    hideSidePanelToggle: true,
    reduceRoundedCorners: true
  },
  browser: {
    tabNumbering: true,
    blockInstagram: false,
    blockYouTube: false,
    blockLinkedIn: false
  }
};

// Cache settings on startup (controller-only behavior: changes apply after refresh / next visit)
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

// Get setting value
async function getSetting(platform, key) {
  const value = cachedSettings?.[platform]?.[key];
  return value !== undefined ? value : defaultSettings[platform]?.[key] ?? true;
}

// Set setting value (for popup toggles)
function setSetting(platform, key, value) {
  chrome.storage.sync.get(['webfixSettings'], (result) => {
    const settings = mergeSettingsWithDefaults(result.webfixSettings || {});
    if (!settings[platform]) settings[platform] = {};
    settings[platform][key] = value;
    chrome.storage.sync.set({ webfixSettings: settings });
  });
}

// ==================== POPUP UI (Shadow DOM isolated) ====================

let popupHost = null;

// Preload all icons and images for the popup
function preloadPopupAssets() {
  // Preload all icon images from popupConfig (including browser icon)
  popupConfig.forEach(sectionCfg => {
    // Preload the icon image
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = sectionCfg.iconSrc;
    document.head.appendChild(link);
    
    // Also create an Image object to force load
    const img = new Image();
    img.src = sectionCfg.iconSrc;
  });
  
  // Preload close button icon
  const closeIconUrl = chrome.runtime.getURL('icons/cross.svg');
  const closeLink = document.createElement('link');
  closeLink.rel = 'preload';
  closeLink.as = 'image';
  closeLink.href = closeIconUrl;
  document.head.appendChild(closeLink);
  const closeImg = new Image();
  closeImg.src = closeIconUrl;
}

const popupConfig = [
  {
    platform: 'youtube',
    title: 'YouTube',
    iconSrc: 'https://svgl.app/library/youtube.svg',
    settings: [
      { key: 'hideMoreSection', label: 'Hide More Section' },
      { key: 'hideExploreSection', label: 'Hide Explore Section' },
      { key: 'hideSettingsSection', label: 'Hide Settings Section' },
      { key: 'hideFooter', label: 'Hide Footer' },
      { key: 'hideCreateButton', label: 'Hide Create Button' },
      { key: 'hideNotificationsButton', label: 'Hide Notifications Button' },
      { key: 'hideAutoDubbedBadge', label: 'Hide Auto-dubbed Badge' },
      { key: 'hideFeedNudge', label: 'Hide Watch History Notice' },
      { key: 'hideAllShorts', label: 'Hide Shorts' },
      { key: 'searchFocus', label: "Search Focus (Press 's')" }
    ]
  },
  {
    platform: 'linkedin',
    title: 'LinkedIn',
    iconSrc: 'https://svgl.app/library/linkedin.svg',
    settings: [
      { key: 'searchFocus', label: "Search Focus (Press 's')" }
    ]
  },
  {
    platform: 'chatgpt',
    title: 'ChatGPT',
    iconSrc: 'https://svgl.app/library/openai_dark.svg',
    settings: [
      { key: 'hideAtlas', label: 'Hide Atlas' },
      { key: 'hideCodex', label: 'Hide Codex' },
      { key: 'hideLibrary', label: 'Hide Library' },
      { key: 'hideImages', label: 'Hide Images' }
    ]
  },
  {
    platform: 'n8n',
    title: 'N8N',
    iconSrc: 'https://svgl.app/library/n8n.svg',
    settings: [{ key: 'hideInsightsWrapper', label: 'Hide Insights Wrapper' }]
  },
  {
    platform: 'gmail',
    title: 'Gmail',
    iconSrc: 'https://svgl.app/library/gmail.svg',
    settings: [{ key: 'hideUpgradeButton', label: 'Hide Upgrade Button' }]
  },
  {
    platform: 'notion',
    title: 'Notion',
    iconSrc: 'https://svgl.app/library/notion.svg',
    settings: [{ key: 'hideAIButton', label: 'Hide AI Button' }]
  },
  {
    platform: 'googleCalendar',
    title: 'Google Calendar',
    iconSrc: 'https://upload.wikimedia.org/wikipedia/commons/a/a5/Google_Calendar_icon_%282020%29.svg',
    settings: [
      { key: 'hideTermsPrivacy', label: 'Hide Terms & Privacy Footer' },
      { key: 'hideBookingPages', label: 'Hide Booking Pages' },
      { key: 'hideSupportButton', label: 'Hide Support Button' },
      { key: 'hideSidePanelToggle', label: 'Hide Side Panel Toggle' },
      { key: 'reduceRoundedCorners', label: 'Reduce Rounded Corners' }
    ]
  },
  {
    platform: 'browser',
    title: 'Browser',
    iconSrc: chrome.runtime.getURL('icons/browser.svg'),
    settings: [
      { key: 'tabNumbering', label: 'Tab Numbering' },
      { key: 'blockInstagram', label: 'Block Instagram' },
      { key: 'blockYouTube', label: 'Block YouTube' },
      { key: 'blockLinkedIn', label: 'Block LinkedIn' }
    ]
  }
];

const popupStyles = `
  :host {
    all: initial;
      position: fixed;
      top: 16px;
      right: 16px;
    z-index: 2147483647;
    font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 13px;
      line-height: 1.4;
    font-weight: 400;
  }
  * {
    box-sizing: border-box;
    font-family: inherit;
    font-weight: 400;
  }
  .popup-card {
    background-color: rgba(13, 13, 13, 0.92);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
      border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
    width: 360px;
    max-height: 70vh;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }
  .popup-header {
    padding: 12px 16px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  .popup-header h1 {
      margin: 0;
    font-size: 14px;
    font-weight: 500;
      color: #ffffff;
    }
  .popup-close-btn {
      background: none;
      border: none;
    padding: 4px;
      cursor: pointer;
      color: rgba(255, 255, 255, 0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 4px;
      transition: all 0.2s;
    width: 24px;
    height: 24px;
    }
  .popup-close-btn:hover {
      background-color: rgba(255, 255, 255, 0.1);
      color: #ffffff;
    }
  .popup-close-btn img {
    width: 18px;
    height: 18px;
    object-fit: contain;
    filter: brightness(0) invert(1);
    opacity: 0.7;
  }
  .popup-close-btn:hover img {
    opacity: 1;
  }
  .popup-body {
    padding-left: 12px;
    padding-right: 12px;
    padding-top: 16px;
    padding-bottom: 16px;
      overflow-y: auto;
    max-height: calc(70vh - 50px);
    overscroll-behavior: contain;
  }
  .popup-body::-webkit-scrollbar {
    width: 6px;
    }
  .popup-body::-webkit-scrollbar-track {
    background: transparent;
  }
  .popup-body::-webkit-scrollbar-thumb {
    background: rgba(255,255,255,0);
    border-radius: 3px;
    transition: background 0.15s;
    }
  .popup-body.scrolling::-webkit-scrollbar-thumb {
    background: rgba(255,255,255,0.25);
  }
  .section {
      margin-bottom: 12px;
    }
  .section:last-child {
    margin-bottom: 4px;
    }
  .section-title {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 6px;
    padding-bottom: 4px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      font-size: 11px;
      font-weight: 600;
      color: rgba(255, 255, 255, 0.9);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
  .section-title img {
      width: 14px;
      height: 14px;
      object-fit: contain;
    }
  .section-title img[src*="browser.svg"] {
    filter: brightness(0) invert(1);
  }
  .row {
      display: flex;
      justify-content: space-between;
      align-items: center;
    padding: 8px 4px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    }
  .row:last-child {
      border-bottom: none;
    }
  .row-label {
      flex: 1;
      color: rgba(255, 255, 255, 0.8);
      font-size: 12px;
    }
  .switch {
      position: relative;
      display: inline-block;
      width: 36px;
      height: 20px;
      cursor: pointer;
    flex-shrink: 0;
    }
  .switch input {
      opacity: 0;
      width: 0;
      height: 0;
    }
  .slider {
      position: absolute;
      cursor: pointer;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(255, 255, 255, 0.2);
      border-radius: 20px;
    }
  .slider:before {
      position: absolute;
      content: "";
      height: 14px;
      width: 14px;
      left: 3px;
      bottom: 3px;
      background-color: white;
      border-radius: 50%;
    }
  .switch input:checked + .slider {
    background-color: #1283FF;
    }
  .switch input:checked + .slider:before {
      transform: translateX(16px);
    }
`;

function createPopup() {
  // Create host element for Shadow DOM
  popupHost = document.createElement('div');
  popupHost.id = 'webfix-popup-host';
  
  // Attach shadow root (closed for better isolation)
  const shadow = popupHost.attachShadow({ mode: 'closed' });
  
  // Add styles
  const styleEl = document.createElement('style');
  styleEl.textContent = popupStyles;
  shadow.appendChild(styleEl);

  // Build popup structure
  const card = document.createElement('div');
  card.className = 'popup-card';
  
  const header = document.createElement('div');
  header.className = 'popup-header';
  const title = document.createElement('h1');
  title.textContent = 'Webfix';
  header.appendChild(title);
  
  const closeBtn = document.createElement('button');
  closeBtn.className = 'popup-close-btn';
  closeBtn.setAttribute('aria-label', 'Close');
  const closeIcon = document.createElement('img');
  closeIcon.src = chrome.runtime.getURL('icons/cross.svg');
  closeIcon.alt = 'Close';
  closeBtn.appendChild(closeIcon);
  closeBtn.addEventListener('click', () => {
    closePopup();
  });
  header.appendChild(closeBtn);
  
  card.appendChild(header);
  
  const body = document.createElement('div');
  body.className = 'popup-body';

  // Get current settings and build sections
  chrome.storage.sync.get(['webfixSettings'], (result) => {
    const settings = mergeSettingsWithDefaults(result.webfixSettings || {});
    
    popupConfig.forEach(sectionCfg => {
      const section = document.createElement('div');
      section.className = 'section';
      
       const sectionTitle = document.createElement('div');
       sectionTitle.className = 'section-title';
       const icon = document.createElement('img');
       icon.src = sectionCfg.iconSrc;
       icon.alt = '';
       sectionTitle.appendChild(icon);
      const titleSpan = document.createElement('span');
      titleSpan.textContent = sectionCfg.title;
      sectionTitle.appendChild(titleSpan);
      section.appendChild(sectionTitle);
      
      sectionCfg.settings.forEach(s => {
        const row = document.createElement('div');
        row.className = 'row';
        
        const label = document.createElement('div');
        label.className = 'row-label';
        label.textContent = s.label;
        row.appendChild(label);
        
        const switchLabel = document.createElement('label');
        switchLabel.className = 'switch';
        const input = document.createElement('input');
        input.type = 'checkbox';
        input.checked = settings[sectionCfg.platform]?.[s.key] ?? true;
        const slider = document.createElement('span');
        slider.className = 'slider';
        switchLabel.appendChild(input);
        switchLabel.appendChild(slider);
        
        input.addEventListener('change', () => {
          setSetting(sectionCfg.platform, s.key, input.checked);
        });
        
        row.appendChild(switchLabel);
        section.appendChild(row);
      });
      
      body.appendChild(section);
    });
  });

  card.appendChild(body);
  
  shadow.appendChild(card);
  
  // Scrollbar auto-hide: show on scroll, hide when stopped
  let scrollTimeout = null;
  body.addEventListener('scroll', () => {
    body.classList.add('scrolling');
    if (scrollTimeout) clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      body.classList.remove('scrolling');
    }, 1000);
  }, { passive: true });
  
  // Prevent scroll chaining
  body.addEventListener('wheel', (e) => {
    const atTop = body.scrollTop <= 0;
    const atBottom = body.scrollTop + body.clientHeight >= body.scrollHeight - 1;
    if ((atTop && e.deltaY < 0) || (atBottom && e.deltaY > 0)) {
      e.preventDefault();
    }
    e.stopPropagation();
  }, { passive: false });
  
  // Close on click outside
  const clickOutsideHandler = (e) => {
    if (!popupHost.contains(e.target)) {
      closePopup();
    }
  };
  // Delay adding the listener to avoid immediate close from the same click that opened it
  setTimeout(() => {
    document.addEventListener('click', clickOutsideHandler, true);
  }, 10);
  popupHost._clickOutsideHandler = clickOutsideHandler;
  
  // Close on Escape
  const escHandler = (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      closePopup();
    }
  };
  document.addEventListener('keydown', escHandler, true);
  popupHost._escHandler = escHandler;
  
  // Append to documentElement (not body, to avoid SPA issues)
  document.documentElement.appendChild(popupHost);
}

function closePopup() {
  if (popupHost) {
    if (popupHost._escHandler) {
      document.removeEventListener('keydown', popupHost._escHandler, true);
    }
    if (popupHost._clickOutsideHandler) {
      document.removeEventListener('click', popupHost._clickOutsideHandler, true);
    }
    popupHost.remove();
    popupHost = null;
  }
}

function togglePopup() {
  if (popupHost && document.documentElement.contains(popupHost)) {
    closePopup();
  } else {
    createPopup();
  }
}

// ==================== TAB NUMBER FUNCTIONS ====================

// Store the original title without the number prefix
let originalTitleWithoutNumber = null;

// Get tab index and update title
async function updateTabTitleWithNumber() {
  const enabled = await getSetting('browser', 'tabNumbering');
  if (!enabled) {
    // If disabled, remove number prefix if present
    const currentTitle = document.title;
    const numberPrefixMatch = currentTitle.match(/^\d+\.\s(.+)$/);
    if (numberPrefixMatch) {
      document.title = numberPrefixMatch[1];
      originalTitleWithoutNumber = numberPrefixMatch[1];
    }
    return;
  }

  chrome.runtime.sendMessage({ action: 'getTabIndex' }, (response) => {
    // Always show the number, even if there's only one tab (tabIndex = 1)
    if (response && response.tabIndex !== null && response.tabIndex !== undefined) {
      const currentTitle = document.title;
      // Check if title already has a number prefix (format: "n. Title")
      const numberPrefixMatch = currentTitle.match(/^\d+\.\s(.+)$/);
      
      let titleToUse;
      if (numberPrefixMatch) {
        // Title already has a number, extract the actual title
        titleToUse = numberPrefixMatch[1];
        originalTitleWithoutNumber = titleToUse;
      } else {
        // No number prefix yet, use current title
        titleToUse = currentTitle;
        if (originalTitleWithoutNumber === null) {
          originalTitleWithoutNumber = currentTitle;
        } else {
          // Title changed, update stored original
          originalTitleWithoutNumber = currentTitle;
          titleToUse = currentTitle;
        }
      }
      
      // Update title with tab number (always show number, even for single tab)
      const newTitle = `${response.tabIndex}. ${titleToUse}`;
      if (document.title !== newTitle) {
        document.title = newTitle;
      }
    }
  });
}

// Watch for title changes and update with tab number
function watchTitleChanges() {
  // Create a MutationObserver to watch for title changes
  const titleObserver = new MutationObserver(async () => {
    const enabled = await getSetting('browser', 'tabNumbering');
    if (!enabled) return;

    const currentTitle = document.title;
    // Check if title changed and doesn't match our pattern
    const numberPrefixMatch = currentTitle.match(/^\d+\.\s(.+)$/);
    
    if (numberPrefixMatch) {
      // Title has our number prefix, update stored original title
      originalTitleWithoutNumber = numberPrefixMatch[1];
    } else if (originalTitleWithoutNumber && currentTitle !== originalTitleWithoutNumber) {
      // Title changed and doesn't have our prefix, update stored original
      originalTitleWithoutNumber = currentTitle;
      // Update with tab number
      setTimeout(updateTabTitleWithNumber, 50);
    } else if (!originalTitleWithoutNumber) {
      // First time, store original and update
      originalTitleWithoutNumber = currentTitle;
      setTimeout(updateTabTitleWithNumber, 50);
    }
  });
  
  // Observe the document head for title changes
  const titleElement = document.querySelector('title');
  if (titleElement) {
    titleObserver.observe(titleElement, {
      childList: true,
      characterData: true,
      subtree: true
    });
  }
  
  // Also periodically check for title changes (some sites update title via JS)
  let lastCheckedTitle = document.title;
  setInterval(async () => {
    const enabled = await getSetting('browser', 'tabNumbering');
    if (!enabled) return;

    const currentTitle = document.title;
    const numberPrefixMatch = currentTitle.match(/^\d+\.\s(.+)$/);
    
    // If title changed
    if (currentTitle !== lastCheckedTitle) {
      lastCheckedTitle = currentTitle;
      
      if (numberPrefixMatch) {
        // Title has our prefix, update stored original
        originalTitleWithoutNumber = numberPrefixMatch[1];
      } else if (originalTitleWithoutNumber) {
        // Title changed without our prefix, update stored original and re-add prefix
        originalTitleWithoutNumber = currentTitle;
        updateTabTitleWithNumber();
      } else {
        // First time, store original and update
        originalTitleWithoutNumber = currentTitle;
        updateTabTitleWithNumber();
      }
    }
  }, 500);
}

// Helper function to check if user is typing in an input field
function isUserTyping() {
  const activeElement = document.activeElement;
  return (
    activeElement &&
    (activeElement.tagName === 'INPUT' ||
     activeElement.tagName === 'TEXTAREA' ||
     activeElement.isContentEditable ||
     activeElement.getAttribute('contenteditable') === 'true' ||
     activeElement.closest('input') ||
     activeElement.closest('textarea') ||
     activeElement.closest('[contenteditable="true"]') ||
     activeElement.closest('[data-testid*="search"]') ||
     activeElement.closest('[role="searchbox"]') ||
     activeElement.closest('form[role="search"]') ||
     activeElement.getAttribute('type') === 'search' ||
     activeElement.getAttribute('placeholder')?.toLowerCase().includes('search'))
  );
}

// ==================== YOUTUBE FUNCTIONS ====================

// Hide "More from YouTube" section
async function hideYouTubeMoreSection() {
  const enabled = await getSetting('youtube', 'hideMoreSection');
  if (!enabled) return;
  // Find all ytd-guide-section-renderer elements
  const guideSections = document.querySelectorAll('ytd-guide-section-renderer');
  
  guideSections.forEach(section => {
    // Check for the "More from YouTube" title
    const titleElement = section.querySelector('yt-formatted-string#guide-section-title');
    if (titleElement && titleElement.textContent.trim() === 'More from YouTube') {
      section.style.display = 'none';
    }
  });
}

// Hide "Explore" section
async function hideYouTubeExploreSection() {
  const enabled = await getSetting('youtube', 'hideExploreSection');
  if (!enabled) return;
  // Find all ytd-guide-section-renderer elements
  const guideSections = document.querySelectorAll('ytd-guide-section-renderer');
  
  guideSections.forEach(section => {
    // Check for the "Explore" title
    const titleElement = section.querySelector('yt-formatted-string#guide-section-title');
    if (titleElement && titleElement.textContent.trim() === 'Explore') {
      section.style.display = 'none';
    }
  });
}

// Hide Settings/Help section (contains Settings, Report history, Help, Send feedback)
async function hideYouTubeSettingsSection() {
  const enabled = await getSetting('youtube', 'hideSettingsSection');
  if (!enabled) return;
  // Find all ytd-guide-section-renderer elements
  const guideSections = document.querySelectorAll('ytd-guide-section-renderer');
  
  guideSections.forEach(section => {
    // Check if this section contains Settings, Report history, Help, or Send feedback
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
      
      // Also check by link title attribute
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

// Hide YouTube footer
async function hideYouTubeFooter() {
  const enabled = await getSetting('youtube', 'hideFooter');
  if (!enabled) return;
  // Find the footer element
  const footer = document.querySelector('div#footer.style-scope.ytd-guide-renderer');
  if (footer) {
    footer.style.display = 'none';
  }
  
  // Also try alternative selector
  const footerByClass = document.querySelector('#footer.ytd-guide-renderer');
  if (footerByClass) {
    footerByClass.style.display = 'none';
  }
  
  // Fallback: find by id only
  const footerById = document.getElementById('footer');
  if (footerById && footerById.classList.contains('style-scope') && footerById.classList.contains('ytd-guide-renderer')) {
    footerById.style.display = 'none';
  }
}

// Hide YouTube Create button
async function hideYouTubeCreateButton() {
  const enabled = await getSetting('youtube', 'hideCreateButton');
  if (!enabled) return;
  // Find the Create button by aria-label
  const createButton = document.querySelector('button[aria-label="Create"]');
  if (createButton) {
    // Find the parent ytd-button-renderer and hide it
    const buttonRenderer = createButton.closest('ytd-button-renderer');
    if (buttonRenderer) {
      buttonRenderer.style.display = 'none';
    }
  }
  
  // Also try finding by text content
  const createByText = Array.from(document.querySelectorAll('ytd-button-renderer')).find(renderer => {
    const textContent = renderer.textContent.trim();
    return textContent === 'Create' || textContent.includes('Create');
  });
  if (createByText) {
    createByText.style.display = 'none';
  }
}

// Hide YouTube Notifications button
async function hideYouTubeNotificationsButton() {
  const enabled = await getSetting('youtube', 'hideNotificationsButton');
  if (!enabled) return;
  // Find the notifications button renderer
  const notificationsButton = document.querySelector('ytd-notification-topbar-button-renderer');
  if (notificationsButton) {
    notificationsButton.style.display = 'none';
  }
  
  // Also try finding by aria-label
  const notificationsByAria = document.querySelector('button[aria-label="Notifications"]');
  if (notificationsByAria) {
    const container = notificationsByAria.closest('ytd-notification-topbar-button-renderer');
    if (container) {
      container.style.display = 'none';
    }
  }
}

// Hide YouTube all Shorts comprehensively
async function hideYouTubeAllShorts() {
  const enabled = await getSetting('youtube', 'hideAllShorts');
  if (!enabled) return;

  // Hide shorts from sidebar navigation
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
    
  // Hide shorts shelf sections
  const shortsShelves = document.querySelectorAll('ytd-rich-shelf-renderer, ytd-shelf-renderer');
  shortsShelves.forEach(shelf => {
      const title = shelf.querySelector('span#title, div#title-text span#title');
    if (title && title.textContent.trim().toLowerCase() === 'shorts') {
        shelf.style.display = 'none';
      }
  });

  // Hide reel shelf renderers (Shorts carousel on homepage/search)
  const reelShelves = document.querySelectorAll('ytd-reel-shelf-renderer');
  reelShelves.forEach(shelf => {
    shelf.style.display = 'none';
  });

  // Hide individual shorts videos from feed
  const shortsVideos = document.querySelectorAll('ytd-video-renderer, ytd-compact-video-renderer, ytd-grid-video-renderer');
  shortsVideos.forEach(video => {
    // Check if it's a shorts video by looking for shorts indicators
    const badges = video.querySelectorAll('badge-shape, .ytd-badge-supported-renderer');
    let isShorts = false;

    badges.forEach(badge => {
      const badgeText = badge.textContent?.toLowerCase() || '';
      if (badgeText.includes('shorts') || badgeText.includes('short')) {
        isShorts = true;
      }
    });

    // Also check for shorts URL pattern
    const link = video.querySelector('a#thumbnail[href*="/shorts/"]');
    if (link) {
      isShorts = true;
    }

    // Check for shorts-specific classes or data
    if (video.classList.contains('ytd-shorts') ||
        video.getAttribute('data-shorts') ||
        video.querySelector('[class*="shorts"]')) {
      isShorts = true;
    }

    if (isShorts) {
      video.style.display = 'none';
    }
  });

  // Hide shorts from search results
  const searchResults = document.querySelectorAll('ytd-video-renderer');
  searchResults.forEach(result => {
    const link = result.querySelector('a[href*="/shorts/"]');
    if (link) {
      result.style.display = 'none';
    }
  });

  // Hide shorts from recommendations/sidebar
  const recommendations = document.querySelectorAll('ytd-compact-video-renderer');
  recommendations.forEach(rec => {
    const link = rec.querySelector('a[href*="/shorts/"]');
    if (link) {
      rec.style.display = 'none';
    }
  });

  // Hide entire sections/containers that contain shorts
  const sectionsWithShorts = document.querySelectorAll('ytd-rich-section-renderer, ytd-rich-grid-renderer, ytd-rich-shelf-renderer');
  sectionsWithShorts.forEach(section => {
    // Check if this section contains shorts content
    const shortsContent = section.querySelector('[href*="/shorts/"], [class*="shorts"], badge-shape');
    if (shortsContent) {
      const badgeText = shortsContent.textContent?.toLowerCase() || '';
      if (badgeText.includes('shorts') || badgeText.includes('short') || shortsContent.getAttribute('href')?.includes('/shorts/')) {
        section.style.display = 'none';
      }
    }

    // Also check section title for shorts
    const sectionTitle = section.querySelector('#title, .title, yt-formatted-string');
    if (sectionTitle) {
      const titleText = sectionTitle.textContent?.toLowerCase() || '';
      if (titleText.includes('shorts')) {
        section.style.display = 'none';
      }
    }
  });

  // Hide video grid sections that contain shorts
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

  // Hide grid shelf view models that contain shorts
  const gridShelves = document.querySelectorAll('grid-shelf-view-model.ytGridShelfViewModelHost');
  gridShelves.forEach(shelf => {
    // Check if this grid shelf contains shorts content
    const shortsContent = shelf.querySelector('ytm-shorts-lockup-view-model, ytm-shorts-lockup-view-model-v2, [href*="/shorts/"]');
    if (shortsContent) {
      shelf.style.display = 'none';
    }
    
    // Also check the title/header for "Shorts"
    const titleElement = shelf.querySelector('span.yt-core-attributed-string');
    if (titleElement && titleElement.textContent.trim().toLowerCase() === 'shorts') {
      shelf.style.display = 'none';
    }
  });

  // Hide any element that contains shorts content
  const allElements = document.querySelectorAll('[class*="shorts"], [id*="shorts"]');
  allElements.forEach(element => {
    const className = element.className.toLowerCase();
    const id = element.id.toLowerCase();
    if (className.includes('shorts') || id.includes('shorts')) {
      element.style.display = 'none';
    }
  });
}

// Hide YouTube "Auto-dubbed" badge
async function hideYouTubeAutoDubbedBadge() {
  const enabled = await getSetting('youtube', 'hideAutoDubbedBadge');
  if (!enabled) return;
  // Find all badge-shape elements
  const badges = document.querySelectorAll('badge-shape.yt-badge-shape');
  
  badges.forEach(badge => {
    // Check for "Auto-dubbed" text in the badge
    const badgeText = badge.querySelector('div.yt-badge-shape__text');
    if (badgeText && badgeText.textContent.trim() === 'Auto-dubbed') {
      badge.style.display = 'none';
    }
  });
  
  // Also try finding by text content directly
  const allBadges = document.querySelectorAll('badge-shape');
  allBadges.forEach(badge => {
    const text = badge.textContent.trim();
    if (text === 'Auto-dubbed' || text.includes('Auto-dubbed')) {
      badge.style.display = 'none';
    }
  });
}

// Helper function to find YouTube search input
function findYouTubeSearchInput() {
  // Try common selectors for YouTube search input
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
        // Check if input is visible
        const rect = searchInput.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          break;
        }
      }
      searchInput = null;
    } catch (e) {
      // Invalid selector, continue
      continue;
    }
  }

  // Fallback: search all inputs and find one that looks like a search input
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

// Block YouTube feed nudge (watch history off message)
async function hideYouTubeFeedNudge() {
  const enabled = await getSetting('youtube', 'hideFeedNudge');
  if (!enabled) return;
  // Find the feed nudge renderer
  const feedNudges = document.querySelectorAll('ytd-feed-nudge-renderer');
  feedNudges.forEach(nudge => {
    // Check if this contains the "Your watch history is off" message
    const titleElement = nudge.querySelector('#title');
    if (titleElement && titleElement.textContent.trim() === 'Your watch history is off') {
      // Remove the parent rich section renderer that contains this nudge
      const richSection = nudge.closest('ytd-rich-section-renderer');
      if (richSection) {
        richSection.remove();
      } else {
        // Fallback: remove the nudge itself
        nudge.remove();
      }
      return;
    }
  });

  // Also target by the parent container directly
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

// Handle search bar focus with 's' key for YouTube
let youtubeSearchListenerAdded = false;
function handleYouTubeSearchFocus() {
  if (youtubeSearchListenerAdded) return;
  youtubeSearchListenerAdded = true;
  
  document.addEventListener('keydown', async (e) => {
    // Check setting dynamically
    const enabled = await getSetting('youtube', 'searchFocus');
    if (!enabled) return;
    
    // Handle 's' key to focus search bar
    if (e.key === 's' || e.key === 'S') {
      // Don't trigger if user is typing in an input field or search bar
      if (isUserTyping()) {
        return;
      }

      // Don't trigger if modifier keys are pressed
      if (e.ctrlKey || e.metaKey || e.altKey || e.shiftKey) {
        return;
      }

      const searchInput = findYouTubeSearchInput();

      if (searchInput) {
        e.preventDefault();
        e.stopPropagation();
        searchInput.focus();
        // Select any existing text in the search input
        if (searchInput.value) {
          searchInput.select();
        }
        return false;
      }
    }
    
    // Handle Escape key to blur search bar
    if (e.key === 'Escape') {
      const activeElement = document.activeElement;
      const searchInput = findYouTubeSearchInput();
      
      // If the search input is focused, blur it
      if (searchInput && activeElement === searchInput) {
        e.preventDefault();
        e.stopPropagation();
        searchInput.blur();
        return false;
      }
    }
  }, true);
}

// ==================== LINKEDIN FUNCTIONS ====================

// Helper function to find LinkedIn search input
function findLinkedInSearchInput() {
  // Try common selectors for LinkedIn search input
  const searchInputSelectors = [
    'input[placeholder*="Search"]',
    'input[aria-label*="Search"]',
    'input[aria-label*="search"]',
    'input[role="combobox"][aria-label*="Search"]',
    'input[role="combobox"][aria-label*="search"]',
    'input[type="search"]',
    'form[role="search"] input'
  ];

  let searchInput = null;
  for (const selector of searchInputSelectors) {
    try {
      searchInput = document.querySelector(selector);
      if (searchInput && searchInput.offsetParent !== null) {
        // Check if input is visible
        const rect = searchInput.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          break;
        }
      }
      searchInput = null;
    } catch (e) {
      // Invalid selector, continue
      continue;
    }
  }

  // Fallback: search all inputs and find one that looks like a search input
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

// Handle search bar focus with 's' key for LinkedIn
let linkedinSearchListenerAdded = false;
function handleLinkedInSearchFocus() {
  if (linkedinSearchListenerAdded) return;
  linkedinSearchListenerAdded = true;
  
  document.addEventListener('keydown', async (e) => {
    // Check setting dynamically
    const enabled = await getSetting('linkedin', 'searchFocus');
    if (!enabled) return;
    
    // Handle 's' key to focus search bar
    if (e.key === 's' || e.key === 'S') {
      // Don't trigger if user is typing in an input field or search bar
      if (isUserTyping()) {
        return;
      }

      // Don't trigger if modifier keys are pressed
      if (e.ctrlKey || e.metaKey || e.altKey || e.shiftKey) {
        return;
      }

      const searchInput = findLinkedInSearchInput();

      if (searchInput) {
        e.preventDefault();
        e.stopPropagation();
        searchInput.focus();
        // Select any existing text in the search input
        if (searchInput.value) {
          searchInput.select();
        }
        return false;
      }
    }

    // Handle Escape key to blur search bar
    if (e.key === 'Escape') {
      const activeElement = document.activeElement;
      const searchInput = findLinkedInSearchInput();
      
      // If the search input is focused, blur it
      if (searchInput && activeElement === searchInput) {
        e.preventDefault();
        e.stopPropagation();
        searchInput.blur();
        return false;
      }
    }
  }, true);
}

// ==================== N8N FUNCTIONS ====================

// Hide insights wrapper on workflows page
async function hideN8nInsightsWrapper() {
  const enabled = await getSetting('n8n', 'hideInsightsWrapper');
  if (!enabled) return;
  // Primary method: Find by data-test-id and hide its parent container
  const insightsTabs = document.querySelector('[data-test-id="insights-summary-tabs"]');
  if (insightsTabs) {
    // Find the parent div with class matching _insights_*_123 pattern
    let parent = insightsTabs.parentElement;
    while (parent && parent !== document.body) {
      const classList = Array.from(parent.classList);
      const hasInsightsClass = classList.some(cls => 
        cls.startsWith('_insights') && cls.endsWith('_123')
      );
      if (hasInsightsClass) {
        parent.style.display = 'none';
        break;
      }
      parent = parent.parentElement;
    }
  }
  
  // Fallback: Find all divs with class matching _insights_*_123 pattern
  const allDivs = document.querySelectorAll('div[class*="_insights"]');
  allDivs.forEach(div => {
    const classList = Array.from(div.classList);
    const hasInsightsClass = classList.some(cls => 
      (cls.startsWith('_insights') || cls.startsWith('_insightsWrapper')) && 
      cls.endsWith('_123')
    );
    if (hasInsightsClass) {
      div.style.display = 'none';
    }
  });
}

async function runN8n() {
  await hideN8nInsightsWrapper();
}

// ==================== GMAIL FUNCTIONS ====================

// Hide Gmail Upgrade button
async function hideGmailUpgradeButton() {
  const enabled = await getSetting('gmail', 'hideUpgradeButton');
  if (!enabled) return;
  // Primary method: Target the outer wrapper span with class "I6agWe" that contains "Upgrade"
  const upgradeWrapperSpans = document.querySelectorAll('span.I6agWe');
  upgradeWrapperSpans.forEach(wrapper => {
    const textContent = wrapper.textContent.trim();
    if (textContent.includes('Upgrade')) {
      wrapper.style.display = 'none';
      return;
    }
  });
  
  // Find the Upgrade button by text content
  const upgradeButtons = Array.from(document.querySelectorAll('button, [role="link"]'));
  upgradeButtons.forEach(button => {
    const textContent = button.textContent.trim();
    if (textContent === 'Upgrade') {
      // Find the parent wrapper span with class "I6agWe" first
      const outerWrapper = button.closest('span.I6agWe');
      if (outerWrapper) {
        outerWrapper.style.display = 'none';
        return;
      }
      // Fallback: Find the parent wrapper div with class "bzc-Uw-LV-Zr"
      const wrapper = button.closest('div.bzc-Uw-LV-Zr');
      if (wrapper) {
        wrapper.style.display = 'none';
      } else {
        // Fallback: hide the button itself
        button.style.display = 'none';
      }
    }
  });
  
  // Also target by specific selectors from the HTML structure
  const upgradeButtonByJsname = document.querySelector('button[jsname="xJyP9e"]');
  if (upgradeButtonByJsname && upgradeButtonByJsname.textContent.trim() === 'Upgrade') {
    const outerWrapper = upgradeButtonByJsname.closest('span.I6agWe');
    if (outerWrapper) {
      outerWrapper.style.display = 'none';
    } else {
    const wrapper = upgradeButtonByJsname.closest('div.bzc-Uw-LV-Zr');
    if (wrapper) {
      wrapper.style.display = 'none';
    } else {
      upgradeButtonByJsname.style.display = 'none';
      }
    }
  }
  
  // Target by span with jsname="V67aGc" containing "Upgrade"
  const upgradeSpan = document.querySelector('span[jsname="V67aGc"]');
  if (upgradeSpan && upgradeSpan.textContent.trim() === 'Upgrade') {
    const outerWrapper = upgradeSpan.closest('span.I6agWe');
    if (outerWrapper) {
      outerWrapper.style.display = 'none';
    } else {
    const button = upgradeSpan.closest('button');
    if (button) {
      const wrapper = button.closest('div.bzc-Uw-LV-Zr');
      if (wrapper) {
        wrapper.style.display = 'none';
      } else {
        button.style.display = 'none';
        }
      }
    }
  }
  
  // Direct selector for the wrapper div
  const upgradeWrapper = document.querySelector('div.bzc-Uw-LV-Zr[data-is-touch-wrapper="true"]');
  if (upgradeWrapper) {
    const button = upgradeWrapper.querySelector('button');
    if (button) {
      const upgradeText = button.querySelector('span[jsname="V67aGc"]');
      if (upgradeText && upgradeText.textContent.trim() === 'Upgrade') {
        const outerWrapper = upgradeWrapper.closest('span.I6agWe');
        if (outerWrapper) {
          outerWrapper.style.display = 'none';
        } else {
        upgradeWrapper.style.display = 'none';
        }
      }
    }
  }
}

async function runGmail() {
  await hideGmailUpgradeButton();
}

// ==================== NOTION FUNCTIONS ====================

// Hide Notion AI button
async function hideNotionAIButton() {
  const enabled = await getSetting('notion', 'hideAIButton');
  if (!enabled) return;
  // Target the specific AI button by its characteristics
  const aiButtonSelectors = [
    '.notion-ai-button[aria-label="ai"]',
    '[role="button"][aria-label="ai"].notion-ai-button',
    'div[role="button"][tabindex="0"][aria-label="ai"]',
    'div.notion-ai-button'
  ];

  aiButtonSelectors.forEach(selector => {
    try {
      const elements = document.querySelectorAll(selector);
      elements.forEach(element => {
        // Verify it's the AI button by checking for the specific structure
        const ariaLabel = element.getAttribute('aria-label');
        const role = element.getAttribute('role');
        const className = element.className;

        if (ariaLabel === 'ai' && role === 'button' && className.includes('notion-ai-button')) {
          // Additional verification: check for the image content
          const img = element.querySelector('img[alt="Notion AI face"]');
          if (img) {
            element.remove();
            return;
          }
        }
      });
    } catch (e) {
      // Ignore invalid selectors
    }
  });

  // Fallback: Look for any element with the exact structure from the HTML
  const allDivs = document.querySelectorAll('div[role="button"][aria-label="ai"]');
  allDivs.forEach(div => {
    if (div.classList.contains('notion-ai-button')) {
      // Check if it contains the AI face image
      const aiFaceImg = div.querySelector('img[alt="Notion AI face"]');
      if (aiFaceImg) {
        div.remove();
      }
    }
  });

  // Target the sidebar AI button/link
  const sidebarAISelectors = [
    'a[href="/ai"][data-testid="sidebar-ai-button"]',
    'a[data-testid="sidebar-ai-button"]',
    'a[href="/ai"]'
  ];

  sidebarAISelectors.forEach(selector => {
    try {
      const elements = document.querySelectorAll(selector);
      elements.forEach(element => {
        // Verify it's the sidebar AI button by checking for "Notion AI" text and AI icon
        const textContent = element.textContent?.trim();
        const href = element.getAttribute('href');
        const dataTestId = element.getAttribute('data-testid');

        if ((textContent === 'Notion AI' || textContent?.includes('Notion AI')) &&
            (href === '/ai' || dataTestId === 'sidebar-ai-button')) {
          // Additional verification: check for the AI face SVG
          const aiFaceSvg = element.querySelector('svg.aiFace');
          if (aiFaceSvg) {
            element.remove();
            return;
          }
        }
      });
    } catch (e) {
      // Ignore invalid selectors
    }
  });

  // Additional fallback: Look for any link with "Notion AI" text
  const allLinks = document.querySelectorAll('a[href*="/ai"], a[href*="ai"]');
  allLinks.forEach(link => {
    const textContent = link.textContent?.trim();
    if (textContent === 'Notion AI' || textContent?.includes('Notion AI')) {
      // Check if it has the AI face SVG
      const aiFaceSvg = link.querySelector('svg.aiFace');
      if (aiFaceSvg) {
        link.remove();
      }
    }
  });

  // Target the help/contact button
  const helpButtonSelectors = [
    'div[aria-label*="Help, contact, more"]',
    'div[aria-label*="Help"]',
    '[role="button"][aria-label*="Help"]',
    'div[role="button"][aria-haspopup="dialog"]'
  ];

  helpButtonSelectors.forEach(selector => {
    try {
      const elements = document.querySelectorAll(selector);
      elements.forEach(element => {
        const ariaLabel = element.getAttribute('aria-label');
        const role = element.getAttribute('role');
        const ariaHaspopup = element.getAttribute('aria-haspopup');

        // Check for the help button characteristics
        if (ariaLabel && ariaLabel.includes('Help') && role === 'button' && ariaHaspopup === 'dialog') {
          // Verify it contains the question mark circle SVG
          const questionMarkSvg = element.querySelector('svg.questionMarkCircle');
          if (questionMarkSvg) {
            element.remove();
            return;
          }
        }
      });
    } catch (e) {
      // Ignore invalid selectors
    }
  });

  // Fallback: Look for any button with question mark circle SVG
  const allButtons = document.querySelectorAll('div[role="button"], button');
  allButtons.forEach(button => {
    const questionMarkSvg = button.querySelector('svg.questionMarkCircle');
    if (questionMarkSvg) {
      // Check if it has help-related aria-label
      const ariaLabel = button.getAttribute('aria-label');
      if (ariaLabel && (ariaLabel.includes('Help') || ariaLabel.includes('contact'))) {
        button.remove();
      }
    }
  });
}

async function runNotion() {
  await hideNotionAIButton();
}

// ==================== GOOGLE CALENDAR FUNCTIONS ====================

// Hide Google Calendar Terms & Privacy footer
async function hideGoogleCalendarTermsPrivacy() {
  const enabled = await getSetting('googleCalendar', 'hideTermsPrivacy');
  if (!enabled) return;
  
  // Target the footer div with class "erDb5d" containing Terms and Privacy links
  const footerDivs = document.querySelectorAll('div.erDb5d');
  footerDivs.forEach(div => {
    // Verify it contains the Terms and Privacy links
    const termsLink = div.querySelector('a[href*="policies/terms"]');
    const privacyLink = div.querySelector('a[href*="policies/privacy"]');
    if (termsLink || privacyLink) {
      div.style.display = 'none';
    }
  });
  
  // Also target by link class as fallback
  const termsPrivacyLinks = document.querySelectorAll('a.PTIB6e[href*="policies"]');
  termsPrivacyLinks.forEach(link => {
    const parent = link.parentElement;
    if (parent && parent.classList.contains('erDb5d')) {
      parent.style.display = 'none';
    }
  });
}

// Hide Google Calendar "Booking pages" section
async function hideGoogleCalendarBookingPages() {
  const enabled = await getSetting('googleCalendar', 'hideBookingPages');
  if (!enabled) return;
  
  // Target the main container div with class "EKq2Ub"
  const bookingDivs = document.querySelectorAll('div.EKq2Ub');
  bookingDivs.forEach(div => {
    // Verify it contains "Booking pages" text
    const bookingText = div.querySelector('.az313e');
    if (bookingText && bookingText.textContent.includes('Booking pages')) {
      div.style.display = 'none';
    }
  });
  
  // Fallback: target by button aria-label
  const createButtons = document.querySelectorAll('button[aria-label="Create appointment schedule"]');
  createButtons.forEach(button => {
    const container = button.closest('div.EKq2Ub');
    if (container) {
      container.style.display = 'none';
    }
  });
}

// Hide Google Calendar "Support" button
async function hideGoogleCalendarSupportButton() {
  const enabled = await getSetting('googleCalendar', 'hideSupportButton');
  if (!enabled) return;
  
  // Target the main container div with class "h8Aqhb"
  const supportDivs = document.querySelectorAll('div.h8Aqhb');
  supportDivs.forEach(div => {
    // Verify it contains the Support button
    const supportButton = div.querySelector('button[aria-label="Support"]');
    if (supportButton) {
      div.style.display = 'none';
    }
  });
  
  // Fallback: target by button aria-label directly
  const supportButtons = document.querySelectorAll('button[aria-label="Support"]');
  supportButtons.forEach(button => {
    const container = button.closest('div.h8Aqhb');
    if (container) {
      container.style.display = 'none';
    }
  });
}

// Hide Google Calendar "Show side panel" toggle button
async function hideGoogleCalendarSidePanelToggle() {
  const enabled = await getSetting('googleCalendar', 'hideSidePanelToggle');
  if (!enabled) return;
  
  // Target the main container div with class "Kk7lMc-QWPxkf-LgbsSe-haAclf"
  const toggleDivs = document.querySelectorAll('div.Kk7lMc-QWPxkf-LgbsSe-haAclf');
  toggleDivs.forEach(div => {
    // Verify it contains the Show side panel button
    const toggleButton = div.querySelector('[aria-label="Show side panel"], [aria-label="Hide side panel"]');
    if (toggleButton) {
      div.style.display = 'none';
    }
  });
  
  // Fallback: target by button aria-label directly
  const toggleButtons = document.querySelectorAll('[aria-label="Show side panel"], [aria-label="Hide side panel"]');
  toggleButtons.forEach(button => {
    const container = button.closest('div.Kk7lMc-QWPxkf-LgbsSe-haAclf');
    if (container) {
      container.style.display = 'none';
    }
  });
}

// Reduce Google Calendar rounded corners
let googleCalendarStyleInjected = false;
async function reduceGoogleCalendarRoundedCorners() {
  const enabled = await getSetting('googleCalendar', 'reduceRoundedCorners');
  
  // Remove existing style if disabled
  const existingStyle = document.getElementById('webfix-gcal-corners');
  if (!enabled) {
    if (existingStyle) existingStyle.remove();
    googleCalendarStyleInjected = false;
    return;
  }
  
  // Only inject once
  if (googleCalendarStyleInjected) return;
  
  const style = document.createElement('style');
  style.id = 'webfix-gcal-corners';
  style.textContent = `
    /* Main calendar grid container */
    .lYYbjc,
    #YPCqFe,
    .mXmivb,
    .RAaXne,
    .ogB5bf {
      border-radius: 4px !important;
    }
    
    /* Calendar cells and grid elements */
    .FLFkR,
    .RCXPcd,
    .qLWd9c,
    .PTdDEc,
    .MGaLHf,
    .ChfiMc,
    .w6FdBf {
      border-radius: 2px !important;
    }
    
    /* Event chips */
    [data-eventid],
    .FAxxKc,
    .WYrqKe,
    .E0Zk5d {
      border-radius: 4px !important;
    }
    
    /* Buttons and inputs */
    .uArJ5e,
    .VfPpkd-LgbsSe,
    .pYTkkf-Bz112c-LgbsSe {
      border-radius: 4px !important;
    }
    
    /* Date number circles */
    .w48V4c {
      border-radius: 4px !important;
    }
  `;
  document.head.appendChild(style);
  googleCalendarStyleInjected = true;
}

async function runGoogleCalendar() {
  await Promise.all([
    hideGoogleCalendarTermsPrivacy(),
    hideGoogleCalendarBookingPages(),
    hideGoogleCalendarSupportButton(),
    hideGoogleCalendarSidePanelToggle(),
    reduceGoogleCalendarRoundedCorners()
  ]);
}

// ==================== CHATGPT FUNCTIONS ====================

// Hide ChatGPT Atlas menu item
async function hideChatGPTAtlas() {
  const enabled = await getSetting('chatgpt', 'hideAtlas');
  if (!enabled) return;
  const atlasLink = Array.from(document.querySelectorAll('a[href="/atlas"]')).find(
    link => link.textContent.includes('Atlas')
  );
  if (atlasLink) {
    atlasLink.style.display = 'none';
  }
  
  const atlasByData = document.querySelector('a[href="/atlas"][data-sidebar-item="true"]');
  if (atlasByData) {
    atlasByData.style.display = 'none';
  }
  
  const atlasByDiscover = document.querySelector('a[href="/atlas"][data-discover="true"]');
  if (atlasByDiscover) {
    atlasByDiscover.style.display = 'none';
  }
}

// Hide ChatGPT Codex menu item
async function hideChatGPTCodex() {
  const enabled = await getSetting('chatgpt', 'hideCodex');
  if (!enabled) return;
  const codexLink = Array.from(document.querySelectorAll('a[href="/codex"]')).find(
    link => link.textContent.includes('Codex')
  );
  if (codexLink) {
    codexLink.style.display = 'none';
  }
  
  const codexByData = document.querySelector('a[href="/codex"][data-sidebar-item="true"]');
  if (codexByData) {
    codexByData.style.display = 'none';
  }
  
  const codexByDiscover = document.querySelector('a[href="/codex"][data-discover="true"]');
  if (codexByDiscover) {
    codexByDiscover.style.display = 'none';
  }
}

// Hide ChatGPT Library menu item
async function hideChatGPTLibrary() {
  const enabled = await getSetting('chatgpt', 'hideLibrary');
  if (!enabled) return;
  const libraryLink = Array.from(document.querySelectorAll('a[href*="/library"]')).find(
    link => link.textContent.includes('Library')
  );
  if (libraryLink) {
    libraryLink.style.display = 'none';
  }
  
  const libraryByData = document.querySelector('a[data-testid="sidebar-item-library"]');
  if (libraryByData) {
    libraryByData.style.display = 'none';
  }
  
  const libraryByDiscover = document.querySelector('a[href*="/library"][data-discover="true"]');
  if (libraryByDiscover) {
    libraryByDiscover.style.display = 'none';
  }
}

// Hide ChatGPT Images menu item
async function hideChatGPTImages() {
  const enabled = await getSetting('chatgpt', 'hideImages');
  if (!enabled) return;
  const imagesLink = Array.from(document.querySelectorAll('a[href="/images"]')).find(
    link => link.textContent.includes('Images')
  );
  if (imagesLink) {
    imagesLink.style.display = 'none';
  }
  
  const imagesByData = document.querySelector('a[href="/images"][data-sidebar-item="true"]');
  if (imagesByData) {
    imagesByData.style.display = 'none';
  }
  
  const imagesByDiscover = document.querySelector('a[href="/images"][data-discover="true"]');
  if (imagesByDiscover) {
    imagesByDiscover.style.display = 'none';
  }
  
  const imagesByTestId = document.querySelector('a[data-testid="sidebar-item-library"][href="/images"]');
  if (imagesByTestId) {
    imagesByTestId.style.display = 'none';
  }
}

async function runChatGPT() {
  await Promise.all([
    hideChatGPTAtlas(),
    hideChatGPTCodex(),
    hideChatGPTLibrary(),
    hideChatGPTImages()
  ]);
  
  // Check for pending YouTube transcript to paste
  checkAndPastePendingText();
}

// Check for pending text from YouTube and paste it into ChatGPT
async function checkAndPastePendingText() {
  try {
    const result = await chrome.storage.local.get('pendingChatGPTText');
    const pendingText = result.pendingChatGPTText;
    
    if (pendingText) {
      // Clear the stored text immediately to prevent re-pasting
      await chrome.storage.local.remove('pendingChatGPTText');
      
      // Wait for ChatGPT's input to be ready
      const maxWait = 10000; // 10 seconds max
      const startTime = Date.now();
      
      const waitForInput = () => {
        // Try to find the textarea/input
        const textarea = document.querySelector('textarea[data-id], #prompt-textarea, textarea[placeholder*="Message"], div[contenteditable="true"][data-placeholder]');
        
        if (textarea) {
          // Found the input, paste the text
          if (textarea.tagName === 'TEXTAREA') {
            textarea.value = pendingText;
            textarea.dispatchEvent(new Event('input', { bubbles: true }));
          } else {
            // contenteditable div
            textarea.innerText = pendingText;
            textarea.dispatchEvent(new Event('input', { bubbles: true }));
          }
          textarea.focus();
        } else if (Date.now() - startTime < maxWait) {
          // Keep waiting
          setTimeout(waitForInput, 500);
        }
      };
      
      // Start waiting for input
      setTimeout(waitForInput, 1000);
    }
  } catch (e) {
    console.error('Error checking pending text:', e);
  }
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
    hideYouTubeAllShorts()
  ]);
}

// ==================== MAIN INITIALIZATION ====================

// Initial run when script loads
async function initialize() {
  await loadSettingsOnce();

  // Preload all popup assets (icons, images, fonts) so popup opens instantly
  preloadPopupAssets();
  
  const site = getCurrentSite();
  
  // Update tab title with number for all sites
  updateTabTitleWithNumber();
  watchTitleChanges();
  
  // Listen for visibility changes (when tab becomes active/inactive)
  document.addEventListener('visibilitychange', async () => {
    if (!document.hidden) {
      // Tab became visible, update the number
      const enabled = await getSetting('browser', 'tabNumbering');
      if (enabled) {
      updateTabTitleWithNumber();
      }
    }
  });
  
  // Listen for messages from background script to update tab number
  // (This listener is also set up globally below)
  
  if (site === 'chatgpt') {
    runChatGPT();
  } else if (site === 'youtube') {
    runYouTube();
    handleYouTubeSearchFocus();
  } else if (site === 'linkedin') {
    handleLinkedInSearchFocus();
  } else if (site === 'n8n') {
    runN8n();
  } else if (site === 'gmail') {
    runGmail();
  } else if (site === 'notion') {
    runNotion();
  } else if (site === 'googleCalendar') {
    runGoogleCalendar();
  }
}

// Set up message listener globally (outside of initialize)
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

// Watch for tabNumbering setting changes and apply immediately (no refresh needed)
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'sync' && changes.webfixSettings) {
    const newSettings = changes.webfixSettings.newValue;
    const oldSettings = changes.webfixSettings.oldValue;
    
    // Update cached settings
    cachedSettings = mergeSettingsWithDefaults(newSettings || {});
    
    // Check if tabNumbering changed
    const newTabNumbering = newSettings?.browser?.tabNumbering;
    const oldTabNumbering = oldSettings?.browser?.tabNumbering;
    
    if (newTabNumbering !== oldTabNumbering) {
      // Apply immediately
      updateTabTitleWithNumber();
    }
    
    // Check if Instagram blocking changed
    const newBlockInstagram = newSettings?.browser?.blockInstagram;
    const oldBlockInstagram = oldSettings?.browser?.blockInstagram;

    if (newBlockInstagram !== oldBlockInstagram) {
      // For Instagram blocking changes, we need to reload to apply/remove the block
      // since the immediate check at script load determines the blocking
      const hostname = window.location.hostname;
      if (hostname.includes('instagram.com') || hostname.includes('instagr.am')) {
        window.location.reload();
      }
    }

    // Check if YouTube blocking changed
    const newBlockYouTube = newSettings?.browser?.blockYouTube;
    const oldBlockYouTube = oldSettings?.browser?.blockYouTube;

    if (newBlockYouTube !== oldBlockYouTube) {
      // For YouTube blocking changes, we need to reload to apply/remove the block
      // since the immediate check at script load determines the blocking
      const hostname = window.location.hostname;
      if (hostname.includes('youtube.com') || hostname.includes('youtu.be')) {
        window.location.reload();
      }
    }

    // Check if LinkedIn blocking changed
    const newBlockLinkedIn = newSettings?.browser?.blockLinkedIn;
    const oldBlockLinkedIn = oldSettings?.browser?.blockLinkedIn;

    if (newBlockLinkedIn !== oldBlockLinkedIn) {
      // For LinkedIn blocking changes, we need to reload to apply/remove the block
      // since the immediate check at script load determines the blocking
      const hostname = window.location.hostname;
      if (hostname.includes('linkedin.com')) {
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

// Watch for DOM changes using MutationObserver
const observer = new MutationObserver((mutations) => {
  const site = getCurrentSite();
  
  if (site === 'chatgpt') {
    // Run ChatGPT cleanup on DOM changes
    runChatGPT();
  } else if (site === 'youtube') {
    // Check for newly added YouTube feed nudge and remove it immediately
    let feedNudgeDetected = false;
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === 1) { // Element node
            const element = node;

            // Check if this is a feed nudge renderer
            if (element.matches && (
              element.matches('ytd-feed-nudge-renderer') ||
              element.querySelector('ytd-feed-nudge-renderer')
            )) {
              // Find the feed nudge and check its content
              let nudgeElement = element.matches('ytd-feed-nudge-renderer') ? element : element.querySelector('ytd-feed-nudge-renderer');
              if (nudgeElement) {
                const titleElement = nudgeElement.querySelector('#title');
                if (titleElement && titleElement.textContent.trim() === 'Your watch history is off') {
                  // Remove the entire parent rich section renderer
                  const richSection = nudgeElement.closest('ytd-rich-section-renderer');
                  if (richSection) {
                    richSection.remove();
                    feedNudgeDetected = true;
                  } else {
                    // Fallback: remove the nudge itself
                    nudgeElement.remove();
                    feedNudgeDetected = true;
              }
            }
          }
      }
      
            // Also check for rich section renderer containing feed nudge
            if (element.matches && element.matches('ytd-rich-section-renderer')) {
              const nudge = element.querySelector('ytd-feed-nudge-renderer');
              if (nudge) {
                const titleElement = nudge.querySelector('#title');
                if (titleElement && titleElement.textContent.trim() === 'Your watch history is off') {
                  element.remove();
                  feedNudgeDetected = true;
            }
          }
        }
      }
    });
      }
    });

    // If no feed nudge was detected in this mutation, run regular YouTube cleanup
    if (!feedNudgeDetected) {
    runYouTube();
    }
  } else if (site === 'n8n') {
    // Run n8n cleanup on DOM changes
    runN8n();
  } else if (site === 'gmail') {
    // Run Gmail cleanup on DOM changes
    runGmail();
  } else if (site === 'notion') {
    // Run Notion cleanup on DOM changes
    runNotion();
  } else if (site === 'googleCalendar') {
    // Run Google Calendar cleanup on DOM changes
    runGoogleCalendar();
  }
});

// Start observing when body is available
function startObserver() {
  if (document.body) {
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'class', 'aria-label']
    });
  } else {
    // Wait for body if not ready yet
    setTimeout(startObserver, 100);
  }
}

startObserver();

// Periodic check as backup
setInterval(() => {
  const site = getCurrentSite();
  
  if (site === 'chatgpt') {
    runChatGPT();
  } else if (site === 'youtube') {
    runYouTube();
  } else if (site === 'n8n') {
    runN8n();
  } else if (site === 'gmail') {
    runGmail();
  } else if (site === 'notion') {
    runNotion();
  } else if (site === 'googleCalendar') {
    runGoogleCalendar();
  }
}, 1000);

