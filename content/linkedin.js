function findLinkedInSearchInput() {
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

let linkedinSearchListenerAdded = false;
function handleLinkedInSearchFocus() {
  if (linkedinSearchListenerAdded) return;
  linkedinSearchListenerAdded = true;

  document.addEventListener('keydown', async (e) => {
    const enabled = await getSetting('linkedin', 'searchFocus');
    if (!enabled) return;

    if (e.key === 's' || e.key === 'S') {
      if (isUserTyping()) {
        return;
      }

      if (e.ctrlKey || e.metaKey || e.altKey || e.shiftKey) {
        return;
      }

      const searchInput = findLinkedInSearchInput();

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
      const searchInput = findLinkedInSearchInput();

      if (searchInput && activeElement === searchInput) {
        e.preventDefault();
        e.stopPropagation();
        searchInput.blur();
      }
    }
  }, true);
}
