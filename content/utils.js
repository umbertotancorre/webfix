function getCurrentSite() {
  const hostname = window.location.hostname;
  if (hostname.includes('linkedin.com')) {
    return 'linkedin';
  } else if (hostname.includes('youtube.com') || hostname.includes('youtu.be')) {
    return 'youtube';
  } else if (hostname.includes('mail.google.com')) {
    return 'gmail';
  } else if (hostname.includes('calendar.google.com')) {
    return 'googleCalendar';
  } else if (hostname.includes('x.com') || hostname.includes('twitter.com')) {
    return 'x';
  }
  return null;
}

function isUserTyping() {
  const activeElement = document.activeElement;
  return (
    activeElement &&
    (activeElement.tagName === 'INPUT' ||
      activeElement.tagName === 'TEXTAREA' ||
      activeElement.isContentEditable ||
      activeElement.getAttribute('contenteditable') === 'true' ||
      activeElement.closest('[contenteditable="true"]') ||
      activeElement.closest('[data-testid*="search"]') ||
      activeElement.closest('[role="searchbox"]') ||
      activeElement.closest('form[role="search"]') ||
      activeElement.getAttribute('type') === 'search' ||
      activeElement.getAttribute('placeholder')?.toLowerCase().includes('search'))
  );
}
