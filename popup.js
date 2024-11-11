let domainGroups = [];
let currentUrl = null;

// Initialize the extension
document.addEventListener('DOMContentLoaded', async () => {
  await loadDomainGroups();
  await getCurrentTab();
  renderDomainGroups();
  setupEventListeners();
  checkDomainMatch();
});

// Get current tab information
async function getCurrentTab() {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tabs[0]?.url) {
    currentUrl = new URL(tabs[0].url);
  }
}

// Load domain groups from storage
async function loadDomainGroups() {
  const result = await chrome.storage.sync.get('domainGroups');
  domainGroups = result.domainGroups || [
    {
      id: 'example',
      name: 'Example Group',
      environments: {
        local: 'localhost:3000',
        dev: 'dev.example.com',
        prod: 'example.com'
      }
    }
  ];
}

// Check if current domain matches any configured domains
function checkDomainMatch() {
  if (!currentUrl) return;

  const container = document.getElementById('domainGroups');
  const noMatch = document.getElementById('noMatch');
  
  const hasMatch = domainGroups.some(group => 
    Object.values(group.environments).some(domain => 
      domain.toLowerCase() === currentUrl.host.toLowerCase()
    )
  );

  if (!hasMatch && noMatch) {
    noMatch.style.display = 'block';
    container.style.display = 'none';
  } else if (hasMatch && noMatch) {
    noMatch.style.display = 'none';
    container.style.display = 'block';
  }
}

// Render domain groups in the popup
function renderDomainGroups() {
  const container = document.getElementById('domainGroups');
  container.innerHTML = '';

  // Add no-match message container
  const noMatch = document.createElement('div');
  noMatch.id = 'noMatch';
  noMatch.className = 'no-match';
  noMatch.style.display = 'none';
  noMatch.innerHTML = `
    <p>Current domain is not configured.</p>
    <button id="quickAdd" class="btn-primary">Quick Add Domain</button>
  `;
  container.parentElement.insertBefore(noMatch, container);

  domainGroups.forEach(group => {
    const groupElement = createDomainGroupElement(group);
    container.appendChild(groupElement);
  });
}

// Create DOM element for a domain group
function createDomainGroupElement(group) {
  const groupDiv = document.createElement('div');
  groupDiv.className = 'domain-group';
  
  const header = document.createElement('div');
  header.className = 'domain-group-header';
  
  const title = document.createElement('div');
  title.className = 'domain-group-title';
  title.textContent = group.name;
  
  const buttonsDiv = document.createElement('div');
  buttonsDiv.className = 'environment-buttons';
  
  ['local', 'dev', 'prod'].forEach(env => {
    const button = document.createElement('button');
    button.className = 'env-button';
    if (currentUrl && group.environments[env] === currentUrl.host) {
      button.classList.add('active');
    }
    button.textContent = env;
    button.onclick = () => switchDomain(group, env);
    buttonsDiv.appendChild(button);
  });
  
  header.appendChild(title);
  groupDiv.appendChild(header);
  groupDiv.appendChild(buttonsDiv);
  
  return groupDiv;
}

// Switch the current tab's domain
async function switchDomain(group, targetEnv) {
  if (!currentUrl) return;
  
  // Find the current environment
  let currentEnv = null;
  for (const [env, domain] of Object.entries(group.environments)) {
    if (currentUrl.host === domain) {
      currentEnv = env;
      break;
    }
  }
  
  if (currentEnv === null) return;
  
  // Create new URL with target domain
  const newUrl = new URL(currentUrl.toString());
  newUrl.host = group.environments[targetEnv];
  
  // Update the tab URL
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  chrome.tabs.update(tabs[0].id, { url: newUrl.toString() });
}

// Setup event listeners
function setupEventListeners() {
  document.getElementById('addDomainGroup').addEventListener('click', showAddDomainGroupDialog);
  document.getElementById('openSettings').addEventListener('click', openSettings);
  
  // Quick add functionality
  document.addEventListener('click', e => {
    if (e.target.id === 'quickAdd') {
      showQuickAddDialog();
    }
  });
}

// Show quick add dialog
function showQuickAddDialog() {
  if (!currentUrl) return;

  const container = document.getElementById('domainGroups');
  container.innerHTML = `
    <div class="quick-add-form">
      <h2>Quick Add Domain</h2>
      <form id="quickAddForm">
        <div class="form-group">
          <label>Group Name</label>
          <input type="text" id="groupName" required>
        </div>
        <div class="form-group">
          <label>Current Environment</label>
          <select id="currentEnv" required>
            <option value="local">Local</option>
            <option value="dev">Development</option>
            <option value="prod">Production</option>
          </select>
        </div>
        <div class="form-actions">
          <button type="button" class="btn-secondary" id="cancelQuickAdd">Cancel</button>
          <button type="submit" class="btn-primary">Add Domain</button>
        </div>
      </form>
    </div>
  `;

  const form = document.getElementById('quickAddForm');
  const cancelBtn = document.getElementById('cancelQuickAdd');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const groupName = document.getElementById('groupName').value;
    const currentEnv = document.getElementById('currentEnv').value;

    const newGroup = {
      id: Date.now().toString(),
      name: groupName,
      environments: {
        local: '',
        dev: '',
        prod: ''
      }
    };

    newGroup.environments[currentEnv] = currentUrl.host;

    domainGroups.push(newGroup);
    await chrome.storage.sync.set({ domainGroups });
    
    loadDomainGroups();
    renderDomainGroups();
  });

  cancelBtn.addEventListener('click', () => {
    renderDomainGroups();
  });
}

// Show dialog to add new domain group
function showAddDomainGroupDialog() {
  chrome.tabs.create({ url: 'settings.html' });
}

// Open settings page
function openSettings() {
  chrome.tabs.create({ url: 'settings.html' });
}