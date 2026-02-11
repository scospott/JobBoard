/* =========================
   AUTH HELPERS
========================= */
function getToken() {
  return localStorage.getItem("token");
}
function getUser() {
  const raw = localStorage.getItem("user");
  return raw ? JSON.parse(raw) : null;
}
function clearAuth() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}

/* =========================
   API
========================= */
async function fetchAds() {
  const res = await fetch("/api/advertisements?limit=50&page=1");
  if (!res.ok) throw new Error("Impossible de charger les annonces");
  return res.json();
}

async function fetchAdById(id) {
  const res = await fetch(`/api/advertisements/${id}`);
  if (!res.ok) throw new Error("Annonce introuvable");
  return res.json();
}

function formatSalary(val) {
  if (val === null || val === undefined || val === "") return null;
  const n = Number(val);
  if (Number.isNaN(n)) return String(val);
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);
}

/* =========================
   RENDER
========================= */
let allAds = [];
let filteredAds = [];
let selectedId = null;

function cardTemplate(ad) {
  const company = ad.Company?.name || "Entreprise";
  const location = ad.location || "Lieu n/a";
  const salary = formatSalary(ad.salary);

  return `
    <article class="card" data-id="${ad.id}" role="button" tabindex="0" aria-label="Voir détail de l'annonce ${ad.title}">
      <div class="card-top">
        <span class="tag" title="${company} • ${location}">${company} • ${location}</span>
        ${salary ? `<span class="money">${salary}</span>` : ``}
      </div>
      <h3>${ad.title}</h3>
      <p>${ad.short_description}</p>
      <div class="card-actions">
        <button class="secondary quick-apply" type="button">Postuler</button>
        <button class="ghost quick-details" type="button">Détails</button>
      </div>
    </article>
  `;
}

function renderList(list) {
  const jobsEl = document.getElementById("jobs");
  const empty = document.getElementById("emptyState");
  const countPill = document.getElementById("countPill");

  if (!list.length) {
    jobsEl.innerHTML = "";
    empty.hidden = false;
    countPill.textContent = "0 annonce";
    return;
  }
  empty.hidden = true;
  jobsEl.innerHTML = list.map(cardTemplate).join("");
  countPill.textContent = `${list.length} annonce${list.length > 1 ? "s" : ""}`;

  // mark selected
  if (selectedId) {
    const selected = jobsEl.querySelector(`.card[data-id="${selectedId}"]`);
    if (selected) selected.classList.add("selected");
  }
}

function applyAutofill(form) {
  const token = getToken();
  const user = getUser();

  const rowName = document.getElementById("rowName");
  const rowEmail = document.getElementById("rowEmail");
  const rowPhone = document.getElementById("rowPhone");

  if (token && user) {
    form.name.value = user.name || "";
    form.email.value = user.email || "";
    form.phone.value = user.phone || "";

    rowName.hidden = true;
    rowEmail.hidden = true;
    rowPhone.hidden = true;
  } else {
    rowName.hidden = false;
    rowEmail.hidden = false;
    rowPhone.hidden = false;
  }
}

/* =========================
   PANEL
========================= */
function showPanelLoading() {
  document.getElementById("panelPlaceholder").hidden = true;
  document.getElementById("panelContent").hidden = false;

  document.getElementById("panelKicker").textContent = "Chargement…";
  document.getElementById("panelTitle").textContent = "—";
  document.getElementById("panelDesc").textContent = "";
  document.getElementById("panelChips").innerHTML = "";
  const status = document.getElementById("panelStatus");
  status.hidden = true;
}

function closePanel() {
  selectedId = null;
  document.getElementById("panelContent").hidden = true;
  document.getElementById("panelPlaceholder").hidden = false;

  // unselect cards
  document.querySelectorAll(".card.selected").forEach((c) => c.classList.remove("selected"));
}

function fillPanel(ad) {
  const company = ad.Company?.name || "Entreprise";
  const location = ad.location || "n/a";
  const salary = formatSalary(ad.salary) || "n/a";
  const working = ad.working_time || "n/a";

  document.getElementById("panelKicker").textContent = `${company} • ${location}`;
  document.getElementById("panelTitle").textContent = ad.title;
  document.getElementById("panelDesc").textContent = ad.full_description;

  const chips = [
    { label: "Salaire", value: salary },
    { label: "Lieu", value: location },
    { label: "Temps", value: working },
  ];

  document.getElementById("panelChips").innerHTML = chips
    .map((c) => `<span class="chip"><strong>${c.label}:</strong> ${c.value}</span>`)
    .join("");

  // prepare form
  const form = document.getElementById("panelApplyForm");
  form.dataset.advertisementId = String(ad.id);
  applyAutofill(form);

  const status = document.getElementById("panelStatus");
  status.hidden = true;
}

