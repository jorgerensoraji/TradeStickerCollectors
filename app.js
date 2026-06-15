const STORAGE_KEY = "stickerswap.mvp.state";
const USERS_KEY = "stickerswap.mvp.users";
const SESSION_KEY = "stickerswap.mvp.session";
const RESET_KEY = "stickerswap.mvp.resetTokens";
const CATALOG_KEY = "stickerswap.mvp.stickerCatalog";
const ALBUM_CATALOG_KEY = "stickerswap.mvp.albumCatalog";

const seedAdminAccount = {
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

const WORLD_CUP_SIZE = 980;
const WORLD_CUP_TEAMS = [
  ["A", "Mexico", "MEX", 21],
  ["A", "South Africa", "RSA", 41],
  ["A", "South Korea", "KOR", 61],
  ["A", "Czechia", "CZE", 81],
  ["B", "Canada", "CAN", 101],
  ["B", "Bosnia and Herzegovina", "BIH", 121],
  ["B", "Qatar", "QAT", 141],
  ["B", "Switzerland", "SUI", 161],
  ["C", "Brazil", "BRA", 181],
  ["C", "Morocco", "MAR", 201],
  ["C", "Haiti", "HAI", 221],
  ["C", "Scotland", "SCO", 241],
  ["D", "United States", "USA", 261],
  ["D", "Paraguay", "PAR", 281],
  ["D", "Australia", "AUS", 301],
  ["D", "Turkey", "TUR", 321],
  ["E", "Germany", "GER", 341],
  ["E", "Curacao", "CUW", 361],
  ["E", "Cote d'Ivoire", "CIV", 381],
  ["E", "Ecuador", "ECU", 401],
  ["F", "Netherlands", "NED", 421],
  ["F", "Japan", "JPN", 441],
  ["F", "Sweden", "SWE", 461],
  ["F", "Tunisia", "TUN", 481],
  ["G", "Belgium", "BEL", 501],
  ["G", "Egypt", "EGY", 521],
  ["G", "Iran", "IRN", 541],
  ["G", "New Zealand", "NZL", 561],
  ["H", "Spain", "ESP", 581],
  ["H", "Cape Verde", "CPV", 601],
  ["H", "Saudi Arabia", "KSA", 621],
  ["H", "Uruguay", "URU", 641],
  ["I", "France", "FRA", 661],
  ["I", "Senegal", "SEN", 681],
  ["I", "Iraq", "IRQ", 701],
  ["I", "Norway", "NOR", 721],
  ["J", "Argentina", "ARG", 741],
  ["J", "Algeria", "ALG", 761],
  ["J", "Austria", "AUT", 781],
  ["J", "Jordan", "JOR", 801],
  ["K", "Portugal", "POR", 821],
  ["K", "DR Congo", "COD", 841],
  ["K", "Uzbekistan", "UZB", 861],
  ["K", "Colombia", "COL", 881],
  ["L", "England", "ENG", 901],
  ["L", "Croatia", "CRO", 921],
  ["L", "Ghana", "GHA", 941],
  ["L", "Panama", "PAN", 961],
];

const WORLD_CUP_SPREADS = [
  { id: "opening", title: "Opening + FIFA Museum", subtitle: "#00, FWC1-FWC19", start: 1, end: 20, group: "Opening" },
  ...WORLD_CUP_TEAMS.map(([group, name, code, start], index) => ({
    id: code,
    title: name,
    subtitle: `Group ${group} - ${code}1-${code}20`,
    start,
    end: start + 19,
    code,
    group,
    spread: index + 1,
  })),
];

const STICKER_VARIANTS = [
  { id: "white", label: "White mark" },
  { id: "red", label: "Red mark" },
  { id: "green", label: "Green mark" },
  { id: "purple", label: "Purple mark" },
  { id: "black", label: "Black mark" },
];

const sampleAlbums = [
  {
    id: crypto.randomUUID(),
    catalogId: "world-cup-2026",
    name: "World Cup 2026",
    size: WORLD_CUP_SIZE,
    pageImages: ["", ""],
    template: "world-cup-2026",
    stickers: seedStickers(WORLD_CUP_SIZE, []),
  },
];

const anaInventory = {
  size: 120,
  owned: new Set([2, 7, 12, 25, 45, 52, 70, 81, 88, 104]),
  duplicates: new Map([
    [7, 2],
    [25, 1],
    [70, 1],
    [104, 3],
  ]),
};

const state = normalizeState(loadState());
seedUsers();
seedAlbumCatalogIfEmpty();
let activeAlbumId = state.albums[0].id;
let activeTrade = null;
let activeFeedFilter = "global";
let activeChatPersonId = state.friends[0]?.id || "ana";
let isMessengerOpen = false;
let activeAlbumView = "grid";
let activeStickerNumber = null;
let activeSpreadIndex = 0;
let isSpreadTurning = false;

const els = {
  viewTitle: document.querySelector("#viewTitle"),
  navItems: document.querySelectorAll(".nav-item"),
  albumSelect: document.querySelector("#albumSelect"),
  ownedStat: document.querySelector("#ownedStat"),
  missingStat: document.querySelector("#missingStat"),
  duplicateStat: document.querySelector("#duplicateStat"),
  completionPercent: document.querySelector("#completionPercent"),
  progressFill: document.querySelector("#progressFill"),
  gridCountLabel: document.querySelector("#gridCountLabel"),
  stickerGrid: document.querySelector("#stickerGrid"),
  stickerSearch: document.querySelector("#stickerSearch"),
  stickerSearchResults: document.querySelector("#stickerSearchResults"),
  albumViewButtons: document.querySelectorAll("[data-album-view]"),
  spreadControls: document.querySelector("#spreadControls"),
  spreadSelect: document.querySelector("#spreadSelect"),
  prevSpreadBtn: document.querySelector("#prevSpreadBtn"),
  nextSpreadBtn: document.querySelector("#nextSpreadBtn"),
  catalogueView: document.querySelector("#catalogueView"),
  cataloguePageOne: document.querySelector("#cataloguePageOne"),
  cataloguePageTwo: document.querySelector("#cataloguePageTwo"),
  pageOneImage: document.querySelector("#pageOneImage"),
  pageTwoImage: document.querySelector("#pageTwoImage"),
  pageOnePlaceholder: document.querySelector("#pageOnePlaceholder"),
  pageTwoPlaceholder: document.querySelector("#pageTwoPlaceholder"),
  pageOneSlots: document.querySelector("#pageOneSlots"),
  pageTwoSlots: document.querySelector("#pageTwoSlots"),
  quickAddForm: document.querySelector("#quickAddForm"),
  quickAddInput: document.querySelector("#quickAddInput"),
  quickAddHint: document.querySelector("#quickAddHint"),
  newAlbumBtn: document.querySelector("#newAlbumBtn"),
  albumDialog: document.querySelector("#albumDialog"),
  albumForm: document.querySelector("#albumForm"),
  albumCatalogPicker: document.querySelector("#albumCatalogPicker"),
  albumPickerStatus: document.querySelector("#albumPickerStatus"),
  cancelAlbumBtn: document.querySelector("#cancelAlbumBtn"),
  stickerDialog: document.querySelector("#stickerDialog"),
  stickerImageForm: document.querySelector("#stickerImageForm"),
  stickerDialogTitle: document.querySelector("#stickerDialogTitle"),
  stickerPreview: document.querySelector("#stickerPreview"),
  stickerVariantSelect: document.querySelector("#stickerVariantSelect"),
  stickerDialogStatus: document.querySelector("#stickerDialogStatus"),
  markStickerOwnedBtn: document.querySelector("#markStickerOwnedBtn"),
  addStickerDuplicateBtn: document.querySelector("#addStickerDuplicateBtn"),
  removeStickerDuplicateBtn: document.querySelector("#removeStickerDuplicateBtn"),
  clearStickerDuplicatesBtn: document.querySelector("#clearStickerDuplicatesBtn"),
  markStickerMissingBtn: document.querySelector("#markStickerMissingBtn"),
  closeStickerDialogBtn: document.querySelector("#closeStickerDialogBtn"),
  postInput: document.querySelector("#postInput"),
  cityInput: document.querySelector("#cityInput"),
  postBtn: document.querySelector("#postBtn"),
  postList: document.querySelector("#postList"),
  feedFilters: document.querySelectorAll("[data-feed-filter]"),
  messageList: document.querySelector("#messageList"),
  miniMessageList: document.querySelector("#miniMessageList"),
  compareBtn: document.querySelector("#compareBtn"),
  confirmTradeBtn: document.querySelector("#confirmTradeBtn"),
  chatForm: document.querySelector("#chatForm"),
  chatInput: document.querySelector("#chatInput"),
  miniChatForm: document.querySelector("#miniChatForm"),
  miniChatInput: document.querySelector("#miniChatInput"),
  friendList: document.querySelector("#friendList"),
  suggestionList: document.querySelector("#suggestionList"),
  jumpButtons: document.querySelectorAll("[data-jump-view]"),
  messengerContactList: document.querySelector("#messengerContactList"),
  messengerDock: document.querySelector("#messengerDock"),
  messengerFab: document.querySelector("#messengerFab"),
  messengerFabInitials: document.querySelector("#messengerFabInitials"),
  messengerWindow: document.querySelector("#messengerWindow"),
  messengerPersonBtn: document.querySelector("#messengerPersonBtn"),
  messengerAvatar: document.querySelector("#messengerAvatar"),
  messengerName: document.querySelector("#messengerName"),
  messengerStatus: document.querySelector("#messengerStatus"),
  messengerCloseBtn: document.querySelector("#messengerCloseBtn"),
  messengerMessages: document.querySelector("#messengerMessages"),
  messengerForm: document.querySelector("#messengerForm"),
  messengerInput: document.querySelector("#messengerInput"),
  profileInitials: document.querySelector("#profileInitials"),
  profileName: document.querySelector("#profileName"),
  profileMeta: document.querySelector("#profileMeta"),
  accountHeading: document.querySelector("#accountHeading"),
  accountSummary: document.querySelector("#accountSummary"),
  accountNameInput: document.querySelector("#accountNameInput"),
  accountCityInput: document.querySelector("#accountCityInput"),
  accountEmailInput: document.querySelector("#accountEmailInput"),
  accountLanguageInput: document.querySelector("#accountLanguageInput"),
  accountVisibilityInput: document.querySelector("#accountVisibilityInput"),
  saveAccountBtn: document.querySelector("#saveAccountBtn"),
  accountStatus: document.querySelector("#accountStatus"),
  logoutBtn: document.querySelector("#logoutBtn"),
};

function getUsers() {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
  } catch {
    localStorage.removeItem(USERS_KEY);
    return [];
  }
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function seedUsers() {
  const users = getUsers();
  const hasAdmin = users.some((user) => user.email.toLowerCase() === seedAdminAccount.email);
  if (!hasAdmin) {
    saveUsers([seedAdminAccount, ...users]);
  }
}

function getSessionUser() {
  const sessionId = localStorage.getItem(SESSION_KEY);
  if (!sessionId) return null;
  return getUsers().find((user) => user.id === sessionId && user.active !== false) || null;
}

function saveSessionUser(nextUser) {
  const users = getUsers().map((user) => (user.id === nextUser.id ? nextUser : user));
  saveUsers(users);
  localStorage.setItem(SESSION_KEY, nextUser.id);
}

function getInitials(name) {
  return String(name || "Collector")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("") || "CO";
}

function seedStickers(size, numbers) {
  const stickers = {};
  for (let i = 1; i <= size; i += 1) {
    stickers[i] = { owned: false, duplicates: 0, image: "", variants: {} };
  }
  numbers.forEach((number) => {
    if (!stickers[number]) return;
    normalizeStickerVariants(stickers[number]);
    stickers[number].variants.white += 1;
    syncStickerTotals(stickers[number]);
  });
  return stickers;
}

function loadState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }

  return {
    albums: sampleAlbums,
    posts: [],
    messages: [],
    friends: [],
    suggestions: [],
  };
}

