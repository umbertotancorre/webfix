async function hideGoogleCalendarTermsPrivacy() {
  const enabled = await getSetting('googleCalendar', 'hideTermsPrivacy');
  if (!enabled) return;

  const footerDivs = document.querySelectorAll('div.erDb5d');
  footerDivs.forEach(div => {
    const termsLink = div.querySelector('a[href*="policies/terms"]');
    const privacyLink = div.querySelector('a[href*="policies/privacy"]');
    if (termsLink || privacyLink) {
      div.style.display = 'none';
    }
  });

  const termsPrivacyLinks = document.querySelectorAll('a.PTIB6e[href*="policies"]');
  termsPrivacyLinks.forEach(link => {
    const parent = link.parentElement;
    if (parent && parent.classList.contains('erDb5d')) {
      parent.style.display = 'none';
    }
  });
}

async function hideGoogleCalendarBookingPages() {
  const enabled = await getSetting('googleCalendar', 'hideBookingPages');
  if (!enabled) return;

  const bookingDivs = document.querySelectorAll('div.EKq2Ub');
  bookingDivs.forEach(div => {
    const bookingText = div.querySelector('.az313e');
    if (bookingText && bookingText.textContent.includes('Booking pages')) {
      div.style.display = 'none';
    }
  });

  const createButtons = document.querySelectorAll('button[aria-label="Create appointment schedule"]');
  createButtons.forEach(button => {
    const container = button.closest('div.EKq2Ub');
    if (container) {
      container.style.display = 'none';
    }
  });
}

async function hideGoogleCalendarSupportButton() {
  const enabled = await getSetting('googleCalendar', 'hideSupportButton');
  if (!enabled) return;

  const supportDivs = document.querySelectorAll('div.h8Aqhb');
  supportDivs.forEach(div => {
    const supportButton = div.querySelector('button[aria-label="Support"]');
    if (supportButton) {
      div.style.display = 'none';
    }
  });

  const supportButtons = document.querySelectorAll('button[aria-label="Support"]');
  supportButtons.forEach(button => {
    const container = button.closest('div.h8Aqhb');
    if (container) {
      container.style.display = 'none';
    }
  });
}

async function hideGoogleCalendarSidePanelToggle() {
  const enabled = await getSetting('googleCalendar', 'hideSidePanelToggle');
  if (!enabled) return;

  const toggleDivs = document.querySelectorAll('div.Kk7lMc-QWPxkf-LgbsSe-haAclf');
  toggleDivs.forEach(div => {
    const toggleButton = div.querySelector('[aria-label="Show side panel"], [aria-label="Hide side panel"]');
    if (toggleButton) {
      div.style.display = 'none';
    }
  });

  const toggleButtons = document.querySelectorAll('[aria-label="Show side panel"], [aria-label="Hide side panel"]');
  toggleButtons.forEach(button => {
    const container = button.closest('div.Kk7lMc-QWPxkf-LgbsSe-haAclf');
    if (container) {
      container.style.display = 'none';
    }
  });
}

async function hideGoogleCalendarCreateButton() {
  const enabled = await getSetting('googleCalendar', 'hideCreateButton');
  if (!enabled) return;

  const createButton = document.querySelector('button[jsname="todz4c"]');
  if (createButton) {
    const wrapper = createButton.closest('div[jsname="WjL7X"]');
    if (wrapper) {
      wrapper.style.display = 'none';
    } else {
      createButton.style.display = 'none';
    }
  }

  const allButtons = document.querySelectorAll('button');
  allButtons.forEach(button => {
    if (button.textContent.includes('Create') && (button.classList.contains('APIQad') || button.getAttribute('jsname') === 'todz4c')) {
      const wrapper = button.closest('div[jsname="WjL7X"]') || button.closest('.dwlvNd');
      if (wrapper) {
        wrapper.style.display = 'none';
      } else {
        button.style.display = 'none';
      }
    }
  });

  const wrapperByJsname = document.querySelector('div[jsname="WjL7X"]');
  if (wrapperByJsname) {
    wrapperByJsname.style.display = 'none';
  }
}

async function hideGoogleCalendarSwitchButtons() {
  const enabled = await getSetting('googleCalendar', 'hideSwitchButtons');
  if (!enabled) return;

  const switcherDivs = document.querySelectorAll('div.wc0xVe');
  switcherDivs.forEach(div => {
    const hasCalendarSwitch = div.querySelector('button[aria-label="Switch to Calendar"]');
    const hasTasksSwitch = div.querySelector('button[aria-label="Switch to Tasks"]');
    if (hasCalendarSwitch || hasTasksSwitch) {
      div.style.display = 'none';
    }
  });

  const buttons = document.querySelectorAll('button[aria-label="Switch to Calendar"], button[aria-label="Switch to Tasks"]');
  buttons.forEach(button => {
    const container = button.closest('div.wc0xVe');
    if (container) {
      container.style.display = 'none';
    } else {
      button.style.display = 'none';
    }
  });
}

async function hideGoogleCalendarSearchPeople() {
  const enabled = await getSetting('googleCalendar', 'hideSearchPeople');
  if (!enabled) return;

  const outerContainers = document.querySelectorAll('div.qXIcZc');
  outerContainers.forEach(div => {
    div.style.display = 'none';
  });

  const searchPeopleDivs = document.querySelectorAll('div.TBA7qc');
  searchPeopleDivs.forEach(div => {
    div.style.display = 'none';
  });
}

