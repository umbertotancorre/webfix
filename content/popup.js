let popupHost = null;

function preloadPopupAssets() {
  popupConfig.forEach(sectionCfg => {
    const img = new Image();
    img.src = sectionCfg.iconSrc;
  });

  const closeImg = new Image();
  closeImg.src = chrome.runtime.getURL('icons/cross.svg');
}

const popupConfig = [
  {
    platform: 'browser',
    title: 'Browser',
    iconSrc: chrome.runtime.getURL('icons/browser.svg'),
    settings: [
      { key: 'tabNumbering', label: 'Tab Numbering' },
      { key: 'blockInstagram', label: 'Block Instagram' },
      { key: 'blockYouTube', label: 'Block YouTube' },
      { key: 'blockLinkedIn', label: 'Block LinkedIn' },
      { key: 'blockX', label: 'Block X' },
      { type: 'action', label: 'Export Bookmarks', actionLabel: 'Export JSON', onAction: downloadBookmarksJson }
    ]
  },
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
      { key: 'hideVideoSuggestions', label: 'Hide Video Suggestions' },
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
    platform: 'gmail',
    title: 'Gmail',
    iconSrc: 'https://svgl.app/library/gmail.svg',
    settings: [{ key: 'hideUpgradeButton', label: 'Hide Upgrade Button' }]
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
      { key: 'hideCreateButton', label: 'Hide Create Button' },
      { key: 'hideSwitchButtons', label: 'Hide Calendar/Tasks Switcher Icon' },
      { key: 'hideSearchPeople', label: 'Hide Search for People' },
      { key: 'hideMiniMonth', label: 'Hide Side Panel Mini-Month' },
      { key: 'hideBirthdays', label: 'Hide Birthdays Calendar' },
      { key: 'hideTasks', label: 'Hide Tasks Calendar' },
      { key: 'hideNavigationButtons', label: 'Hide Today Button' },
      { key: 'hideViewSwitcher', label: 'Hide View Switcher' },
      { key: 'hideUpgradeButton', label: 'Hide Upgrade Button' }
    ]
  },
  {
    platform: 'x',
    title: 'X',
    iconSrc: 'https://svgl.app/library/x.svg',
    iconStyle: 'filter: invert(1);',
    settings: [
      { key: 'hideNavLogo', label: 'Nav: Hide X Logo' },
      { key: 'hideNavHome', label: 'Nav: Hide Home' },
      { key: 'hideNavExplore', label: 'Nav: Hide Explore' },
      { key: 'hideNavNotifications', label: 'Nav: Hide Notifications' },
      { key: 'hideNavFollow', label: 'Nav: Hide Follow' },
      { key: 'hideNavMessages', label: 'Nav: Hide Chat' },
      { key: 'hideNavGrok', label: 'Nav: Hide Grok' },
      { key: 'hideNavPremium', label: 'Nav: Hide Premium' },
      { key: 'hideNavBookmarks', label: 'Nav: Hide Bookmarks' },
      { key: 'hideNavCreatorStudio', label: 'Nav: Hide Creator Studio' },
      { key: 'hideNavArticles', label: 'Nav: Hide Articles' },
      { key: 'hideNavProfile', label: 'Nav: Hide Profile' },
      { key: 'hideNavMore', label: 'Nav: Hide More' },
      { key: 'centerNavSidebar', label: 'Nav: Center Vertically' },
      { key: 'hideTrendingSidebar', label: 'Hide Trending & Who to Follow' },
      { key: 'hideGrok', label: 'Hide Grok Button' },
      { key: 'hideChat', label: 'Hide Chat Button' },
      { key: 'floatPostButton', label: 'Float Post Button (bottom right)' },
      { key: 'shiftTimelineRight', label: 'Shift Timeline Right' }
    ]
  },
  {
    platform: 'discord',
    title: 'Discord',
    iconSrc: 'https://svgl.app/library/discord.svg',
    settings: [
      { key: 'hideGiftButton',    label: 'Hide Gift Button' },
      { key: 'hideGifButton',     label: 'Hide GIF Button' },
      { key: 'hideStickerButton', label: 'Hide Sticker Button' },
      { key: 'hideEmojiButton',   label: 'Hide Emoji Button' },
      { key: 'hideAppsButton',       label: 'Hide Apps Button' },
      { key: 'hideAddServerButton',    label: 'Hide Add a Server Button' },
      { key: 'hideDiscoverButton',     label: 'Hide Discover Button' },
      { key: 'hideDownloadAppsButton', label: 'Hide Download Apps Button' },
      { key: 'hideHelpButton',          label: 'Hide Help Button' },
      { key: 'hideEventsItem',          label: 'Hide Events' },
      { key: 'hideServerBoostsItem',    label: 'Hide Server Boosts' },
      { key: 'redirectToFirstServer',   label: 'Auto-open First Server' }
    ]
  },
];