function normalizeState(nextState) {
  nextState.albums = nextState.albums?.length ? nextState.albums : sampleAlbums;
  nextState.albums.forEach((album) => {
    if (album.name === "World Cup 2026" && album.size < WORLD_CUP_SIZE) {
      album.size = WORLD_CUP_SIZE;
      album.template = "world-cup-2026";
    }
    album.pageImages = Array.isArray(album.pageImages) ? album.pageImages : ["", ""];
    if (!album.pageImages[0]) album.pageImages[0] = "";
    if (!album.pageImages[1]) album.pageImages[1] = "";
    for (let number = 1; number <= album.size; number += 1) {
      if (!album.stickers[number]) {
        album.stickers[number] = { owned: false, duplicates: 0, image: "", variants: {} };
      } else if (typeof album.stickers[number].image !== "string") {
        album.stickers[number].image = "";
      }
      normalizeStickerVariants(album.stickers[number]);
    }
  });
  nextState.posts = Array.isArray(nextState.posts) ? nextState.posts : [];
  nextState.messages = Array.isArray(nextState.messages) ? nextState.messages : [];
  nextState.friends = Array.isArray(nextState.friends) ? nextState.friends : [];
  nextState.suggestions = Array.isArray(nextState.suggestions) ? nextState.suggestions : [];
  return nextState;
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function normalizeStickerVariants(sticker) {
  if (!sticker.variants || typeof sticker.variants !== "object") {
    sticker.variants = {};
  }
  STICKER_VARIANTS.forEach((variant) => {
    sticker.variants[variant.id] = Number.parseInt(sticker.variants[variant.id], 10) || 0;
  });
  const existingCopies = getStickerCopyTotal(sticker);
  if (existingCopies === 0 && sticker.owned) {
    sticker.variants.white = 1 + (Number.parseInt(sticker.duplicates, 10) || 0);
  }
  sticker.owned = getStickerCopyTotal(sticker) > 0;
  sticker.duplicates = getStickerDuplicateTotal(sticker);
}

function getStickerCopyTotal(sticker) {
  if (!sticker?.variants) return sticker?.owned ? 1 + (Number.parseInt(sticker.duplicates, 10) || 0) : 0;
  return STICKER_VARIANTS.reduce((sum, variant) => sum + (Number.parseInt(sticker.variants[variant.id], 10) || 0), 0);
}

function getStickerDuplicateTotal(sticker) {
  return Math.max(0, getStickerCopyTotal(sticker) - 1);
}

function getSelectedVariantId() {
  return els.stickerVariantSelect?.value || "white";
}

function syncStickerTotals(sticker) {
  sticker.owned = getStickerCopyTotal(sticker) > 0;
  sticker.duplicates = getStickerDuplicateTotal(sticker);
}

function getStickerCatalog() {
  try {
    return JSON.parse(localStorage.getItem(CATALOG_KEY) || "{}");
  } catch {
    localStorage.removeItem(CATALOG_KEY);
    return {};
  }
}

function getStickerDisplayImage(sticker, number) {
  if (getStickerCopyTotal(sticker) < 1) return "";
  return getStickerCatalog()[number] || "";
}

function getStickerMeta(number) {
  if (number === 1) return { code: "#00", title: "Panini Logo", section: "Opening" };
  if (number >= 2 && number <= 9) return { code: `FWC${number - 1}`, title: "Official opening foil", section: "Opening" };
  if (number >= 10 && number <= 20) return { code: `FWC${number - 1}`, title: "FIFA Museum", section: "FIFA Museum" };
  const team = WORLD_CUP_TEAMS.find(([, , , start]) => number >= start && number <= start + 19);
  if (!team) return { code: String(number), title: `Sticker ${number}`, section: "Album" };
  const [group, name, code, start] = team;
  const local = number - start + 1;
  const title = local === 1 ? "Team emblem" : local === 13 ? "Team photo" : "Player";
  return { code: `${code}${local}`, title, section: `Group ${group} - ${name}`, team: name, group };
}

function getActiveSpread() {
  return WORLD_CUP_SPREADS[activeSpreadIndex] || WORLD_CUP_SPREADS[0];
}

function normalizeSearch(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function getStickerSearchText(number) {
  const meta = getStickerMeta(number);
  return normalizeSearch([
    number,
    meta.code,
    meta.title,
    meta.section,
    meta.team,
    meta.group ? `group ${meta.group}` : "",
  ].filter(Boolean).join(" "));
}

function getStickerSearchMatches(rawQuery, limit = 12) {
  const album = getActiveAlbum();
  const query = normalizeSearch(rawQuery);
  if (!query) return [];
  const matches = [];
  for (let number = 1; number <= album.size; number += 1) {
    const meta = getStickerMeta(number);
    const exactNumber = String(number) === query;
    const exactCode = normalizeSearch(meta.code) === query;
    const startsCode = normalizeSearch(meta.code).startsWith(query);
    const haystack = getStickerSearchText(number);
    if (exactNumber || exactCode || startsCode || haystack.includes(query)) {
      matches.push({ number, meta, score: exactNumber || exactCode ? 0 : startsCode ? 1 : 2 });
    }
  }
  return matches.sort((a, b) => a.score - b.score || a.number - b.number).slice(0, limit);
}

function getSpreadIndexForSticker(number) {
  const index = WORLD_CUP_SPREADS.findIndex((spread) => number >= spread.start && number <= spread.end);
  return Math.max(0, index);
}

function createTurnFaceFromPage(page, className) {
  const face = document.createElement("div");
  face.className = className;
  face.style.backgroundPosition = window.getComputedStyle(page).backgroundPosition;
  face.innerHTML = page.innerHTML;
  return face;
}

function animateSpreadTurn(direction, distance = 1, renderUnderlay = () => {}, onDone = () => {}) {
  if (!els.catalogueView || activeAlbumView !== "spread") {
    renderUnderlay();
    onDone();
    return;
  }

  const sourcePage = direction === "back" ? els.cataloguePageOne : els.cataloguePageTwo;
  if (!sourcePage) {
    renderUnderlay();
    onDone();
    return;
  }

  const duration = distance > 1 ? 1700 : 1280;
  const frontFace = createTurnFaceFromPage(sourcePage, "turning-face turning-face-front");

  const incomingPage = direction === "back" ? els.cataloguePageTwo : els.cataloguePageOne;
  const destPlaceholder = direction === "back" ? els.pageTwoPlaceholder : els.pageOnePlaceholder;
  const destSlots = direction === "back" ? els.pageTwoSlots : els.pageOneSlots;
  const destImage = direction === "back" ? els.pageTwoImage : els.pageOneImage;
  const destSide = direction === "back" ? "right" : "left";
  const destOffset = direction === "back" ? 10 : 0;

  const oldDestPlaceholderHTML = destPlaceholder ? destPlaceholder.innerHTML : "";
  const oldDestSlotsHTML = destSlots ? destSlots.innerHTML : "";
  const oldDestImageSrc = destImage ? destImage.getAttribute("src") || "" : "";
  const oldDestImageHidden = destImage ? destImage.hidden : true;
  const oldDestPlaceholderHidden = destPlaceholder ? destPlaceholder.hidden : false;

  renderUnderlay();

  const backFace = createTurnFaceFromPage(incomingPage, "turning-face turning-face-back");

  if (destPlaceholder) {
    destPlaceholder.innerHTML = oldDestPlaceholderHTML;
    destPlaceholder.hidden = oldDestPlaceholderHidden;
  }
  if (destSlots) destSlots.innerHTML = oldDestSlotsHTML;
  if (destImage) {
    if (oldDestImageSrc) {
      destImage.src = oldDestImageSrc;
      destImage.hidden = oldDestImageHidden;
    } else {
      destImage.removeAttribute("src");
      destImage.hidden = true;
    }
  }

  const sheet = document.createElement("article");
  sheet.classList.add("turning-sheet", direction === "back" ? "turning-sheet-back" : "turning-sheet-next");
  sheet.style.animationDuration = `${duration}ms`;
  sheet.append(frontFace, backFace);

  const shadow = document.createElement("div");
  shadow.className = `turning-shadow ${direction === "back" ? "turning-shadow-back" : "turning-shadow-next"}`;
  shadow.style.animationDuration = `${duration}ms`;
  sheet.style.setProperty("--turn-duration", `${duration}ms`);

  els.catalogueView.classList.add("is-turning");
  els.catalogueView.append(shadow, sheet);

  const swapTimer = window.setTimeout(() => {
    const album = getActiveAlbum();
    const spread = getActiveSpread();
    if (destPlaceholder) destPlaceholder.innerHTML = renderSpreadPageHeader(spread, destSide);
    if (destSlots) destSlots.innerHTML = renderSpreadSlots(album, spread, destOffset);
    if (destImage) {
      destImage.removeAttribute("src");
      destImage.hidden = true;
    }
    if (destPlaceholder) destPlaceholder.hidden = false;
  }, Math.round(duration * 0.82));

  window.setTimeout(() => {
    window.clearTimeout(swapTimer);
    const album = getActiveAlbum();
    const spread = getActiveSpread();
    if (destPlaceholder) {
      destPlaceholder.innerHTML = renderSpreadPageHeader(spread, destSide);
      destPlaceholder.hidden = false;
    }
    if (destSlots) destSlots.innerHTML = renderSpreadSlots(album, spread, destOffset);
    if (destImage) {
      destImage.removeAttribute("src");
      destImage.hidden = true;
    }
    onDone();
    sheet.remove();
    shadow.remove();
    els.catalogueView.classList.remove("is-turning");
  }, duration + 80);
}

function turnSpreadTo(nextIndex, animate = true, afterDone = () => {}) {
  const clampedIndex = Math.max(0, Math.min(WORLD_CUP_SPREADS.length - 1, nextIndex));
  const previousIndex = activeSpreadIndex;
  if (clampedIndex === previousIndex) {
    afterDone();
    return;
  }
  if (isSpreadTurning) return;

  const renderUnderlay = () => {
    activeSpreadIndex = clampedIndex;
    if (els.spreadSelect) els.spreadSelect.value = String(activeSpreadIndex);
    renderAlbum();
  };

  const finishTurn = () => {
    isSpreadTurning = false;
    afterDone();
  };

  if (!animate) {
    finishTurn();
    return;
  }

  isSpreadTurning = true;
  animateSpreadTurn(clampedIndex > previousIndex ? "next" : "back", Math.abs(clampedIndex - previousIndex), renderUnderlay, finishTurn);
}

function updateAuthUI() {
  const user = getSessionUser();
  const isAdmin = user?.role === "admin";

  document.querySelectorAll("[data-auth-only]").forEach((item) => {
    item.hidden = !user;
  });
  document.querySelectorAll("[data-guest-only]").forEach((item) => {
    item.hidden = Boolean(user);
  });
  document.querySelectorAll("[data-admin-only]").forEach((item) => {
    item.hidden = !isAdmin;
  });

  if (!user) {
    const active = document.querySelector(".view.active");
    if (!active || active.id !== "homeView") switchView("home");
    return;
  }

  fillAccountView(user);
}

function fillAccountView(user) {
  const initials = getInitials(user.name);
  if (els.profileInitials) els.profileInitials.textContent = initials;
  if (els.profileName) els.profileName.textContent = user.name || "Collector";
  if (els.profileMeta) els.profileMeta.textContent = `${user.city || "Local"} ${user.role === "admin" ? "admin" : "collector"}`;
  if (els.accountHeading) els.accountHeading.textContent = user.name || "Collector";
  if (els.accountSummary) els.accountSummary.textContent = `${user.city || "Local"} collector account.`;
  if (els.accountNameInput) els.accountNameInput.value = user.name || "";
  if (els.accountCityInput) els.accountCityInput.value = user.city || "";
  if (els.accountEmailInput) els.accountEmailInput.value = user.email || "";
  if (els.accountLanguageInput) els.accountLanguageInput.value = user.language || "English";
  if (els.accountVisibilityInput) els.accountVisibilityInput.value = user.visibility || "Friends and nearby collectors";
}

function saveAccountProfile() {
  const user = getSessionUser();
  if (!user) {
    if (els.accountStatus) {
      els.accountStatus.classList.add("error");
      els.accountStatus.textContent = "Login to save your profile.";
    }
    return;
  }

  const nextUser = {
    ...user,
    name: els.accountNameInput.value.trim() || user.name,
    city: els.accountCityInput.value.trim() || "Local",
    language: els.accountLanguageInput.value,
    visibility: els.accountVisibilityInput.value,
  };
  saveSessionUser(nextUser);
  updateAuthUI();
  if (els.accountStatus) {
    els.accountStatus.classList.remove("error");
    els.accountStatus.textContent = "Profile saved.";
  }
}

function getActiveAlbum() {
  return state.albums.find((album) => album.id === activeAlbumId) || state.albums[0];
}

function getStickerStatus(sticker) {
  if (getStickerDuplicateTotal(sticker) > 0) return "duplicate";
  if (getStickerCopyTotal(sticker) > 0) return "owned";
  return "missing";
}

function renderAlbumOptions() {
  els.albumSelect.innerHTML = state.albums
    .map((album) => `<option value="${album.id}">${escapeHtml(album.name)}</option>`)
    .join("");
  els.albumSelect.value = activeAlbumId;
}

function renderSpreadOptions() {
  if (!els.spreadSelect) return;
  els.spreadSelect.innerHTML = WORLD_CUP_SPREADS.map((spread, index) => {
    const label = index === 0
      ? `Opening - ${spread.start}-${spread.end}`
      : `${String(index).padStart(2, "0")} ${spread.title} (${spread.start}-${spread.end})`;
    return `<option value="${index}">${escapeHtml(label)}</option>`;
  }).join("");
  els.spreadSelect.value = String(activeSpreadIndex);
}

function renderAlbum() {
  const album = getActiveAlbum();
  const stickers = Object.values(album.stickers);
  const owned = stickers.filter((sticker) => getStickerCopyTotal(sticker) > 0).length;
  const duplicates = stickers.reduce((sum, sticker) => sum + getStickerDuplicateTotal(sticker), 0);
  const missing = album.size - owned;
  const percent = Math.round((owned / album.size) * 100);

  els.ownedStat.textContent = owned;
  els.missingStat.textContent = missing;
  els.duplicateStat.textContent = duplicates;
  els.completionPercent.textContent = `${percent}%`;
  els.progressFill.style.width = `${percent}%`;
  els.gridCountLabel.textContent = `${album.size} stickers`;

  renderStickerGrid();
  renderCatalogue();
}

function renderStickerGrid() {
  const album = getActiveAlbum();
  const rawQuery = els.stickerSearch.value;
  const searchNumbers = new Set(getStickerSearchMatches(rawQuery, album.size).map((item) => item.number));
  const hasQuery = normalizeSearch(rawQuery).length > 0;
  const catalog = getStickerCatalog();
  const cells = [];

  for (let number = 1; number <= album.size; number += 1) {
    if (hasQuery && !searchNumbers.has(number)) continue;
    const sticker = album.stickers[number];
    const meta = getStickerMeta(number);
    const status = getStickerStatus(sticker);
    const duplicateTotal = getStickerDuplicateTotal(sticker);
    const badge = duplicateTotal > 0 ? `<span class="duplicate-badge">+${duplicateTotal}</span>` : "";
    const displayImage = getStickerCopyTotal(sticker) > 0 ? catalog[number] : "";
    const image = displayImage ? `<img src="${displayImage}" alt="Sticker ${number} image" />` : "";
    cells.push(`
      <button class="sticker-cell ${status}" type="button" data-sticker="${number}" aria-label="${meta.code}, sticker ${number}, ${status}">
        ${image}
        <span class="sticker-number">${escapeHtml(meta.code)}</span>
        <small>${number}</small>
        ${badge}
      </button>
    `);
  }

  els.stickerGrid.innerHTML = cells.length ? cells.join("") : '<p class="sticker-empty">No stickers found.</p>';
}

function renderStickerSearchResults() {
  if (!els.stickerSearchResults) return;
  const query = els.stickerSearch.value;
  const matches = getStickerSearchMatches(query, 10);
  if (!normalizeSearch(query) || !matches.length) {
    els.stickerSearchResults.hidden = true;
    els.stickerSearchResults.innerHTML = "";
    return;
  }
  els.stickerSearchResults.hidden = false;
  els.stickerSearchResults.innerHTML = matches.map(({ number, meta }) => {
    const spreadIndex = getSpreadIndexForSticker(number);
    const spread = WORLD_CUP_SPREADS[spreadIndex];
    return `
      <button type="button" data-search-sticker="${number}">
        <strong>${escapeHtml(meta.code)}</strong>
        <span>${escapeHtml(meta.team || meta.section)} - #${number}</span>
        <small>${escapeHtml(spread?.title || "Album")}</small>
      </button>
    `;
  }).join("");
}

function focusStickerFromSearch(number) {
  const spreadIndex = getSpreadIndexForSticker(number);
  const focusTarget = () => {
    requestAnimationFrame(() => {
      const target = document.querySelector(`[data-sticker="${number}"], [data-page-sticker="${number}"]`);
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
        target.classList.add("search-focus");
        window.setTimeout(() => target.classList.remove("search-focus"), 1200);
      }
    });
  };

  if (activeAlbumView === "spread") {
    turnSpreadTo(spreadIndex, true, focusTarget);
  } else {
    renderAlbum();
    focusTarget();
  }
  els.stickerSearchResults.hidden = true;
}

function renderCatalogue() {
  const album = getActiveAlbum();
  const showGrid = activeAlbumView === "grid";

  els.stickerGrid.hidden = !showGrid;
  if (els.spreadControls) els.spreadControls.hidden = showGrid;
  els.catalogueView.hidden = showGrid;
  els.catalogueView.classList.toggle("spread", !showGrid);
  els.cataloguePageOne.hidden = showGrid;
  els.cataloguePageTwo.hidden = showGrid;

  if (showGrid) return;

  const spread = getActiveSpread();
  if (els.spreadSelect) els.spreadSelect.value = String(activeSpreadIndex);
  if (els.prevSpreadBtn) els.prevSpreadBtn.disabled = activeSpreadIndex === 0;
  if (els.nextSpreadBtn) els.nextSpreadBtn.disabled = activeSpreadIndex === WORLD_CUP_SPREADS.length - 1;
  updatePageImage(els.pageOneImage, els.pageOnePlaceholder, "");
  updatePageImage(els.pageTwoImage, els.pageTwoPlaceholder, "");

  els.pageOnePlaceholder.innerHTML = renderSpreadPageHeader(spread, "left");
  els.pageTwoPlaceholder.innerHTML = renderSpreadPageHeader(spread, "right");
  els.pageOneSlots.innerHTML = renderSpreadSlots(album, spread, 0);
  els.pageTwoSlots.innerHTML = renderSpreadSlots(album, spread, 10);
}

function updatePageImage(imageEl, placeholderEl, src) {
  const hasImage = Boolean(src);
  imageEl.hidden = !hasImage;
  placeholderEl.hidden = hasImage;
  if (hasImage && imageEl.src !== src) {
    imageEl.src = src;
  }
}

function renderSpreadPageHeader(spread, side) {
  const rangeStart = side === "left" ? spread.start : spread.start + 10;
  const rangeEnd = side === "left" ? spread.start + 9 : spread.end;
  const pageLabel = side === "left" ? "Left page" : "Right page";
  return `
    <div class="page-title">
      <span>${escapeHtml(pageLabel)}</span>
      <strong>${escapeHtml(spread.title)}</strong>
      <small>${escapeHtml(spread.subtitle)} - ${rangeStart}-${rangeEnd}</small>
    </div>
  `;
}

function renderSpreadSlots(album, spread, offset) {
  const slots = [];
  const catalog = getStickerCatalog();

  for (let index = 0; index < 10; index += 1) {
    const number = spread.start + offset + index;
    const sticker = album.stickers[number];
    if (!sticker) continue;
    const meta = getStickerMeta(number);
    const position = getSlotPosition(index, 10);
    const ownedClass = getStickerCopyTotal(sticker) > 0 ? "placed" : "";
    const displayImage = getStickerCopyTotal(sticker) > 0 ? catalog[number] : "";
    const image = displayImage ? `<img src="${displayImage}" alt="${escapeHtml(meta.code)}" />` : "";
    slots.push(`
      <button
        class="catalogue-slot ${ownedClass}"
        type="button"
        data-page-sticker="${number}"
        style="left:${position.left}%; top:${position.top}%;"
        aria-label="${meta.code}, sticker ${number}, ${getStickerCopyTotal(sticker) > 0 ? "owned" : "missing"}"
      >
        ${image}
        <span>${escapeHtml(meta.code)}</span>
        <small>${number}</small>
      </button>
    `);
  }

  return slots.join("");
}

function getSlotPosition(index, total) {
  if (total === 10) {
    const column = index % 2;
    const row = Math.floor(index / 2);
    return {
      left: column === 0 ? 29 : 71,
      top: 27 + row * 15,
    };
  }
  const columns = total > 12 ? 5 : total > 6 ? 2 : 4;
  const rows = Math.ceil(total / columns);
  const column = index % columns;
  const row = Math.floor(index / columns);
  return {
    left: 8 + (column * 84) / Math.max(columns - 1, 1),
    top: 8 + (row * 84) / Math.max(rows - 1, 1),
  };
}

function cycleSticker(number) {
  const album = getActiveAlbum();
  const sticker = album.stickers[number];
  normalizeStickerVariants(sticker);
  sticker.variants.white += 1;
  syncStickerTotals(sticker);

  saveState();
  renderAlbum();
}

function openStickerDialog(number) {
  activeStickerNumber = number;
  const sticker = getActiveAlbum().stickers[number];
  const meta = getStickerMeta(number);
  if (els.stickerDialogTitle) els.stickerDialogTitle.textContent = `${meta.code} - Sticker #${number}`;
  renderStickerPreview(sticker);
  els.stickerDialog?.showModal();
}

function renderStickerPreview(sticker) {
  if (!els.stickerPreview) return;
  const displayImage = getStickerDisplayImage(sticker, activeStickerNumber);
  els.stickerPreview.innerHTML = displayImage
    ? `<img src="${displayImage}" alt="Sticker preview" />`
    : "<span>No admin image uploaded for this sticker yet</span>";
  normalizeStickerVariants(sticker);
  if (els.stickerDialogStatus) {
    const status = getStickerCopyTotal(sticker) > 0 ? "Owned" : "Missing";
    const marks = STICKER_VARIANTS
      .filter((variant) => sticker.variants[variant.id] > 0)
      .map((variant) => `${variant.label}: ${sticker.variants[variant.id]}`)
      .join(" | ");
    const duplicateTotal = getStickerDuplicateTotal(sticker);
    els.stickerDialogStatus.textContent = `${status} - ${duplicateTotal} duplicate${duplicateTotal === 1 ? "" : "s"}${marks ? ` - ${marks}` : ""}`;
  }
  const selectedCount = sticker.variants[getSelectedVariantId()] || 0;
  if (els.markStickerOwnedBtn) els.markStickerOwnedBtn.disabled = selectedCount > 0;
  if (els.addStickerDuplicateBtn) els.addStickerDuplicateBtn.disabled = getStickerCopyTotal(sticker) < 1;
  if (els.removeStickerDuplicateBtn) els.removeStickerDuplicateBtn.disabled = selectedCount < 1;
  if (els.clearStickerDuplicatesBtn) els.clearStickerDuplicatesBtn.disabled = getStickerDuplicateTotal(sticker) < 1;
  if (els.markStickerMissingBtn) els.markStickerMissingBtn.disabled = getStickerCopyTotal(sticker) < 1;
}

function refreshActiveStickerDialog() {
  if (!activeStickerNumber) return;
  renderStickerPreview(getActiveAlbum().stickers[activeStickerNumber]);
  renderAlbum();
}

function toggleCatalogueSticker(number) {
  const album = getActiveAlbum();
  const sticker = album.stickers[number];
  if (!sticker) return;
  normalizeStickerVariants(sticker);

  if (getStickerCopyTotal(sticker) > 0) {
    STICKER_VARIANTS.forEach((variant) => {
      sticker.variants[variant.id] = 0;
    });
  } else {
    sticker.variants.white = 1;
  }
  syncStickerTotals(sticker);

  saveState();
  renderAlbum();
}

function quickAdd(rawValue) {
  const album = getActiveAlbum();
  const numbers = rawValue
    .split(",")
    .map((item) => Number.parseInt(item.trim(), 10))
    .filter((number) => Number.isInteger(number) && number >= 1 && number <= album.size);

  if (!numbers.length) {
    els.quickAddHint.textContent = `Enter numbers from 1 to ${album.size}.`;
    return;
  }

  numbers.forEach((number) => {
    const sticker = album.stickers[number];
    normalizeStickerVariants(sticker);
    sticker.variants.white += 1;
    syncStickerTotals(sticker);
  });

  els.quickAddInput.value = "";
  els.quickAddHint.textContent = `Added ${numbers.length} sticker entry${numbers.length === 1 ? "" : "ies"}.`;
  saveState();
  renderAlbum();
}

function switchView(viewName) {
  const authOnlyViews = new Set(["album", "friends", "chat", "account"]);
  if (authOnlyViews.has(viewName) && !getSessionUser()) {
    viewName = "home";
  }
  document.querySelectorAll(".view").forEach((view) => view.classList.remove("active"));
  const target = document.querySelector(`#${viewName}View`);
  if (target) target.classList.add("active");
  els.navItems.forEach((item) => item.classList.toggle("active", item.dataset.view === viewName));

  const titles = {
    home: "Home",
    album: "Albums",
    friends: "Friends",
    chat: "Trade Chat",
    account: "Account",
  };
  els.viewTitle.textContent = titles[viewName] || "Home";
}

function renderPosts() {
  const posts = state.posts.filter((post) => activeFeedFilter === "global" || post.local);
  if (posts.length === 0) {
    els.postList.innerHTML =
      '<p class="form-status post-empty">No trade posts yet. Be the first to share what you need or have to trade.</p>';
    return;
  }
  els.postList.innerHTML = posts
    .map(
      (post) => `
        <article class="post-card">
          <div class="post-meta">
            <strong>${escapeHtml(post.author)}</strong>
            <span>-</span>
            <span>${escapeHtml(post.city)}</span>
          </div>
          <p>${escapeHtml(post.text)}</p>
          <div class="post-actions">
            <button type="button" data-like="${post.id}">Like - ${post.likes}</button>
            <button type="button">Comments - ${post.comments}</button>
          </div>
        </article>
      `,
    )
    .join("");
}

function addPost() {
  const user = getSessionUser();
  if (!user) return;
  const text = els.postInput.value.trim();
  if (!text) return;

  state.posts.unshift({
    id: crypto.randomUUID(),
    author: user.name,
    city: els.cityInput.value.trim() || "Local",
    text,
    likes: 0,
    comments: 0,
    local: true,
  });

  els.postInput.value = "";
  saveState();
  renderPosts();
}

function renderMessages() {
  const messageMarkup = state.messages
    .map((message) => {
      const className = message.from === "system" ? "message system" : `message ${message.from === "me" ? "me" : "them"}`;
      return `<article class="${className}">${message.html || escapeHtml(message.text)}</article>`;
    })
    .join("");
  const miniMarkup = state.messages
    .slice(-3)
    .map((message) => {
      const className = message.from === "system" ? "mini-message system" : `mini-message ${message.from === "me" ? "me" : "them"}`;
      const text = message.html ? "Trade match ready. Open chat to review." : escapeHtml(message.text);
      return `<article class="${className}">${text}</article>`;
    })
    .join("");

  els.messageList.innerHTML = messageMarkup;
  els.miniMessageList.innerHTML = miniMarkup;
  els.messageList.scrollTop = els.messageList.scrollHeight;
  els.miniMessageList.scrollTop = els.miniMessageList.scrollHeight;
  renderMessenger();
}

function compareInventories() {
  const album = getActiveAlbum();
  const canGive = [];
  const canReceive = [];

  for (let number = 1; number <= album.size; number += 1) {
    const mine = album.stickers[number];
    const anaOwns = anaInventory.owned.has(number);
    const anaDupes = anaInventory.duplicates.get(number) || 0;

    if (getStickerDuplicateTotal(mine) > 0 && !anaOwns) canGive.push(number);
    if (getStickerCopyTotal(mine) < 1 && anaDupes > 0) canReceive.push(number);
  }

  activeTrade = {
    give: canGive.slice(0, 8),
    receive: canReceive.slice(0, 8),
  };

  state.messages.push({
    id: crypto.randomUUID(),
    from: "system",
    html: `
      <strong>Trade match found</strong><br />
      You can give: ${activeTrade.give.length ? activeTrade.give.join(", ") : "No matching duplicates yet"}<br />
      They can give you: ${activeTrade.receive.length ? activeTrade.receive.join(", ") : "No matching missing stickers yet"}
    `,
  });

  els.confirmTradeBtn.disabled = !(activeTrade.give.length && activeTrade.receive.length);
  saveState();
  renderMessages();
}

function confirmTrade() {
  if (!activeTrade) return;
  const album = getActiveAlbum();

  activeTrade.give.forEach((number) => {
    const sticker = album.stickers[number];
    if (getStickerDuplicateTotal(sticker) > 0) {
      normalizeStickerVariants(sticker);
      const variant = STICKER_VARIANTS.find((item) => sticker.variants[item.id] > 1)
        || STICKER_VARIANTS.find((item) => sticker.variants[item.id] > 0);
      if (variant) sticker.variants[variant.id] = Math.max(0, sticker.variants[variant.id] - 1);
      syncStickerTotals(sticker);
    }
  });

  activeTrade.receive.forEach((number) => {
    const sticker = album.stickers[number];
    if (sticker) {
      normalizeStickerVariants(sticker);
      sticker.variants.white += 1;
      syncStickerTotals(sticker);
    }
  });

  state.messages.push({
    id: crypto.randomUUID(),
    from: "system",
    text: "Trade confirmed by both collectors. Your album inventory has been updated.",
  });

  activeTrade = null;
  els.confirmTradeBtn.disabled = true;
  saveState();
  renderAlbum();
  renderMessages();
}

function getAlbumCatalogList() {
  try {
    const parsed = JSON.parse(localStorage.getItem(ALBUM_CATALOG_KEY) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function seedAlbumCatalogIfEmpty() {
  const current = getAlbumCatalogList();
  if (current.length > 0) return;
  const seed = [
    {
      id: "world-cup-2026",
      name: "World Cup 2026",
      size: WORLD_CUP_SIZE,
      pageImages: ["", ""],
      template: "world-cup-2026",
      description: "Official 2026 FIFA World Cup sticker album.",
      createdAt: "2026-06-15T00:00:00.000Z",
    },
  ];
  localStorage.setItem(ALBUM_CATALOG_KEY, JSON.stringify(seed));
}

function renderAlbumPicker() {
  if (!els.albumCatalogPicker) return;
  const catalog = getAlbumCatalogList();
  const ownedTemplateIds = new Set(
    state.albums.map((album) => album.catalogId).filter(Boolean),
  );
  const ownedNames = new Set(state.albums.map((album) => album.name));

  if (els.albumPickerStatus) els.albumPickerStatus.textContent = "";

  if (catalog.length === 0) {
    els.albumCatalogPicker.innerHTML =
      '<p class="form-status">No albums available yet. Please check back later — the administrator publishes album collections.</p>';
    return;
  }

  els.albumCatalogPicker.innerHTML = catalog
    .map((album) => {
      const alreadyAdded = ownedTemplateIds.has(album.id) || ownedNames.has(album.name);
      return `
        <article class="album-catalog-card ${alreadyAdded ? "is-added" : ""}">
          <div>
            <strong>${escapeHtml(album.name)}</strong>
            <small>${album.size} stickers</small>
            ${album.description ? `<p class="form-status">${escapeHtml(album.description)}</p>` : ""}
          </div>
          <button type="button" data-add-album="${escapeHtml(album.id)}" ${alreadyAdded ? "disabled" : ""}>
            ${alreadyAdded ? "Added" : "Add"}
          </button>
        </article>
      `;
    })
    .join("");
}

function addAlbumFromCatalog(catalogId) {
  const catalog = getAlbumCatalogList();
  const template = catalog.find((item) => item.id === catalogId);
  if (!template) {
    if (els.albumPickerStatus) {
      els.albumPickerStatus.textContent = "Album no longer available.";
      els.albumPickerStatus.classList.add("error");
    }
    return;
  }
  const size = Math.max(1, Math.min(980, Number.parseInt(template.size, 10) || 980));
  const album = {
    id: crypto.randomUUID(),
    catalogId: template.id,
    name: template.name,
    size,
    pageImages: Array.isArray(template.pageImages) ? [...template.pageImages] : ["", ""],
    template: template.template || "custom",
    stickers: seedStickers(size, []),
  };

  state.albums.push(album);
  activeAlbumId = album.id;
  saveState();
  renderAlbumOptions();
  renderAlbum();
  if (els.albumPickerStatus) {
    els.albumPickerStatus.classList.remove("error");
    els.albumPickerStatus.textContent = `"${template.name}" added to your collection.`;
  }
  renderAlbumPicker();
  els.albumDialog.close();
  switchView("album");
}

function renderFriends() {
  els.friendList.innerHTML = state.friends.length
    ? state.friends
        .map(
          (friend) => `
            <article class="friend-card">
              <span class="avatar small">${escapeHtml(friend.initials)}</span>
              <div>
                <strong>${escapeHtml(friend.name)}</strong>
                <small>${escapeHtml(friend.city)} - ${escapeHtml(friend.status)} - ${friend.trades} trade${friend.trades === 1 ? "" : "s"}</small>
              </div>
              <button type="button" data-chat-friend="${friend.id}">Message</button>
            </article>
          `,
        )
        .join("")
    : '<p class="form-status">No friends yet. Add collectors from the suggestions on the right.</p>';

  els.suggestionList.innerHTML = state.suggestions.length
    ? state.suggestions
        .map(
          (person) => `
            <article class="friend-card">
              <span class="avatar small">${escapeHtml(person.initials)}</span>
              <div>
                <strong>${escapeHtml(person.name)}</strong>
                <small>${escapeHtml(person.city)} - ${escapeHtml(person.reason)}</small>
              </div>
              <button type="button" data-add-friend="${person.id}">Add</button>
            </article>
          `,
        )
        .join("")
    : '<p class="form-status">No suggestions available yet.</p>';
  renderMessengerContacts();
}

function getActiveChatPerson() {
  return state.friends.find((friend) => friend.id === activeChatPersonId) || state.friends[0];
}

function renderMessengerContacts() {
  const contacts = [...state.friends, ...state.suggestions.slice(0, 3)];
  els.messengerContactList.innerHTML = contacts
    .map(
      (person) => `
        <button class="messenger-contact ${person.id === activeChatPersonId ? "active" : ""}" type="button" data-open-chat="${person.id}">
          <span class="avatar small">${escapeHtml(person.initials)}</span>
          <span>
            <strong>${escapeHtml(person.name)}</strong>
            <small>${escapeHtml(person.city)} - ${person.status || "Suggested"}</small>
          </span>
        </button>
      `,
    )
    .join("");
}

function renderMessenger() {
  const person = getActiveChatPerson();
  const hasContacts = state.friends.length > 0 || state.suggestions.length > 0;
  if (els.messengerDock && getSessionUser()) {
    els.messengerDock.hidden = !hasContacts;
  }
  if (!person) return;

  els.messengerDock.classList.toggle("open", isMessengerOpen);
  els.messengerAvatar.textContent = person.initials;
  els.messengerFabInitials.textContent = person.initials;
  els.messengerName.textContent = person.name;
  els.messengerStatus.textContent = `Online - ${person.city}`;

  els.messengerMessages.innerHTML = state.messages
    .slice(-6)
    .map((message) => {
      const className = message.from === "system" ? "messenger-message system" : `messenger-message ${message.from === "me" ? "me" : "them"}`;
      const text = message.html ? "Trade match ready. Open the full chat to confirm." : escapeHtml(message.text);
      return `<article class="${className}">${text}</article>`;
    })
    .join("");
  els.messengerMessages.scrollTop = els.messengerMessages.scrollHeight;
  renderMessengerContacts();
}

function openMessenger(personId) {
  if (personId) {
    activeChatPersonId = personId;
  }
  isMessengerOpen = true;
  renderMessenger();
}

function closeMessenger() {
  isMessengerOpen = false;
  renderMessenger();
}

function addFriend(id) {
  const person = state.suggestions.find((suggestion) => suggestion.id === id);
  if (!person) return;

  state.suggestions = state.suggestions.filter((suggestion) => suggestion.id !== id);
  state.friends.push({
    id: person.id,
    name: person.name,
    city: person.city,
    initials: person.initials,
    status: "Friend",
    trades: 0,
  });
  activeChatPersonId = person.id;
  state.posts.unshift({
    id: crypto.randomUUID(),
    author: "StickerSwap",
    city: person.city,
    text: `You added ${person.name}. Start a chat to compare albums and find a trade.`,
    likes: 0,
    comments: 0,
    local: person.city === "Montreal",
  });

  saveState();
  renderFriends();
  renderPosts();
  openMessenger(person.id);
}

function sendChatMessage(text) {
  const cleaned = text.trim();
  if (!cleaned) return;
  state.messages.push({ id: crypto.randomUUID(), from: "me", text: cleaned });
  saveState();
  renderMessages();
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

document.querySelectorAll("[data-view]").forEach((item) => {
  item.addEventListener("click", () => switchView(item.dataset.view));
});

els.jumpButtons.forEach((button) => {
  button.addEventListener("click", () => switchView(button.dataset.jumpView));
});

els.albumSelect.addEventListener("change", (event) => {
  activeAlbumId = event.target.value;
  renderAlbum();
});

els.stickerGrid.addEventListener("click", (event) => {
  const cell = event.target.closest("[data-sticker]");
  if (!cell) return;
  openStickerDialog(Number.parseInt(cell.dataset.sticker, 10));
});

els.markStickerOwnedBtn?.addEventListener("click", () => {
  if (!activeStickerNumber) return;
  const sticker = getActiveAlbum().stickers[activeStickerNumber];
  normalizeStickerVariants(sticker);
  sticker.variants[getSelectedVariantId()] = Math.max(1, sticker.variants[getSelectedVariantId()] || 0);
  syncStickerTotals(sticker);
  saveState();
  refreshActiveStickerDialog();
});

els.addStickerDuplicateBtn?.addEventListener("click", () => {
  if (!activeStickerNumber) return;
  const sticker = getActiveAlbum().stickers[activeStickerNumber];
  normalizeStickerVariants(sticker);
  sticker.variants[getSelectedVariantId()] += 1;
  syncStickerTotals(sticker);
  saveState();
  refreshActiveStickerDialog();
});

els.removeStickerDuplicateBtn?.addEventListener("click", () => {
  if (!activeStickerNumber) return;
  const sticker = getActiveAlbum().stickers[activeStickerNumber];
  normalizeStickerVariants(sticker);
  const variantId = getSelectedVariantId();
  sticker.variants[variantId] = Math.max(0, sticker.variants[variantId] - 1);
  syncStickerTotals(sticker);
  saveState();
  refreshActiveStickerDialog();
});

els.clearStickerDuplicatesBtn?.addEventListener("click", () => {
  if (!activeStickerNumber) return;
  const sticker = getActiveAlbum().stickers[activeStickerNumber];
  normalizeStickerVariants(sticker);
  let keptOne = false;
  STICKER_VARIANTS.forEach((variant) => {
    if (!keptOne && sticker.variants[variant.id] > 0) {
      sticker.variants[variant.id] = 1;
      keptOne = true;
    } else {
      sticker.variants[variant.id] = 0;
    }
  });
  syncStickerTotals(sticker);
  saveState();
  refreshActiveStickerDialog();
});

els.markStickerMissingBtn?.addEventListener("click", () => {
  if (!activeStickerNumber) return;
  const sticker = getActiveAlbum().stickers[activeStickerNumber];
  normalizeStickerVariants(sticker);
  STICKER_VARIANTS.forEach((variant) => {
    sticker.variants[variant.id] = 0;
  });
  syncStickerTotals(sticker);
  saveState();
  refreshActiveStickerDialog();
});

els.closeStickerDialogBtn?.addEventListener("click", () => {
  els.stickerDialog?.close();
});

els.stickerSearch.addEventListener("input", () => {
  renderStickerGrid();
  renderStickerSearchResults();
});

els.stickerSearch.addEventListener("keydown", (event) => {
  if (event.key !== "Enter") return;
  const first = getStickerSearchMatches(els.stickerSearch.value, 1)[0];
  if (!first) return;
  event.preventDefault();
  focusStickerFromSearch(first.number);
});

els.stickerSearchResults?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-search-sticker]");
  if (!button) return;
  focusStickerFromSearch(Number.parseInt(button.dataset.searchSticker, 10));
});

document.addEventListener("click", (event) => {
  if (!event.target.closest(".sticker-search-box")) {
    if (els.stickerSearchResults) els.stickerSearchResults.hidden = true;
  }
});
els.stickerVariantSelect?.addEventListener("change", refreshActiveStickerDialog);
els.spreadSelect?.addEventListener("change", (event) => {
  turnSpreadTo(Number.parseInt(event.target.value, 10) || 0, true);
});
els.prevSpreadBtn?.addEventListener("click", () => turnSpreadTo(activeSpreadIndex - 1, true));
els.nextSpreadBtn?.addEventListener("click", () => turnSpreadTo(activeSpreadIndex + 1, true));
els.albumViewButtons.forEach((button) => {
  button.addEventListener("click", () => {
    activeAlbumView = button.dataset.albumView;
    els.albumViewButtons.forEach((item) => item.classList.toggle("active", item === button));
    renderAlbum();
  });
});
els.catalogueView.addEventListener("click", (event) => {
  const slot = event.target.closest("[data-page-sticker]");
  if (!slot) return;
  openStickerDialog(Number.parseInt(slot.dataset.pageSticker, 10));
});
els.quickAddForm.addEventListener("submit", (event) => {
  event.preventDefault();
  quickAdd(els.quickAddInput.value);
});

els.newAlbumBtn.addEventListener("click", () => {
  renderAlbumPicker();
  els.albumDialog.showModal();
});
els.cancelAlbumBtn.addEventListener("click", () => els.albumDialog.close());
els.albumForm.addEventListener("submit", (event) => event.preventDefault());
els.albumCatalogPicker?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-add-album]");
  if (!button || button.disabled) return;
  addAlbumFromCatalog(button.dataset.addAlbum);
});

