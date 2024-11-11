let domainGroups = [];
let saveTimeout = null;

// Initialize settings page
document.addEventListener("DOMContentLoaded", async () => {
  await loadDomainGroups();
  renderDomainGroups();
  setupEventListeners();
  createSaveIndicator();
});

// Load domain groups from storage
async function loadDomainGroups() {
  const result = await chrome.storage.sync.get("domainGroups");
  domainGroups = result.domainGroups || [];
}

// Save domain groups to storage with debounce
async function saveDomainGroups() {
  if (saveTimeout) {
    clearTimeout(saveTimeout);
  }

  saveTimeout = setTimeout(async () => {
    await chrome.storage.sync.set({ domainGroups });
    showSaveIndicator();
  }, 500);
}

// Create save indicator element
function createSaveIndicator() {
  const indicator = document.createElement("div");
  indicator.className = "save-indicator";
  indicator.textContent = "Changes saved";
  indicator.id = "saveIndicator";
  document.body.appendChild(indicator);
}

// Show save indicator
function showSaveIndicator() {
  const indicator = document.getElementById("saveIndicator");
  indicator.classList.add("visible");

  setTimeout(() => {
    indicator.classList.remove("visible");
  }, 2000);
}

// Render domain groups in settings
function renderDomainGroups() {
  const container = document.getElementById("domainGroupsList");
  container.innerHTML = "";

  domainGroups.forEach((group, index) => {
    const groupElement = createDomainGroupElement(group, index);
    container.appendChild(groupElement);
  });
}

// Create DOM element for a domain group in settings
function createDomainGroupElement(group, index) {
  const groupDiv = document.createElement("div");
  groupDiv.className = "domain-group-item";

  const form = document.createElement("form");
  form.className = "domain-group-form";
  form.onsubmit = (e) => {
    e.preventDefault();
    saveGroup(index);
  };

  // Group name input
  const nameRow = createFormRow("Name", "text", `name-${index}`, group.name);

  // Environment inputs
  const localRow = createFormRow(
    "Local URL",
    "text",
    `local-${index}`,
    group.environments.local
  );
  const devRow = createFormRow(
    "Dev URL",
    "text",
    `dev-${index}`,
    group.environments.dev
  );
  const prodRow = createFormRow(
    "Prod URL",
    "text",
    `prod-${index}`,
    group.environments.prod
  );

  // Action buttons
  const actions = document.createElement("div");
  actions.className = "group-actions";

  const saveButton = document.createElement("button");
  saveButton.className = "btn-primary";
  saveButton.textContent = "Save Changes";
  saveButton.type = "submit";

  const deleteButton = document.createElement("button");
  deleteButton.className = "btn-delete";
  deleteButton.textContent = "Delete Group";
  deleteButton.type = "button";
  deleteButton.onclick = () => deleteGroup(index);

  actions.appendChild(deleteButton);
  actions.appendChild(saveButton);

  form.appendChild(nameRow);
  form.appendChild(localRow);
  form.appendChild(devRow);
  form.appendChild(prodRow);
  form.appendChild(actions);

  groupDiv.appendChild(form);
  return groupDiv;
}

// Create a form row with label and input
function createFormRow(label, type, id, value) {
  const row = document.createElement("div");
  row.className = "form-row";

  const labelElement = document.createElement("label");
  labelElement.htmlFor = id;
  labelElement.textContent = label;

  const input = document.createElement("input");
  input.type = type;
  input.id = id;
  input.value = value;
  input.oninput = () => saveDomainGroups();

  row.appendChild(labelElement);
  row.appendChild(input);

  return row;
}

// Save a domain group
async function saveGroup(index) {
  const name = document.getElementById(`name-${index}`).value;
  const local = document.getElementById(`local-${index}`).value;
  const dev = document.getElementById(`dev-${index}`).value;
  const prod = document.getElementById(`prod-${index}`).value;

  domainGroups[index] = {
    id: domainGroups[index].id,
    name,
    environments: { local, dev, prod },
  };

  await saveDomainGroups();
}

// Delete a domain group
async function deleteGroup(index) {
  if (confirm("Are you sure you want to delete this domain group?")) {
    domainGroups.splice(index, 1);
    await saveDomainGroups();
    renderDomainGroups();
  }
}

// Add new domain group
function addNewGroup() {
  const newGroup = {
    id: Date.now().toString(),
    name: "New Group",
    environments: {
      local: "",
      dev: "",
      prod: "",
    },
  };

  domainGroups.push(newGroup);
  renderDomainGroups();
}

// Setup event listeners
function setupEventListeners() {
  document.getElementById("addGroup").addEventListener("click", addNewGroup);
}
