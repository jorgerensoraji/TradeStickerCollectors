const USERS_KEY = "stickerswap.mvp.users";
const SESSION_KEY = "stickerswap.mvp.session";
const RESET_KEY = "stickerswap.mvp.resetTokens";
const CATALOG_KEY = "stickerswap.mvp.stickerCatalog";
const ALBUM_CATALOG_KEY = "stickerswap.mvp.albumCatalog";

const defaultAdmin = {
  id: "admin",
  name: "Admin Manager",
  email: "admin@stickerswap.local",
  password: "admin123",
  city: "Montreal",
  language: "English",
  visibility: "Global",
  role: "admin",
  active: true,
  createdAt: "2026-06-15T00:00:00.000Z",
};

const defaultAlbumCatalog = [
  {
    id: "world-cup-2026",
    name: "World Cup 2026",
    size: 980,
    pageImages: ["", ""],
    template: "world-cup-2026",
    description: "Official 2026 FIFA World Cup sticker album.",
    createdAt: "2026-06-15T00:00:00.000Z",
  },
];

function readJson(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback));
  } catch {
    localStorage.removeItem(key);
    return fallback;
  }
}

function writeJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function getUsers() {
  return readJson(USERS_KEY, []);
}

function saveUsers(users) {
  writeJson(USERS_KEY, users);
}

function seedUsers() {
  const users = getUsers();
  if (!users.some((user) => user.email.toLowerCase() === defaultAdmin.email)) {
    saveUsers([defaultAdmin, ...users]);
  }
}

function getCurrentUser() {
  const sessionId = localStorage.getItem(SESSION_KEY);
  return getUsers().find((user) => user.id === sessionId && user.active !== false) || null;
}

function setStatus(id, message, isError = false) {
  const el = document.querySelector(`#${id}`);
  if (!el) return;
  el.textContent = message;
  el.classList.toggle("error", isError);
}

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function createUser(payload) {
  const users = getUsers();
  const email = normalizeEmail(payload.email);
  if (!email || users.some((user) => user.email.toLowerCase() === email)) {
    throw new Error("This email is already registered.");
  }
  if (!payload.password || payload.password.length < 8) {
    throw new Error("Password must be at least 8 characters.");
  }

  const user = {
    id: crypto.randomUUID(),
    name: payload.name.trim(),
    email,
    password: payload.password,
    city: payload.city.trim() || "Local",
    language: "English",
    visibility: "Friends and nearby collectors",
    role: payload.role || "collector",
    active: true,
    createdAt: new Date().toISOString(),
  };
  users.push(user);
  saveUsers(users);
  return user;
}

function bindLogin() {
  const form = document.querySelector("#loginForm");
  if (!form) return;
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const email = normalizeEmail(data.get("email"));
    const password = String(data.get("password") || "");
    const user = getUsers().find((item) => item.email.toLowerCase() === email && item.password === password);
    if (!user || user.active === false) {
      setStatus("loginStatus", "Invalid email, password, or disabled account.", true);
      return;
    }
    localStorage.setItem(SESSION_KEY, user.id);
    window.location.href = user.role === "admin" ? "admin.html" : "index.html";
  });
}

function bindSignup() {
  const form = document.querySelector("#signupForm");
  if (!form) return;
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(form);
    try {
      const user = createUser({
        name: String(data.get("name") || ""),
        city: String(data.get("city") || ""),
        email: String(data.get("email") || ""),
        password: String(data.get("password") || ""),
      });
      localStorage.setItem(SESSION_KEY, user.id);
      window.location.href = "index.html";
    } catch (error) {
      setStatus("signupStatus", error.message, true);
    }
  });
}

function bindForgotPassword() {
  const form = document.querySelector("#forgotForm");
  if (!form) return;
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const email = normalizeEmail(new FormData(form).get("email"));
    const user = getUsers().find((item) => item.email.toLowerCase() === email);
    if (user) {
      const token = crypto.randomUUID();
      const tokens = readJson(RESET_KEY, {});
      tokens[token] = { userId: user.id, createdAt: new Date().toISOString() };
      writeJson(RESET_KEY, tokens);
      setStatus("forgotStatus", `Reset link ready: reset-password.html?token=${token}`);
      return;
    }
    setStatus("forgotStatus", "If that account exists, a reset link will be prepared.");
  });
}

