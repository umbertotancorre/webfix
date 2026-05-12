let originalTitleWithoutNumber = null;

async function updateTabTitleWithNumber() {
  const enabled = await getSetting('browser', 'tabNumbering');
  if (!enabled) {
    const currentTitle = document.title;
    const numberPrefixMatch = currentTitle.match(/^\d+\.\s(.+)$/);
    if (numberPrefixMatch) {
      document.title = numberPrefixMatch[1];
      originalTitleWithoutNumber = numberPrefixMatch[1];
    }
    return;
  }

  chrome.runtime.sendMessage({ action: 'getTabIndex' }, (response) => {
    if (response && response.tabIndex !== null && response.tabIndex !== undefined) {
      const currentTitle = document.title;
      const numberPrefixMatch = currentTitle.match(/^\d+\.\s(.+)$/);

      let titleToUse;
      if (numberPrefixMatch) {
        titleToUse = numberPrefixMatch[1];
        originalTitleWithoutNumber = titleToUse;
      } else {
        titleToUse = currentTitle;
        if (originalTitleWithoutNumber === null) {
          originalTitleWithoutNumber = currentTitle;
        } else {
          originalTitleWithoutNumber = currentTitle;
          titleToUse = currentTitle;
        }
      }

      const newTitle = `${response.tabIndex}. ${titleToUse}`;
      if (document.title !== newTitle) {
        document.title = newTitle;
      }
    }
  });
}

function watchTitleChanges() {
  const titleObserver = new MutationObserver(async () => {
    const enabled = await getSetting('browser', 'tabNumbering');
    if (!enabled) return;

    const currentTitle = document.title;
    const numberPrefixMatch = currentTitle.match(/^\d+\.\s(.+)$/);

    if (numberPrefixMatch) {
      originalTitleWithoutNumber = numberPrefixMatch[1];
    } else if (originalTitleWithoutNumber && currentTitle !== originalTitleWithoutNumber) {
      originalTitleWithoutNumber = currentTitle;
      setTimeout(updateTabTitleWithNumber, 50);
    } else if (!originalTitleWithoutNumber) {
      originalTitleWithoutNumber = currentTitle;
      setTimeout(updateTabTitleWithNumber, 50);
    }
  });

  const titleElement = document.querySelector('title');
  if (titleElement) {
    titleObserver.observe(titleElement, {
      childList: true,
      characterData: true,
      subtree: true
    });
  }

  let lastCheckedTitle = document.title;
  setInterval(async () => {
    const enabled = await getSetting('browser', 'tabNumbering');
    if (!enabled) return;

    const currentTitle = document.title;
    const numberPrefixMatch = currentTitle.match(/^\d+\.\s(.+)$/);

    if (currentTitle !== lastCheckedTitle) {
      lastCheckedTitle = currentTitle;

      if (numberPrefixMatch) {
        originalTitleWithoutNumber = numberPrefixMatch[1];
      } else if (originalTitleWithoutNumber) {
        originalTitleWithoutNumber = currentTitle;
        updateTabTitleWithNumber();
      } else {
        originalTitleWithoutNumber = currentTitle;
        updateTabTitleWithNumber();
      }
    }
  }, 500);
}