async function hideGoogleCalendarMiniMonth() {
  const enabled = await getSetting('googleCalendar', 'hideMiniMonth');
  if (!enabled) return;

  const miniMonthDivs = document.querySelectorAll('div.LXjtcc');
  miniMonthDivs.forEach(div => {
    const buttons = div.querySelectorAll('button');
    if (buttons.length > 0) {
      buttons.forEach(btn => btn.style.display = 'none');
    }
    div.style.display = 'none';
  });
}

async function hideGoogleCalendarBirthdays() {
  const enabled = await getSetting('googleCalendar', 'hideBirthdays');
  if (!enabled) return;

  const selectors = [
    'li.DYTqTd[role="listitem"]',
    'div.XXcuqd[role="presentation"]',
    'div[data-text="Birthdays"]',
    'input[aria-label="Birthdays"]',
    'button[aria-label*="Birthdays"]',
    'span.dNKuRb'
  ];

  selectors.forEach(selector => {
    const elements = document.querySelectorAll(selector);
    elements.forEach(el => {
      const text = el.textContent.trim();
      const ariaLabel = el.getAttribute('aria-label') || '';
      const dataText = el.getAttribute('data-text') || '';

      if (text === 'Birthdays' || ariaLabel.includes('Birthdays') || dataText === 'Birthdays') {
        const row = el.closest('div.XXcuqd') || el.closest('li.DYTqTd') || el.closest('div[role="listitem"]') || el;
        if (row) {
          row.style.display = 'none';
        }
      }
    });
  });
}

async function hideGoogleCalendarTasks() {
  const enabled = await getSetting('googleCalendar', 'hideTasks');
  if (!enabled) return;

  const selectors = [
    'li.DYTqTd[role="listitem"]',
    'div.XXcuqd[role="presentation"]',
    'div[data-text="Tasks"]',
    'input[aria-label="Tasks"]',
    'button[aria-label*="Tasks"]',
    'span.dNKuRb'
  ];

  selectors.forEach(selector => {
    const elements = document.querySelectorAll(selector);
    elements.forEach(el => {
      const text = el.textContent.trim();
      const ariaLabel = el.getAttribute('aria-label') || '';
      const dataText = el.getAttribute('data-text') || '';

      if (text === 'Tasks' || ariaLabel.includes('Tasks') || dataText === 'Tasks') {
        const row = el.closest('div.XXcuqd') || el.closest('li.DYTqTd') || el.closest('div[role="listitem"]') || el;
        if (row) {
          row.style.display = 'none';
        }
      }
    });
  });
}

async function hideGoogleCalendarNavigationButtons() {
  const enabled = await getSetting('googleCalendar', 'hideNavigationButtons');
  if (!enabled) return;

  const selectors = [
    'button[jsname="P6mm8"]',
    'button[aria-label*="Today"]'
  ];

  selectors.forEach(selector => {
    const elements = document.querySelectorAll(selector);
    elements.forEach(el => {
      const wrapper = el.closest('span[data-is-tooltip-wrapper="true"]');
      if (wrapper) {
        wrapper.style.display = 'none';
      } else {
        el.style.display = 'none';
      }
    });
  });
}

async function fixGoogleCalendarListHeights() {
  const lists = document.querySelectorAll('div[role="list"].DB71Ge');
  lists.forEach(list => {
    const items = Array.from(list.querySelectorAll('div.XXcuqd'));
    let visibleCount = 0;
    const itemHeight = 32;

    items.forEach(item => {
      const isItemHidden = item.style.display === 'none';

      if (!isItemHidden) {
        const newY = visibleCount * itemHeight;
        item.style.transform = `translateY(${newY}px)`;
        item.style.height = `${itemHeight}px`;
        visibleCount++;
      }
    });

    const totalHeight = visibleCount * itemHeight;
    list.style.height = `${totalHeight}px`;
  });
}

async function hideGoogleCalendarViewSwitcher() {
  const enabled = await getSetting('googleCalendar', 'hideViewSwitcher');
  if (!enabled) return;

  const viewSwitchers = document.querySelectorAll('div.XyKLOd');
  viewSwitchers.forEach(el => {
    el.style.display = 'none';
  });
}

async function hideGoogleCalendarUpgradeButton() {
  const enabled = await getSetting('googleCalendar', 'hideUpgradeButton');
  if (!enabled) return;

  const upgradeButtons = document.querySelectorAll('button[aria-label="Upgrade"]');
  upgradeButtons.forEach(button => {
    const container = button.closest('div.nn5oJc');
    if (container) {
      container.style.display = 'none';
    } else {
      button.style.display = 'none';
    }
  });
}

async function runGoogleCalendar() {
  await Promise.all([
    hideGoogleCalendarTermsPrivacy(),
    hideGoogleCalendarBookingPages(),
    hideGoogleCalendarSupportButton(),
    hideGoogleCalendarSidePanelToggle(),
    hideGoogleCalendarCreateButton(),
    hideGoogleCalendarSwitchButtons(),
    hideGoogleCalendarSearchPeople(),
    hideGoogleCalendarMiniMonth(),
    hideGoogleCalendarBirthdays(),
    hideGoogleCalendarTasks(),
    hideGoogleCalendarNavigationButtons(),
    hideGoogleCalendarViewSwitcher(),
    hideGoogleCalendarUpgradeButton()
  ]);

  await fixGoogleCalendarListHeights();
}
