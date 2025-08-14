
const DATA_URL = "data/charities.json";
const PAGE_SIZE = 24;

// Try inline seed first, fall back to fetch
async function loadData(){
  if (window.SEED_DATA && Array.isArray(window.SEED_DATA) && window.SEED_DATA.length) {
    return window.SEED_DATA;
  }
  try {
    const r = await fetch(DATA_URL, {cache: 'no-store'});
    if (!r.ok) throw new Error(r.status);
    return await r.json();
  } catch (e) {
    console.error('Failed to load data', e);
    return [];
  }
}

function qs(s, el=document){ return el.querySelector(s); }
function qsa(s, el=document){ return Array.from(el.querySelectorAll(s)); }
function fromSlug(s){ try { return decodeURIComponent(s) } catch { return s } }

function renderFeatured(el, items){
  el.innerHTML = "";
  items.forEach(c => {
    const a = document.createElement("a");
    a.href = c.website; a.target = "_blank"; a.rel = "noopener"; a.className = "card";
    a.innerHTML = `<img src="${c.image}" alt="${c.name} logo" onerror="this.src='assets/logo.svg'"><div class="name">${c.name}</div>`;
    el.appendChild(a);
  });
}

function mountIndex(){
  const f = qs("#globalSearch"), i = qs("#searchInput");
  f.addEventListener("submit", e => {
    e.preventDefault();
    if (!i.value.trim()) return;
    location.href = `category.html?category=${encodeURIComponent('Browse All')}&search=${encodeURIComponent(i.value.trim())}`;
  });
  loadData().then(all => {
    const popular = all.slice(0, 12);
    renderFeatured(qs("#feat1"), popular);
  });
}

function mountCategory(){
  const params = new URLSearchParams(location.search);
  const category = fromSlug(params.get("category") || "Browse All");
  qs("#catTitle").textContent = category;
  const preSearch = fromSlug(params.get("search") || "");

  let all = [], view = [];
  function apply(){
    const term = (qs("#q").value || "").toLowerCase().trim();
    const size = qs("#size").value;
    const verified = qs("#ver").checked;
    const loc = (qs("#loc").value || "").toLowerCase().trim();
    view = all.filter(c => {
      const inCat = category === "Browse All" || c.category === category;
      const inTerm = !term || (c.name + " " + (c.blurb||"")).toLowerCase().includes(term);
      const inSize = !size || (c.size||"").toLowerCase() === size.toLowerCase();
      const inVer  = !verified || !!c.verified;
      const inLoc  = !loc || (c.location||"").toLowerCase().includes(loc);
      return inCat && inTerm && inSize && inVer && inLoc;
    });
    render(1);
  }
  function render(page){
    const list = qs("#results"); list.innerHTML = "";
    const start = (page-1) * PAGE_SIZE; const items = view.slice(start, start + PAGE_SIZE);
    items.forEach(c => {
      const div = document.createElement("div"); div.className = "item";
      div.innerHTML = `
        <img class="thumb" src="${c.image}" alt="${c.name} logo" onerror="this.src='assets/logo.svg'">
        <div style="flex:1">
          <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;">
            <h3 style="margin:0">${c.name}</h3>
            <div class="rating"><img src="assets/star.svg" aria-hidden="true"/> 4.8</div>
          </div>
          <div class="meta">${c.category} · ${c.location || "—"} · ${c.size}</div>
          <p style="margin:.4rem 0 0">${c.blurb || ""}</p>
          <div class="actions">
            <a class="btn primary" href="${c.website}" target="_blank" rel="noopener">Donate / Official Site</a>
            <a class="btn" href="${c.website}" target="_blank" rel="noopener">Learn More</a>
          </div>
        </div>`;
      list.appendChild(div);
    });
    qs("#count").textContent = `${view.length}`;
    const pag = qs("#pag"); pag.innerHTML = "";
    const pages = Math.max(1, Math.ceil(view.length / PAGE_SIZE));
    for (let p=1; p<=pages; p++){
      const b=document.createElement("button"); b.className="btn"; b.textContent=p;
      if (p===page){ b.style.background="var(--primary)"; b.style.color="#fff"; }
      b.addEventListener("click", ()=>render(p));
      pag.appendChild(b);
    }
  }

  loadData().then(d => {
    all = d;
    qs("#q").value = preSearch;
    apply();
  });
  qsa("input,select").forEach(el => el.addEventListener("input", apply));
  qs("#searchForm").addEventListener("submit", e => { e.preventDefault(); apply(); });
}

document.addEventListener("DOMContentLoaded", () => {
  const page = document.body.dataset.page;
  if (page === "index") mountIndex();
  if (page === "category") mountCategory();
});
