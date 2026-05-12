async function hideXCommunities() {
  const enabled = await getSetting('x', 'hideCommunities');
  if (!enabled) return;
  const link = document.querySelector('a[href*="/communities"][aria-label="Communities"]');
  if (link) link.style.display = 'none';
}

async function hideXCreatorStudio() {
  const enabled = await getSetting('x', 'hideCreatorStudio');
  if (!enabled) return;
  const link = document.querySelector('a[href*="/i/verified-orgs-signup"], a[data-testid="AppTabBar_CreatorStudio_Link"], a[aria-label="Creator Studio"]');
  if (link) link.style.display = 'none';
}

async function runX() {
  await Promise.all([
    hideXCommunities(),
    hideXCreatorStudio()
  ]);
}
