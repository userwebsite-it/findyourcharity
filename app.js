
const SITE_EMAIL="Ayan.bahulkar16@gmail.com"; const PAGE_SIZE=24; const DATA_URL="data/charities.json";
const sections = { cause: ["Health & Medical Care", "Education & Youth", "Environment & Conservation", "Disaster Relief & Emergency Aid", "Hunger, Poverty & Housing", "Animal Welfare", "Arts, Culture & Humanities", "Human Rights & Equality", "Community Development", "Religion & Faith-Based", "Science & Technology for Good", "Sports & Recreation"], size: ["Major Global Charities", "National Non-Profits", "Local Community Charities", "Small Grassroots Orgs", "Verified 501(c)(3) Charities"], special: ["Veterans & Military Support", "Children & Families in Need", "Senior & Elderly Support", "LGBTQ+ Organizations", "Disability Advocacy & Support", "Indigenous & Tribal Communities"] };

function qs(sel, el=document){ return el.querySelector(sel); }
function qsa(sel, el=document){ return Array.from(el.querySelectorAll(sel)); }
function toSlug(s){ return encodeURIComponent(s); }
function fromSlug(s){ try{return decodeURIComponent(s)}catch{return s} }

async function loadData(){ const res = await fetch(DATA_URL); return res.json(); }

function renderFeaturedCards(container, data){
  container.innerHTML = "";
  data.forEach(c => {
    const a = document.createElement('a');
    a.href = c.website; a.target = "_blank"; a.rel = "noopener"; a.className = "card";
    a.innerHTML = `<img src="assets/logo.svg" alt="" aria-hidden="true"><div class="name">${c.name}</div>`;
    container.appendChild(a);
  });
}

function doSearchNavigate(term){
  if (!term) return;
  const url = `category.html?category=Browse%20All&search=${encodeURIComponent(term)}`;
  window.location.href = url;
}

function mountIndex(){
  const form = qs('#globalSearch');
  const input = qs('#searchInput');
  if (form) form.addEventListener('submit', (e)=>{ e.preventDefault(); doSearchNavigate(input.value.trim()); });
}

function mountFindPage(){
  const tabs = qsa('[data-tab]');
  const grid = qs('#tileGrid');
  function setTab(which){
    tabs.forEach(t => t.classList.toggle('active', t.dataset.tab === which));
    const list = sections[which];
    grid.innerHTML = "";
    list.forEach(label => {
      const a = document.createElement('a');
      a.className = "tile";
      a.href = "category.html?category=" + toSlug(label);
      a.innerHTML = `<span class="label">${label}</span><span class="chev">›</span>`;
      grid.appendChild(a);
    });
  }
  tabs.forEach(t => t.addEventListener('click', ()=> setTab(t.dataset.tab)));
  setTab('cause');
}

function paginate(items, page, pageSize){ const start = (page-1)*pageSize; return items.slice(start, start+pageSize); }

function mountCategoryPage(){
  const params = new URLSearchParams(location.search);
  const category = fromSlug(params.get('category') || "Browse All");
  const initialSearch = params.get('search') ? fromSlug(params.get('search')) : "";
  qs('#catTitle').textContent = category;
  if (initialSearch) qs('#catSearch').value = initialSearch;

  let allData = [], viewData = [];

  function applyFilters(){
    const loc = qs('#filterLoc').value;
    const size = qs('#filterSize').value;
    const verified = qs('#filterVerified').checked;
    const term = qs('#catSearch').value.trim().toLowerCase();

    viewData = allData.filter(c => {
      const inCat = category === "Browse All" || c.category === category;
      const inLoc = !loc || (c.location || "").toLowerCase().includes(loc.toLowerCase());
      const inSize = !size || (c.size || "").toLowerCase() === size.toLowerCase();
      const inVer = !verified || !!c.verified;
      const inSearch = !term || (c.name + " " + (c.blurb||"") + " " + (c.category||"")).toLowerCase().includes(term);
      return inCat && inLoc && inSize && inVer && inSearch;
    });

    renderPage(1);
  }

  function renderPage(page){
    const list = qs('#results');
    list.innerHTML = "";
    const pageItems = paginate(viewData, page, PAGE_SIZE);
    pageItems.forEach(c => {
      const item = document.createElement('div');
      item.className = "item";
      const initials = c.name.split(' ').slice(0,2).map(s=>s[0]).join('').toUpperCase();
      item.innerHTML = `
        <div class="logo"><span>${initials}</span></div>
        <div class="content">
          <h4>${c.name}</h4>
          <div class="meta">${c.category} · ${c.location || '—'} · ${c.size}</div>
          <p>${c.blurb || ''}</p>
          <div class="actions">
            <a class="btn solid" href="${c.website}" target="_blank" rel="noopener">Donate / Official Site</a>
            <a class="btn outline" href="${c.website}" target="_blank" rel="noopener">Learn More</a>
          </div>
        </div>
      `;
      list.appendChild(item);
    });

    const totalPages = Math.max(1, Math.ceil(viewData.length / PAGE_SIZE));
    const pag = qs('#pagination');
    pag.innerHTML = "";
    for (let p=1; p<=totalPages; p++){
      const b = document.createElement('button');
      b.className = "pagebtn" + (p===page ? " active" : "");
      b.textContent = p;
      b.addEventListener('click', ()=> renderPage(p));
      pag.appendChild(b);
    }
    qs('#count').textContent = `${viewData.length} charities`;
  }

  loadData().then(data => { allData = data; applyFilters(); });
  qs('#filters').addEventListener('change', applyFilters);
  qs('#catSearchForm').addEventListener('submit', e=>{ e.preventDefault(); applyFilters(); });
  qs('#backLink').addEventListener('click', e=>{ e.preventDefault(); history.back(); });
}

document.addEventListener('DOMContentLoaded', ()=>{
  const page = document.body.dataset.page;
  if (page === "index") mountIndex();
  if (page === "find") mountFindPage();
  if (page === "category") mountCategoryPage();
});
