async function hideGmailUpgradeButton() {
  const enabled = await getSetting('gmail', 'hideUpgradeButton');
  if (!enabled) return;
  const upgradeWrapperSpans = document.querySelectorAll('span.I6agWe');
  upgradeWrapperSpans.forEach(wrapper => {
    const textContent = wrapper.textContent.trim();
    if (textContent.includes('Upgrade')) {
      wrapper.style.display = 'none';
      return;
    }
  });

  const upgradeButtons = Array.from(document.querySelectorAll('button, [role="link"]'));
  upgradeButtons.forEach(button => {
    const textContent = button.textContent.trim();
    if (textContent === 'Upgrade') {
      const outerWrapper = button.closest('span.I6agWe');
      if (outerWrapper) {
        outerWrapper.style.display = 'none';
        return;
      }
      const wrapper = button.closest('div.bzc-Uw-LV-Zr');
      if (wrapper) {
        wrapper.style.display = 'none';
      } else {
        button.style.display = 'none';
      }
    }
  });

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