els.postBtn.addEventListener("click", addPost);
els.postList.addEventListener("click", (event) => {
  const likeButton = event.target.closest("[data-like]");
  if (!likeButton) return;
  if (!getSessionUser()) return;
  const post = state.posts.find((item) => item.id === likeButton.dataset.like);
  if (!post) return;
  post.likes += 1;
  saveState();
  renderPosts();
});

els.feedFilters.forEach((button) => {
  button.addEventListener("click", () => {
    activeFeedFilter = button.dataset.feedFilter;
    els.feedFilters.forEach((item) => item.classList.toggle("active", item === button));
    renderPosts();
  });
});

els.compareBtn.addEventListener("click", compareInventories);
els.confirmTradeBtn.addEventListener("click", confirmTrade);
els.chatForm.addEventListener("submit", (event) => {
  event.preventDefault();
  sendChatMessage(els.chatInput.value);
  els.chatInput.value = "";
});

els.miniChatForm.addEventListener("submit", (event) => {
  event.preventDefault();
  sendChatMessage(els.miniChatInput.value);
  els.miniChatInput.value = "";
});

els.friendList.addEventListener("click", (event) => {
  const chatButton = event.target.closest("[data-chat-friend]");
  if (!chatButton) return;
  openMessenger(chatButton.dataset.chatFriend);
});

