// Track active tab URL changes
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  await updateIconState(activeInfo.tabId);
});

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.url) {
    await updateIconState(tabId);
  }
});

// Update icon based on domain match
async function updateIconState(tabId) {
  const tab = await chrome.tabs.get(tabId);
  const isMatchingDomain = await checkIfDomainMatches(tab.url);
  
  await updateIcon(isMatchingDomain);
}

// Check if current domain matches any configured domains
async function checkIfDomainMatches(url) {
  if (!url || url.startsWith('chrome://')) return false;

  try {
    const currentHost = new URL(url).host;
    const { domainGroups } = await chrome.storage.sync.get('domainGroups');
    
    if (!domainGroups) return false;

    return domainGroups.some(group => 
      Object.values(group.environments).some(domain => 
        domain.toLowerCase() === currentHost.toLowerCase()
      )
    );
  } catch (e) {
    console.error('Error checking domain match:', e);
    return false;
  }
}

// Update extension icon
async function updateIcon(isActive) {
  const iconPath = isActive ? {
    16: 'icons/active16.png',
    48: 'icons/active48.png',
    128: 'icons/active128.png'
  } : {
    16: 'icons/inactive16.png',
    48: 'icons/inactive48.png',
    128: 'icons/inactive128.png'
  };

  await chrome.action.setIcon({ path: iconPath });
}