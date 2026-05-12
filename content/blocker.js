(function () {
  const hostname = window.location.hostname;
  const isInstagram = hostname.includes('instagram.com') || hostname.includes('instagr.am');
  const isYouTube = hostname.includes('youtube.com') || hostname.includes('youtu.be');
  const isLinkedIn = hostname.includes('linkedin.com');
  const isX = hostname.includes('x.com') || hostname.includes('twitter.com');

  if (isInstagram || isYouTube || isLinkedIn || isX) {
    chrome.storage.sync.get(['webfixSettings'], (result) => {
      const settings = result.webfixSettings || {};
      const blockInstagram = settings.browser?.blockInstagram;
      const blockYouTube = settings.browser?.blockYouTube;
      const blockLinkedIn = settings.browser?.blockLinkedIn;
      const blockX = settings.browser?.blockX;

      if ((isInstagram && blockInstagram) || (isYouTube && blockYouTube) || (isLinkedIn && blockLinkedIn) || (isX && blockX)) {
        window.location.replace('about:blank');
      }
    });
  }
})();
