const DISCORD_BUTTONS = [
  { key: 'hideGiftButton',    selector: '[aria-label="Send a gift"]' },
  { key: 'hideGifButton',     selector: '[aria-label="Open GIF picker"]' },
  { key: 'hideStickerButton', selector: '[aria-label="Open sticker picker"]' },
  { key: 'hideEmojiButton',   selector: '[aria-label="Add Emoji"]' },
  { key: 'hideAppsButton',    selector: '[aria-label="Apps"]' },
];

const DISCORD_NAV_ITEMS = [
  { key: 'hideAddServerButton',    selector: '[aria-label="Add a Server"]' },
  { key: 'hideDiscoverButton',     selector: '[aria-label="Discover"]' },
  { key: 'hideDownloadAppsButton', selector: '[aria-label="Download Apps"]' },
  { key: 'hideHelpButton',         selector: '[aria-label="Help"]' },
];

const DISCORD_CHANNEL_LIST_ITEMS = [
  { key: 'hideEventsItem',       idPrefix: 'channels___upcoming-events' },
  { key: 'hideServerBoostsItem', idPrefix: 'channels___skill-trees' },
];

function isSpacerOrDivider(el) {
  if (!el || el.nodeType !== 1) return false;
  if (el.className && el.className.includes('sectionDivider')) return true;
  const h = el.getAttribute('style') || '';
  return h.includes('height: 12px') || h.includes('height:12px');
}

async function hideDiscordEventsDividers() {
  const hideEvents = await getSetting('discord', 'hideEventsItem');
  const hideBoosts = await getSetting('discord', 'hideServerBoostsItem');
  if (!hideEvents || !hideBoosts) return;

  const eventsEl = document.querySelector('[data-list-item-id^="channels___upcoming-events"]');
  const boostsEl = document.querySelector('[data-list-item-id^="channels___skill-trees"]');
  const eventsLi = eventsEl && eventsEl.closest('li');
  const boostsLi = boostsEl && boostsEl.closest('li');

  if (eventsLi) {
    let sib = eventsLi.previousElementSibling;
    while (sib && isSpacerOrDivider(sib)) {
      sib.style.display = 'none';
      sib = sib.previousElementSibling;
    }
  }

  const lastLi = boostsLi || eventsLi;
  if (lastLi) {
    let sib = lastLi.nextElementSibling;
    while (sib && isSpacerOrDivider(sib)) {
      sib.style.display = 'none';
      sib = sib.nextElementSibling;
    }
  }
}

let _discordRedirected = false;

async function redirectDiscordToFirstServer() {
  if (_discordRedirected) return;
  const enabled = await getSetting('discord', 'redirectToFirstServer');
  if (!enabled) return;
  if (!window.location.pathname.startsWith('/channels/@me')) return;

  const items = document.querySelectorAll('[data-list-item-id^="guildsnav___"]');
  for (const item of items) {
    const id = item.getAttribute('data-list-item-id').replace('guildsnav___', '');
    if (/^\d+$/.test(id)) {
      _discordRedirected = true;
      item.click();
      return;
    }
  }
}

async function runDiscord() {
  await Promise.all([
    redirectDiscordToFirstServer(),
    ...DISCORD_BUTTONS.map(async ({ key, selector }) => {
      const enabled = await getSetting('discord', key);
      if (!enabled) return;
      document.querySelectorAll(selector).forEach(el => {
        el.style.display = 'none';
      });
    }),
    ...DISCORD_NAV_ITEMS.map(async ({ key, selector }) => {
      const enabled = await getSetting('discord', key);
      if (!enabled) return;
      document.querySelectorAll(selector).forEach(el => {
        const container = el.closest('[class*="tutorialContainer"], [class*="listItem"]');
        if (container) container.style.display = 'none';
        else (el.closest('a') || el).style.display = 'none';
      });
    }),
    ...DISCORD_CHANNEL_LIST_ITEMS.map(async ({ key, idPrefix }) => {
      const enabled = await getSetting('discord', key);
      if (!enabled) return;
      document.querySelectorAll(`[data-list-item-id^="${idPrefix}"]`).forEach(el => {
        const li = el.closest('li');
        if (li) li.style.display = 'none';
        else el.style.display = 'none';
      });
    }),
    hideDiscordEventsDividers(),
  ]);
}
