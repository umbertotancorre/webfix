const BOOKMARKS_EXPORT_PREFIX = 'webfix-bookmarks';

function fetchBookmarksFromBackground() {
  return new Promise((resolve, reject) => {
    try {
      chrome.runtime.sendMessage({ action: 'exportBookmarks' }, (response) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }
        if (!response || !Array.isArray(response.bookmarks)) {
          reject(new Error('No bookmark data received'));
          return;
        }
        resolve(response);
      });
    } catch (error) {
      reject(error);
    }
  });
}

function countBookmarkUrls(nodes) {
  let count = 0;
  nodes.forEach(node => {
    if (node.url) count += 1;
    if (Array.isArray(node.children)) count += countBookmarkUrls(node.children);
  });
  return count;
}

async function downloadBookmarksJson() {
  const response = await fetchBookmarksFromBackground();

  const payload = {
    generator: 'Webfix',
    exportedAt: new Date().toISOString(),
    totalBookmarks: countBookmarkUrls(response.bookmarks),
    bookmarks: response.bookmarks
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  const dateStamp = new Date().toISOString().slice(0, 10);
  link.download = `${BOOKMARKS_EXPORT_PREFIX}-${dateStamp}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();

  setTimeout(() => URL.revokeObjectURL(url), 10000);
}