function bindResetPassword() {
  const form = document.querySelector("#resetForm");
  if (!form) return;
  const token = new URLSearchParams(window.location.search).get("token");
  if (!token) setStatus("resetStatus", "Missing reset token.", true);

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const tokens = readJson(RESET_KEY, {});
    const reset = tokens[token];
    const password = String(new FormData(form).get("password") || "");
    const confirm = String(new FormData(form).get("confirmPassword") || "");
    if (!reset) {
      setStatus("resetStatus", "Reset token is invalid or expired.", true);
      return;
    }
    if (password.length < 8) {
      setStatus("resetStatus", "Password must be at least 8 characters.", true);
      return;
    }
    if (password !== confirm) {
      setStatus("resetStatus", "Passwords do not match.", true);
      return;
    }
    const users = getUsers().map((user) => (user.id === reset.userId ? { ...user, password } : user));
    delete tokens[token];
    saveUsers(users);
    writeJson(RESET_KEY, tokens);
    setStatus("resetStatus", "Password updated. You can login now.");
  });
}

function getCatalog() {
  return readJson(CATALOG_KEY, {});
}

function saveCatalog(catalog) {
  writeJson(CATALOG_KEY, catalog);
}

function getAlbumCatalog() {
  return readJson(ALBUM_CATALOG_KEY, []);
}

function saveAlbumCatalog(catalog) {
  writeJson(ALBUM_CATALOG_KEY, catalog);
}

function seedAlbumCatalog() {
  const catalog = getAlbumCatalog();
  if (!Array.isArray(catalog) || catalog.length === 0) {
    saveAlbumCatalog(defaultAlbumCatalog);
    return;
  }
  let changed = false;
  const next = catalog.map((item) => {
    if (!item.id) {
      changed = true;
      return { ...item, id: crypto.randomUUID() };
    }
    return item;
  });
  if (changed) saveAlbumCatalog(next);
}

function renderAdmin() {
  const user = getCurrentUser();
  if (!document.querySelector("#adminUsersBody")) return;
  if (user?.role !== "admin") {
    window.location.href = "login.html";
    return;
  }

  const users = getUsers();
  const collectors = users.filter((item) => item.role !== "admin");
  document.querySelector("#totalUsers").textContent = users.length;
  document.querySelector("#activeUsers").textContent = users.filter((item) => item.active !== false).length;
  document.querySelector("#disabledUsers").textContent = users.filter((item) => item.active === false).length;
  document.querySelector("#adminUsers").textContent = users.filter((item) => item.role === "admin").length;

  const rows = users
    .map(
      (item) => `
        <tr>
          <td><strong>${escapeHtml(item.name)}</strong><br /><span class="form-status">${escapeHtml(item.city || "Local")}</span></td>
          <td>${escapeHtml(item.email)}</td>
          <td><span class="badge ${item.role === "admin" ? "admin" : ""}">${escapeHtml(item.role)}</span></td>
          <td><span class="badge ${item.active === false ? "disabled" : "active"}">${item.active === false ? "Disabled" : "Active"}</span></td>
          <td>${new Date(item.createdAt).toLocaleDateString()}</td>
          <td>
            <div class="row-actions">
              <button type="button" data-toggle="${item.id}" ${item.id === user.id ? "disabled" : ""}>${item.active === false ? "Enable" : "Disable"}</button>
              <button type="button" data-role="${item.id}" ${item.id === user.id ? "disabled" : ""}>${item.role === "admin" ? "Collector" : "Admin"}</button>
              <button class="danger" type="button" data-delete="${item.id}" ${item.id === user.id ? "disabled" : ""}>Delete</button>
            </div>
          </td>
        </tr>
      `,
    )
    .join("");
  document.querySelector("#adminUsersBody").innerHTML = rows;
  document.querySelector("#collectorCount").textContent = `${collectors.length} collector account${collectors.length === 1 ? "" : "s"}`;
  renderCatalogAdmin();
  renderAlbumCatalogAdmin();
}

function renderAlbumCatalogAdmin() {
  const list = document.querySelector("#albumCatalogList");
  if (!list) return;
  const catalog = getAlbumCatalog();
  document.querySelector("#albumCatalogCount").textContent = `${catalog.length} album${catalog.length === 1 ? "" : "s"} available`;
  list.innerHTML = catalog.length
    ? catalog
        .map(
          (album) => `
            <article class="catalog-admin-card album-catalog-card">
              <strong>${escapeHtml(album.name)}</strong>
              <small>${album.size} stickers</small>
              ${album.description ? `<p class="form-status">${escapeHtml(album.description)}</p>` : ""}
              <button type="button" data-remove-album="${escapeHtml(album.id)}">Remove</button>
            </article>
          `,
        )
        .join("")
    : '<p class="form-status">No albums in catalog yet. Create one to let collectors add it.</p>';
}

function renderCatalogAdmin() {
  const grid = document.querySelector("#catalogAdminGrid");
  if (!grid) return;
  const catalog = getCatalog();
  const entries = Object.entries(catalog).sort((a, b) => Number(a[0]) - Number(b[0]));
  document.querySelector("#catalogCount").textContent = `${entries.length} sticker${entries.length === 1 ? "" : "s"} uploaded`;
  grid.innerHTML = entries.length
    ? entries
        .map(
          ([number, image]) => `
            <article class="catalog-admin-card">
              <img src="${image}" alt="Sticker ${escapeHtml(number)}" />
              <strong>#${escapeHtml(number)}</strong>
              <button type="button" data-remove-catalog="${escapeHtml(number)}">Remove</button>
            </article>
          `,
        )
        .join("")
    : '<p class="form-status">No sticker images uploaded yet.</p>';
}

