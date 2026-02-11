function getToken() { return localStorage.getItem("token"); }
function getUser() {
  const raw = localStorage.getItem("user");
  return raw ? JSON.parse(raw) : null;
}
function clearAuth() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}

const state = { tab: "advertisements", page: 1, limit: 10, rows: [], filtered: [] };

function headers() {
  const token = getToken();
  return { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
}

function setActiveTab(tab) {
  state.tab = tab;
  state.page = 1;
  state.rows = [];
  state.filtered = [];

  document.querySelectorAll(".nav-item[data-tab]").forEach((b) => b.classList.remove("active"));
  const btn = document.querySelector(`.nav-item[data-tab="${tab}"]`);
  if (btn) btn.classList.add("active");
}

async function fetchAdminList(tab, page, limit) {
  const res = await fetch(`/api/admin/${tab}?page=${page}&limit=${limit}`, { headers: headers() });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Admin API error");
  return data;
}

async function upsertRow(tab, payload, id = null) {
  const method = id ? "PUT" : "POST";
  const url = id ? `/api/admin/${tab}/${id}` : `/api/admin/${tab}`;

  const res = await fetch(url, {
    method,
    headers: headers(),
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Save failed");
  return data.data;
}

async function deleteRow(tab, id) {
  const res = await fetch(`/api/admin/${tab}/${id}`, { method: "DELETE", headers: headers() });
  if (res.status === 204) return;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Delete failed");
}

function escapeHtml(s) {
  return String(s ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

/* =======================
   FORM SCHEMA
======================= */
const FORM_FIELDS = {
  companies: [
    { type: "input", label: "Nom", name: "name" },
    { type: "input", label: "Email", name: "email" },
    { type: "input", label: "Localisation", name: "location" },
  ],
  advertisements: [
    { type: "input", label: "Company ID", name: "company_id" },
    { type: "input", label: "Titre", name: "title" },
    { type: "textarea", label: "Description courte", name: "short_description" },
    { type: "textarea", label: "Description complète", name: "full_description" },
    { type: "input", label: "Salaire", name: "salary" },
    { type: "input", label: "Lieu", name: "location" },
    { type: "input", label: "Temps de travail", name: "working_time" },
  ],
  // People/Applications: on laisse en lecture + delete/update via API si besoin
};

function input(label, name, value = "") {
  return `
    <div class="row">
      <label>${label}</label>
      <input name="${name}" value="${escapeHtml(value ?? "")}" />
    </div>
  `;
}
function textarea(label, name, value = "") {
  return `
    <div class="row">
      <label>${label}</label>
      <textarea name="${name}" rows="3">${escapeHtml(value ?? "")}</textarea>
    </div>
  `;
}

function renderForm(row = null) {
  const wrap = document.getElementById("formWrap");
  const fields = FORM_FIELDS[state.tab];

  if (!fields) {
    wrap.innerHTML = `
      <div style="color: rgba(255,255,255,.7); line-height: 1.6;">
        <div style="font-weight:900;">Formulaire indisponible</div>
        <div style="margin-top:6px;">Pour <strong>${state.tab}</strong> : lecture + suppression suffisent pour Step07.</div>
        <div style="margin-top:6px;">(On peut ajouter un formulaire aussi si tu veux.)</div>
      </div>
    `;
    return;
  }

  const isEdit = Boolean(row);
  const inputs = fields.map((f) => {
    const value = row ? row[f.name] : "";
    return f.type === "textarea" ? textarea(f.label, f.name, value) : input(f.label, f.name, value);
  }).join("");

  wrap.innerHTML = `
    <form id="adminForm">
      <div style="display:flex; justify-content:space-between; gap:10px; align-items:center; flex-wrap:wrap;">
        <div style="font-weight:900; font-size:16px;">
          ${isEdit ? "Modifier" : "Créer"} ${state.tab}
        </div>
        ${isEdit ? `<div style="color: rgba(255,255,255,.65); font-size:12px;">id=${row.id}</div>` : ""}
      </div>

      ${inputs}

      <div class="actions" style="margin-top:12px;">
        <button class="primary" type="submit">${isEdit ? "Mettre à jour" : "Créer"}</button>
        ${isEdit ? `<button class="secondary" id="cancelEdit" type="button">Annuler</button>` : ""}
      </div>

      <div class="status" id="formStatus" hidden></div>
    </form>
  `;

  const form = document.getElementById("adminForm");
  form.onsubmit = (e) => submitForm(e, row?.id);

  if (isEdit) {
    document.getElementById("cancelEdit").onclick = () => renderForm();
  }
}

async function submitForm(e, id = null) {
  e.preventDefault();
  const form = e.target;
  const status = document.getElementById("formStatus");
  status.hidden = true;

  const payload = {};
  new FormData(form).forEach((v, k) => {
    payload[k] = v === "" ? null : v;
  });

  try {
    await upsertRow(state.tab, payload, id);
    status.textContent = "✅ Enregistré";
    status.hidden = false;

    renderForm();
    await load();
  } catch (err) {
    status.textContent = "❌ " + err.message;
    status.hidden = false;
  }
}

/* =======================
   TABLE RENDER
======================= */
function renderToolbar(pagination) {
  const el = document.getElementById("toolbar");
  el.innerHTML = `
    <div style="display:flex; justify-content:space-between; gap:12px; flex-wrap:wrap; align-items:center;">
      <div>
        <div style="font-weight:900; font-size:16px;">Table: ${state.tab}</div>
        <div style="color: rgba(255,255,255,0.7); font-size:12px;">
          page ${pagination.page} / ${pagination.pages} — total ${pagination.total}
        </div>
      </div>
      <div style="display:flex; gap:10px; align-items:center; flex-wrap:wrap;">
        <button class="secondary" id="prevBtn" type="button">← Prev</button>
        <button class="secondary" id="nextBtn" type="button">Next →</button>
      </div>
    </div>
  `;

  document.getElementById("prevBtn").onclick = () => {
    if (state.page > 1) { state.page--; load(); }
  };
  document.getElementById("nextBtn").onclick = () => {
    if (pagination.page < pagination.pages) { state.page++; load(); }
  };
}

function renderTable(rows) {
  const wrap = document.getElementById("tableWrap");
  if (!rows.length) {
    wrap.innerHTML = `<div style="color: rgba(255,255,255,0.7);">Aucun enregistrement.</div>`;
    return;
  }

  const keys = Object.keys(rows[0])
    .filter((k) => typeof rows[0][k] !== "object")
    .slice(0, 7);

  const header = keys.map((k) => `<th style="text-align:left; padding:10px; border-bottom:1px solid rgba(255,255,255,0.12);">${k}</th>`).join("");

  const body = rows.map((r) => {
    const cells = keys.map((k) => `<td style="padding:10px; border-bottom:1px solid rgba(255,255,255,0.08); color: rgba(255,255,255,0.85);">${escapeHtml(r[k])}</td>`).join("");

    return `
      <tr>
        ${cells}
        <td style="padding:10px; border-bottom:1px solid rgba(255,255,255,0.08);">
          ${FORM_FIELDS[state.tab] ? `<button class="ghost edit" data-id="${r.id}" type="button">Edit</button>` : ""}
          <button class="ghost del" data-id="${r.id}" type="button">Delete</button>
        </td>
      </tr>
    `;
  }).join("");

  wrap.innerHTML = `
    <div style="overflow:auto;">
      <table style="width:100%; border-collapse:collapse; font-size:13px;">
        <thead>
          <tr>
            ${header}
            <th style="text-align:left; padding:10px; border-bottom:1px solid rgba(255,255,255,0.12);">actions</th>
          </tr>
        </thead>
        <tbody>${body}</tbody>
      </table>
    </div>
  `;

  wrap.querySelectorAll(".del").forEach((btn) => {
    btn.onclick = async () => {
      const id = btn.dataset.id;
      if (!confirm(`Supprimer id=${id} ?`)) return;
      try {
        await deleteRow(state.tab, id);
        await load();
      } catch (e) {
        alert(e.message);
      }
    };
  });

  wrap.querySelectorAll(".edit").forEach((btn) => {
    btn.onclick = () => {
      const id = btn.dataset.id;
      const row = state.rows.find((x) => String(x.id) === id);
      if (row) renderForm(row);
    };
  });
}

/* =======================
   SEARCH (client-side)
======================= */
function filterRows(q) {
  const query = q.trim().toLowerCase();
  if (!query) return state.rows;

  return state.rows.filter((r) => {
    const flat = Object.entries(r)
      .filter(([_, v]) => typeof v !== "object")
      .map(([_, v]) => String(v ?? ""))
      .join(" ")
      .toLowerCase();
    return flat.includes(query);
  });
}

/* =======================
   LOAD
======================= */
async function load() {
  const token = getToken();
  const user = getUser();

  if (!token || !user) {
    window.location.href = "/login.html";
    return;
  }
  if (user.role !== "admin") {
    alert("Accès interdit (admin uniquement).");
    window.location.href = "/";
    return;
  }

  document.getElementById("adminInfo").textContent = `Admin: ${user.email}`;

  const payload = await fetchAdminList(state.tab, state.page, state.limit);
  state.rows = payload.data;

  // search filter
  const search = document.getElementById("adminSearch").value || "";
  state.filtered = filterRows(search);

  renderToolbar(payload.pagination);
  renderForm();           // create by default
  renderTable(state.filtered);
}

function init() {
  document.getElementById("logoutBtn").addEventListener("click", () => {
    clearAuth();
    window.location.href = "/login.html";
  });

  document.querySelectorAll(".nav-item[data-tab]").forEach((btn) => {
    btn.addEventListener("click", () => {
      setActiveTab(btn.dataset.tab);
      load();
    });
  });

  document.getElementById("adminSearch").addEventListener("input", () => load());

  load();
}

init();