els.suggestionList.addEventListener("click", (event) => {
  const addButton = event.target.closest("[data-add-friend]");
  if (!addButton) return;
  addFriend(addButton.dataset.addFriend);
});

els.messengerContactList.addEventListener("click", (event) => {
  const contact = event.target.closest("[data-open-chat]");
  if (!contact) return;
  const suggestion = state.suggestions.find((person) => person.id === contact.dataset.openChat);
  if (suggestion) {
    addFriend(suggestion.id);
    return;
  }
  openMessenger(contact.dataset.openChat);
});

els.messengerFab.addEventListener("click", () => {
  isMessengerOpen = !isMessengerOpen;
  renderMessenger();
});

els.messengerCloseBtn.addEventListener("click", closeMessenger);
els.messengerPersonBtn.addEventListener("click", () => switchView("chat"));
els.messengerForm.addEventListener("submit", (event) => {
  event.preventDefault();
  sendChatMessage(els.messengerInput.value);
  els.messengerInput.value = "";
  openMessenger(activeChatPersonId);
});

els.logoutBtn?.addEventListener("click", () => {
  localStorage.removeItem(SESSION_KEY);
  updateAuthUI();
});

els.saveAccountBtn?.addEventListener("click", saveAccountProfile);

updateAuthUI();
renderAlbumOptions();
renderSpreadOptions();
renderAlbum();
renderPosts();
renderMessages();
renderFriends();
renderMessenger();