/* =========================
   AUTH UI
========================= */
function renderAuthUI() {
  const authActions = document.getElementById("authActions");
  const token = getToken();
  const user = getUser();

  // pas connecté -> rien à droite (les liens sont à gauche)
  if (!token || !user) {
    authActions.innerHTML = ``;
    return;
  }

  authActions.innerHTML = `
    ${user.role === "admin" ? `<a class="btnlink" href="/admin.html">Admin</a>` : ""}
    <span style="color: rgba(255,255,255,0.70); font-size:12px;">${user.email || ""}</span>
    <button class="secondary" id="logoutBtn" type="button">Logout</button>
  `;

  document.getElementById("logoutBtn").addEventListener("click", () => {
    clearAuth();
    window.location.reload();
  });
}

function hideAuthLinksIfConnected() {
  const token = localStorage.getItem("token");
  const user = localStorage.getItem("user");

  const loginLink = document.getElementById("navLogin");
  const registerLink = document.getElementById("navRegister");

  if (token && user) {
    if (loginLink) loginLink.style.display = "none";
    if (registerLink) registerLink.style.display = "none";
  } else {
    // si pas connecté, on les affiche
    if (loginLink) loginLink.style.display = "";
    if (registerLink) registerLink.style.display = "";
  }
}


/* =========================
   SEARCH
========================= */
function filterAds(query) {
  const q = query.trim().toLowerCase();
  if (!q) return allAds;

  return allAds.filter((ad) => {
    const company = ad.Company?.name || "";
    const haystack = `${ad.title} ${ad.short_description} ${ad.location || ""} ${company}`.toLowerCase();
    return haystack.includes(q);
  });
}

/* =========================
   INIT
========================= */
async function init() {
  renderAuthUI();               // gère la zone droite (email/logout)
hideAuthLinksIfConnected();   // gère la sidebar gauche (login/register)


  const jobsWrap = document.getElementById("jobs");
  const searchInput = document.getElementById("searchInput");

  document.getElementById("closePanelBtn").addEventListener("click", closePanel);
  document.getElementById("clearMsgBtn").addEventListener("click", () => {
    document.getElementById("panelApplyForm").message.value = "";
  });

  // Load list
  jobsWrap.innerHTML = `<div style="padding:14px; color: rgba(255,255,255,0.7);">Chargement…</div>`;
  try {
    const payload = await fetchAds();
    allAds = payload.data || [];
    filteredAds = allAds;
    renderList(filteredAds);
  } catch (e) {
    jobsWrap.innerHTML = `<div style="padding:14px; color: rgba(255,255,255,0.7);">Erreur : ${e.message}</div>`;
    return;
  }

  // Search
  searchInput.addEventListener("input", () => {
    filteredAds = filterAds(searchInput.value);
    renderList(filteredAds);
    closePanel();
  });

  // Card click -> load detail into panel
  async function selectAd(id) {
    selectedId = id;

    // UI highlight
    document.querySelectorAll(".card.selected").forEach((c) => c.classList.remove("selected"));
    const card = document.querySelector(`.card[data-id="${id}"]`);
    if (card) card.classList.add("selected");

    showPanelLoading();
    try {
      const payload = await fetchAdById(id);
      fillPanel(payload.data);
    } catch (err) {
      const status = document.getElementById("panelStatus");
      status.textContent = `❌ ${err.message}`;
      status.hidden = false;
    }
  }

  jobsWrap.addEventListener("click", async (e) => {
    const card = e.target.closest(".card");
    if (!card) return;
    const id = Number(card.dataset.id);

    if (e.target.classList.contains("quick-apply") || e.target.classList.contains("quick-details")) {
      await selectAd(id);
      // scroll panel into view on mobile
      document.querySelector(".panel").scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    // click anywhere on card
    await selectAd(id);
    document.querySelector(".panel").scrollIntoView({ behavior: "smooth", block: "start" });
  });

  // Keyboard accessibility: Enter selects
  jobsWrap.addEventListener("keydown", async (e) => {
    if (e.key !== "Enter") return;
    const card = e.target.closest(".card");
    if (!card) return;
    const id = Number(card.dataset.id);
    await selectAd(id);
  });

  // Submit apply from panel
  document.getElementById("panelApplyForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const form = e.target;
    const advertisement_id = Number(form.dataset.advertisementId);
    const statusEl = document.getElementById("panelStatus");
    statusEl.hidden = true;

    const token = getToken();

    const payload = {
      advertisement_id,
      name: form.name.value.trim(),
      email: form.email.value.trim(),
      phone: form.phone.value.trim() || null,
      message: form.message.value.trim(),
    };

    const headers = { "Content-Type": "application/json" };
    if (token) {
      headers.Authorization = `Bearer ${token}`;
      delete payload.name;
      delete payload.email;
      delete payload.phone;
    }

    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg =
          data?.error ||
          (data?.errors ? data.errors.map((x) => x.msg).join(", ") : "Erreur");
        throw new Error(msg);
      }

      statusEl.textContent = "✅ Candidature envoyée !";
      statusEl.hidden = false;
      form.message.value = "";
    } catch (err) {
      statusEl.textContent = `❌ ${err.message}`;
      statusEl.hidden = false;
    }
  });
}

init();