function bindAdmin() {
  const form = document.querySelector("#adminCreateForm");
  const body = document.querySelector("#adminUsersBody");
  const logout = document.querySelector("#adminLogoutBtn");
  const catalogForm = document.querySelector("#catalogUploadForm");
  const catalogGrid = document.querySelector("#catalogAdminGrid");
  if (!body) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(form);
    try {
      createUser({
        name: String(data.get("name") || ""),
        city: String(data.get("city") || ""),
        email: String(data.get("email") || ""),
        password: String(data.get("password") || ""),
        role: String(data.get("role") || "collector"),
      });
      form.reset();
      setStatus("adminStatus", "Account created.");
      renderAdmin();
    } catch (error) {
      setStatus("adminStatus", error.message, true);
    }
  });

  body.addEventListener("click", (event) => {
    const button = event.target.closest("button");
    if (!button) return;
    const users = getUsers();
    const current = getCurrentUser();
    if (button.dataset.toggle && button.dataset.toggle !== current.id) {
      saveUsers(users.map((user) => (user.id === button.dataset.toggle ? { ...user, active: user.active === false } : user)));
    }
    if (button.dataset.role && button.dataset.role !== current.id) {
      saveUsers(users.map((user) => (user.id === button.dataset.role ? { ...user, role: user.role === "admin" ? "collector" : "admin" } : user)));
    }
    if (button.dataset.delete && button.dataset.delete !== current.id) {
      saveUsers(users.filter((user) => user.id !== button.dataset.delete));
    }
    renderAdmin();
  });

  logout.addEventListener("click", () => {
    localStorage.removeItem(SESSION_KEY);
    window.location.href = "login.html";
  });

  catalogForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(catalogForm);
    const number = Number.parseInt(data.get("number"), 10);
    const file = data.get("image");
    if (!Number.isInteger(number) || number < 1) {
      setStatus("catalogStatus", "Enter a valid sticker reference number.", true);
      return;
    }
    if (!file || !file.type?.startsWith("image/")) {
      setStatus("catalogStatus", "Choose an image file.", true);
      return;
    }
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      const catalog = getCatalog();
      catalog[number] = String(reader.result || "");
      saveCatalog(catalog);
      catalogForm.reset();
      setStatus("catalogStatus", `Sticker #${number} image saved.`);
      renderCatalogAdmin();
    });
    reader.readAsDataURL(file);
  });

  catalogGrid?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-remove-catalog]");
    if (!button) return;
    const catalog = getCatalog();
    delete catalog[button.dataset.removeCatalog];
    saveCatalog(catalog);
    setStatus("catalogStatus", `Sticker #${button.dataset.removeCatalog} removed.`);
    renderCatalogAdmin();
  });

  const albumForm = document.querySelector("#albumCatalogForm");
  const albumList = document.querySelector("#albumCatalogList");

  albumForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(albumForm);
    const name = String(data.get("name") || "").trim();
    const size = Number.parseInt(data.get("size"), 10);
    const description = String(data.get("description") || "").trim();
    const leftImage = String(data.get("leftImage") || "").trim();
    const rightImage = String(data.get("rightImage") || "").trim();
    if (!name) {
      setStatus("albumCatalogStatus", "Album name is required.", true);
      return;
    }
    if (!Number.isInteger(size) || size < 1 || size > 980) {
      setStatus("albumCatalogStatus", "Sticker count must be between 1 and 980.", true);
      return;
    }
    const catalog = getAlbumCatalog();
    catalog.push({
      id: crypto.randomUUID(),
      name,
      size,
      description,
      pageImages: [leftImage, rightImage],
      template: size === 980 ? "world-cup-2026" : "custom",
      createdAt: new Date().toISOString(),
    });
    saveAlbumCatalog(catalog);
    albumForm.reset();
    setStatus("albumCatalogStatus", `Album "${name}" added to catalog.`);
    renderAlbumCatalogAdmin();
  });

  albumList?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-remove-album]");
    if (!button) return;
    const id = button.dataset.removeAlbum;
    const catalog = getAlbumCatalog().filter((album) => album.id !== id);
    saveAlbumCatalog(catalog);
    setStatus("albumCatalogStatus", "Album removed from catalog.");
    renderAlbumCatalogAdmin();
  });
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

seedUsers();
seedAlbumCatalog();
bindLogin();
bindSignup();
bindForgotPassword();
bindResetPassword();
renderAdmin();
bindAdmin();
