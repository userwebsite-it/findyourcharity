
const DATA_URL="data/charities.json"; const PAGE_SIZE=20;
function qs(s,el=document){return el.querySelector(s)} function qsa(s,el=document){return Array.from(el.querySelectorAll(s))}
function toSlug(s){return encodeURIComponent(s)} function fromSlug(s){try{return decodeURIComponent(s)}catch{return s}}
async function loadData(){const r=await fetch(DATA_URL);return r.json();}

function renderFeatured(el,items){el.innerHTML="";items.forEach(c=>{const a=document.createElement("a");a.href=c.website;a.target="_blank";a.rel="noopener";a.className="card";a.innerHTML=`<div class="logo">${(c.name.split(' ').slice(0,2).map(w=>w[0]).join('')).toUpperCase()}</div><div class="name">${c.name}</div>`;el.appendChild(a);});}
function mountIndex(){const f=qs("#globalSearch"),i=qs("#searchInput");f.addEventListener("submit",e=>{e.preventDefault();if(!i.value.trim())return;location.href=`category.html?category=Browse%20All&search=${encodeURIComponent(i.value.trim())}`;});loadData().then(all=>{renderFeatured(qs("#feat1"),all.slice(0,6));});}
function mountCategory(){const params=new URLSearchParams(location.search);const category=fromSlug(params.get("category")||"Browse All");qs("#catTitle").textContent=category;let all=[],view=[];
function apply(){const term=(qs("#q").value||"").toLowerCase().trim();const size=qs("#size").value;const verified=qs("#ver").checked;const loc=qs("#loc").value.trim().toLowerCase();
view=all.filter(c=>{const inCat=category==="Browse All"||c.category===category;const inTerm=!term||(c.name+" "+(c.blurb||"")).toLowerCase().includes(term);const inSize=!size||(c.size||"").toLowerCase()===size.toLowerCase();const inVer=!verified||!!c.verified;const inLoc=!loc||(c.location||"").toLowerCase().includes(loc);return inCat&&inTerm&&inSize&&inVer&&inLoc;});render(1);}
function render(page){const list=qs("#results");list.innerHTML="";const start=(page-1)*PAGE_SIZE;const items=view.slice(start,start+PAGE_SIZE);items.forEach(c=>{const initials=c.name.split(' ').slice(0,2).map(w=>w[0]).join('').toUpperCase();const item=document.createElement("div");item.className="item";item.innerHTML=`
<div class="logo">${initials}</div>
<div>
  <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;">
    <h3 style="margin:0">${c.name}</h3>
    <div class="rating"><img src="assets/star.svg" alt="" aria-hidden="true"/> ${(c.rating||'').toFixed ? c.rating.toFixed(1) : ''}</div>
  </div>
  <div class="meta">${c.category} · ${c.location||"—"} · ${c.size}</div>
  <div class="badges">${c.verified?'<span class="badge">Verified 501(c)(3)</span>':''}<span class="badge red">Direct link only</span></div>
</div>
<div class="actions">
  <a class="btn primary" href="${c.website}" target="_blank" rel="noopener">Donate / Official Site</a>
  <a class="btn" href="${c.website}" target="_blank" rel="noopener">Learn More</a>
</div>`;list.appendChild(item);});qs("#count").textContent=`${view.length} charities`;const pag=qs("#pag");pag.innerHTML="";const pages=Math.max(1,Math.ceil(view.length/PAGE_SIZE));for(let p=1;p<=pages;p++){const b=document.createElement("button");b.className="btn";b.textContent=p;if(p===page){b.style.background="var(--primary)";b.style.color="#fff"}b.addEventListener("click",()=>render(p));pag.appendChild(b);}}
loadData().then(d=>{all=d;apply()});qsa("input,select").forEach(el=>el.addEventListener("input",apply));qs("#searchForm").addEventListener("submit",e=>{e.preventDefault();apply()});}
document.addEventListener("DOMContentLoaded",()=>{const page=document.body.dataset.page;if(page==="index")mountIndex();if(page==="category")mountCategory();});
