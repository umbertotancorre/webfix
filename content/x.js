async function hideXTrendingSidebar() {
  const enabled = await getSetting('x', 'hideTrendingSidebar');
  if (!enabled) return;
  const targets = [
    document.querySelector('[aria-label="Trending"]'),
    document.querySelector('aside[aria-label="Who to follow"]')
  ];
  targets.forEach(el => { if (el) el.style.display = 'none'; });
}

async function hideXGrok() {
  const enabled = await getSetting('x', 'hideGrok');
  if (!enabled) return;
  const el = document.querySelector('[data-testid="GrokDrawer"]');
  if (el) el.style.display = 'none';
}

async function hideXChat() {
  const enabled = await getSetting('x', 'hideChat');
  if (!enabled) return;
  const el = document.querySelector('[data-testid="chat-drawer-root"]');
  if (el) el.style.display = 'none';
}

const NAV_ITEMS = [
  { key: 'hideNavLogo',          selector: 'h1:has(a[aria-label="X"][href="/home"])' },
  { key: 'hideNavHome',          selector: '[data-testid="AppTabBar_Home_Link"]' },
  { key: 'hideNavExplore',       selector: '[data-testid="AppTabBar_Explore_Link"]' },
  { key: 'hideNavNotifications', selector: '[data-testid="AppTabBar_Notifications_Link"]' },
  { key: 'hideNavFollow',        selector: '[data-testid="AppTabBar_Follow_Link"]' },
  { key: 'hideNavMessages',      selector: '[data-testid="AppTabBar_DirectMessage_Link"]' },
  { key: 'hideNavGrok',          selector: 'a[aria-label="Grok"][href="/i/grok"]' },
  { key: 'hideNavPremium',       selector: 'a[aria-label="Premium"]' },
  { key: 'hideNavBookmarks',     selector: 'a[aria-label="Bookmarks"]' },
  { key: 'hideNavArticles',      selector: 'a[aria-label="Articles"]' },
  { key: 'hideNavCreatorStudio', selector: 'a[href*="/i/verified-orgs-signup"], a[data-testid="AppTabBar_CreatorStudio_Link"], a[aria-label="Creator Studio"]' },
  { key: 'hideNavProfile',       selector: '[data-testid="AppTabBar_Profile_Link"]' },
  { key: 'hideNavMore',          selector: '[data-testid="AppTabBar_More_Menu"]' },
];

async function hideXNavItems() {
  await Promise.all(NAV_ITEMS.map(async ({ key, selector }) => {
    const enabled = await getSetting('x', key);
    if (!enabled) return;
    const el = document.querySelector(selector);
    if (el) el.style.display = 'none';
  }));
}

async function centerXNavSidebar() {
  const enabled = await getSetting('x', 'centerNavSidebar');
  if (!enabled) return;
  const nav = document.querySelector('nav[aria-label="Primary"]');
  if (!nav) return;
  const container = nav.parentElement?.parentElement?.parentElement;
  if (!container) return;
  Object.assign(container.style, {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    minHeight: '100vh',
  });
}

async function floatXPostButton() {
  const enabled = await getSetting('x', 'floatPostButton');
  if (!enabled) return;
  const style = document.createElement('style');
  style.textContent = `
    [data-testid="SideNav_NewTweet_Button"] { position: fixed !important; right: 16px !important; bottom: 24px !important; }
    header[role="banner"] > div > div > div { overflow: visible !important; }
  `;
  document.head.appendChild(style);
}

async function shiftXTimelineRight() {
  const enabled = await getSetting('x', 'shiftTimelineRight');
  if (!enabled) return;
  const style = document.createElement('style');
  style.textContent = `[data-testid="primaryColumn"] { margin-left: 60px !important; }`;
  document.head.appendChild(style);
}

async function runX() {
  await Promise.all([
    hideXTrendingSidebar(),
    hideXGrok(),
    hideXChat(),
    hideXNavItems(),
    centerXNavSidebar(),
    floatXPostButton(),
    shiftXTimelineRight()
  ]);
}