const popupStyles = `
  :host {
    all: initial;
      position: fixed;
      top: 16px;
      right: 16px;
    z-index: 2147483647;
    font-family: system-ui, sans-serif;
      font-size: 13px;
      line-height: 1.4;
    font-weight: 400;
  }
  * {
    box-sizing: border-box;
    font-family: system-ui, sans-serif;
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
  .action-btn {
    background-color: rgba(255, 255, 255, 0.1);
    color: #ffffff;
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 6px;
    padding: 4px 10px;
    font-size: 12px;
    cursor: pointer;
    flex-shrink: 0;
    transition: background-color 0.15s;
  }
  .action-btn:hover {
    background-color: rgba(255, 255, 255, 0.18);
  }
  .action-btn:disabled {
    opacity: 0.5;
    cursor: default;
  }
`;

function createPopup() {
  popupHost = document.createElement('div');
  popupHost.id = 'webfix-popup-host';

  const shadow = popupHost.attachShadow({ mode: 'closed' });

  const styleEl = document.createElement('style');
  styleEl.textContent = popupStyles;
  shadow.appendChild(styleEl);

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
      if (sectionCfg.iconStyle) icon.style.cssText += sectionCfg.iconStyle;
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

        if (s.type === 'action') {
          const btn = document.createElement('button');
          btn.className = 'action-btn';
          btn.textContent = s.actionLabel || 'Run';
          btn.addEventListener('click', async () => {
            if (btn.disabled) return;
            btn.disabled = true;
            const originalLabel = btn.textContent;
            btn.textContent = 'Working...';
            try {
              await s.onAction();
              btn.textContent = 'Done';
            } catch {
              btn.textContent = 'Failed';
            }
            setTimeout(() => {
              btn.textContent = originalLabel;
              btn.disabled = false;
            }, 1500);
          });
          row.appendChild(btn);
        } else {
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
        }

        section.appendChild(row);
      });

      body.appendChild(section);
    });
  });

  card.appendChild(body);

  shadow.appendChild(card);

  let scrollTimeout = null;
  body.addEventListener('scroll', () => {
    body.classList.add('scrolling');
    if (scrollTimeout) clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      body.classList.remove('scrolling');
    }, 1000);
  }, { passive: true });

  body.addEventListener('wheel', (e) => {
    const atTop = body.scrollTop <= 0;
    const atBottom = body.scrollTop + body.clientHeight >= body.scrollHeight - 1;
    if ((atTop && e.deltaY < 0) || (atBottom && e.deltaY > 0)) {
      e.preventDefault();
    }
    e.stopPropagation();
  }, { passive: false });

  const escHandler = (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      closePopup();
    }
  };
  document.addEventListener('keydown', escHandler, true);
  popupHost._escHandler = escHandler;

  document.documentElement.appendChild(popupHost);
}

function closePopup() {
  if (popupHost) {
    if (popupHost._escHandler) {
      document.removeEventListener('keydown', popupHost._escHandler, true);
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
