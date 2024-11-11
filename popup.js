let domainGroups = [];
let currentUrl = null;

// Initialize the extension
document.addEventListener("DOMContentLoaded", async () => {
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
  const result = await chrome.storage.sync.get("domainGroups");
  domainGroups = result.domainGroups || [];
}

// Check if current domain matches any configured domains
function checkDomainMatch() {
  if (!currentUrl) return;

  const container = document.getElementById("domainGroups");
  const noMatch = document.getElementById("noMatch");

  const hasMatch = domainGroups.some((group) =>
    Object.values(group.environments).some(
      (domain) => domain.toLowerCase() === currentUrl.host.toLowerCase()
    )
  );

  if (!hasMatch && noMatch) {
    noMatch.style.display = "block";
    container.style.display = "none";
  } else if (hasMatch && noMatch) {
    noMatch.style.display = "none";
    container.style.display = "block";
  }
}

// Render domain groups in the popup
function renderDomainGroups() {
  const container = document.getElementById("domainGroups");
  container.innerHTML = "";

  // Add no-match message container
  const noMatch = document.createElement("div");
  noMatch.id = "noMatch";
  noMatch.className = "no-match";
  noMatch.style.display = "none";
  noMatch.innerHTML = `
    <p>Current domain is not configured</p>
    <button id="quickAdd" class="btn-primary">Quick Add Domain</button>
  `;
  container.parentElement.insertBefore(noMatch, container);

  domainGroups.forEach((group) => {
    const groupElement = createDomainGroupElement(group);
    container.appendChild(groupElement);
  });
}

// Create DOM element for a domain group
function createDomainGroupElement(group) {
  const groupDiv = document.createElement("div");
  groupDiv.className = "domain-group";

  const header = document.createElement("div");
  header.className = "domain-group-header";

  const title = document.createElement("div");
  title.className = "domain-group-title";
  title.textContent = group.name;

  const buttonsDiv = document.createElement("div");
  buttonsDiv.className = "environment-buttons";

  const environments = [
    { key: "local", label: "Local", shortcut: "⌘1" },
    { key: "dev", label: "Dev", shortcut: "⌘2" },
    { key: "prod", label: "Prod", shortcut: "⌘3" },
  ];

  environments.forEach((env) => {
    const button = document.createElement("button");
    button.className = "env-button";
    if (currentUrl && group.environments[env.key] === currentUrl.host) {
      button.classList.add("active");
    }
    button.innerHTML = `${env.label}<span class="shortcut">${env.shortcut}</span>`;
    button.onclick = (e) => {
      if (e.metaKey || e.ctrlKey) {
        switchDomain(group, env.key, true);
      } else {
        switchDomain(group, env.key, false);
      }
    };
    buttonsDiv.appendChild(button);
  });

  header.appendChild(title);
  groupDiv.appendChild(header);
  groupDiv.appendChild(buttonsDiv);

  return groupDiv;
}

// Switch the current tab's domain
async function switchDomain(group, targetEnv, newTab = false) {
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

  // Update the tab URL or create new tab
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  if (newTab) {
    chrome.tabs.create({ url: newUrl.toString() });
  } else {
    chrome.tabs.update(tabs[0].id, { url: newUrl.toString() });
  }
}

// Setup event listeners
function setupEventListeners() {
  document
    .getElementById("addDomainGroup")
    .addEventListener("click", showAddDomainGroupDialog);
  document
    .getElementById("openSettings")
    .addEventListener("click", openSettings);

  // Quick add functionality
  document.addEventListener("click", (e) => {
    if (e.target.id === "quickAdd") {
      showQuickAddDialog();
    }
  });

  // Keyboard shortcuts
  document.addEventListener("keydown", (e) => {
    if (e.metaKey || e.ctrlKey) {
      const num = parseInt(e.key);
      if (num >= 1 && num <= 3) {
        e.preventDefault();
        const envMap = { 1: "local", 2: "dev", 3: "prod" };
        const activeGroup = findActiveGroup();
        if (activeGroup) {
          switchDomain(activeGroup, envMap[num], e.shiftKey);
        }
      }
    }
  });
}

// Find active domain group
function findActiveGroup() {
  if (!currentUrl) return null;

  return domainGroups.find((group) =>
    Object.values(group.environments).some(
      (domain) => domain.toLowerCase() === currentUrl.host.toLowerCase()
    )
  );
}

// Show quick add dialog
function showQuickAddDialog() {
  if (!currentUrl) return;

  const container = document.getElementById("domainGroups");
  container.innerHTML = `
    <div class="quick-add-form">
      <h2>Quick Add Domain</h2>
      <form id="quickAddForm">
        <div class="form-group">
          <label>Group Name</label>
          <input type="text" id="groupName" required placeholder="Enter group name">
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

  const form = document.getElementById("quickAddForm");
  const cancelBtn = document.getElementById("cancelQuickAdd");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const groupName = document.getElementById("groupName").value;
    const currentEnv = document.getElementById("currentEnv").value;

    const newGroup = {
      id: Date.now().toString(),
      name: groupName,
      environments: {
        local: "",
        dev: "",
        prod: "",
      },
    };

    newGroup.environments[currentEnv] = currentUrl.host;

    domainGroups.push(newGroup);
    await chrome.storage.sync.set({ domainGroups });

    loadDomainGroups();
    renderDomainGroups();
  });

  cancelBtn.addEventListener("click", () => {
    renderDomainGroups();
  });
}

// Show dialog to add new domain group
function showAddDomainGroupDialog() {
  chrome.tabs.create({ url: "settings.html" });
}

// Open settings page
function openSettings() {
  chrome.tabs.create({ url: "settings.html" });
}
