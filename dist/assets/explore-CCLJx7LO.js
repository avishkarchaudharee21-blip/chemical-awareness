import{i as B}from"./ui-CDB3veB4.js";import{f as S,C as $}from"./data-DBSestQL.js";import{r as I,a as P}from"./score-B4Ecq_Ph.js";function u(i){return i?i.toString().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").trim():""}function x(i,n={}){const{query:e="",category:d="all",status:s="all",confidence:l="all",sortBy:g="name_asc"}=n,m=u(d),h=u(e).split(/\s+/).filter(Boolean),v=i.filter(a=>{if(m&&m!=="all"&&u(a.category)!==m||s&&s!=="all"&&a.verificationStatus!==s||l&&l!=="all"&&(a.dataConfidence||"").toLowerCase()!==l.toLowerCase())return!1;if(h.length>0){const t=u(a.brand),o=u(a.name),c=u(a.category),p=Array.isArray(a.ingredients)?a.ingredients.map(f=>u(f.name)).join(" "):"",y=`${t} ${o} ${c} ${p}`;if(!h.every(f=>y.includes(f)))return!1}return!0});return g&&v.sort((a,t)=>{var o,c,p,y;switch(g){case"name_desc":return(t.name||"").localeCompare(a.name||"");case"brand_asc":return(a.brand||"").localeCompare(t.brand||"")||(a.name||"").localeCompare(t.name||"");case"ingredients_desc":return(((o=t.ingredients)==null?void 0:o.length)||0)-(((c=a.ingredients)==null?void 0:c.length)||0);case"ingredients_asc":return(((p=a.ingredients)==null?void 0:p.length)||0)-(((y=t.ingredients)==null?void 0:y.length)||0);case"name_asc":default:return(a.name||"").localeCompare(t.name||"")}}),v}function U(i,n){if(typeof window>"u")return;const e=new URL(window.location);i&&i.trim()?e.searchParams.set("q",i.trim()):e.searchParams.delete("q"),n&&n!=="all"?e.searchParams.set("category",n):e.searchParams.delete("category"),window.history.replaceState({},"",e)}async function _(){if(typeof document>"u")return;B();const i=document.getElementById("explore-products-grid");if(!i)return;const n=document.getElementById("search-input"),e=document.getElementById("category-filter"),d=document.getElementById("status-filter"),s=document.getElementById("confidence-filter"),l=document.getElementById("sort-by"),g=document.getElementById("results-count"),m=document.getElementById("reset-filters-btn");i.innerHTML=`
    <div class="loading-state" aria-live="polite">
      <div class="spinner" aria-hidden="true"></div>
      <p>Loading chemical catalog...</p>
    </div>
  `;let w=[];try{w=await S()}catch{i.innerHTML='<p class="error-notice">Failed to load product database.</p>';return}e&&e.options.length<=1&&$.forEach(o=>{const c=document.createElement("option");c.value=o,c.textContent=o,e.appendChild(c)});const h=new URLSearchParams(window.location.search),v=h.get("q")||"",a=h.get("category")||"all";if(n&&v&&(n.value=v),e&&a){const o=Array.from(e.options).find(c=>u(c.value)===u(a));o&&(e.value=o.value)}function t(){const o=n?n.value:"",c=e?e.value:"all",p=d?d.value:"all",y=s?s.value:"all",L=l?l.value:"name_asc";U(o,c);const f=x(w,{query:o,category:c,status:p,confidence:y,sortBy:L});if(g&&(f.length===1?g.textContent="Showing 1 product":g.textContent=`Showing ${f.length} products`),f.length===0){i.innerHTML=`
        <div class="empty-state-card full-width" role="status" aria-live="polite">
          <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <h3>No products found</h3>
          <p>No products match your current search criteria. Try adjusting your keywords or clearing the category filter.</p>
          <button id="clear-search-btn" class="btn btn-secondary btn-sm" type="button">Clear Search & Filters</button>
        </div>
      `;const r=document.getElementById("clear-search-btn");r&&r.addEventListener("click",()=>{n&&(n.value=""),e&&(e.value="all"),d&&(d.value="all"),s&&(s.value="all"),l&&(l.value="name_asc"),t()});return}i.innerHTML=f.map(r=>{const E=r.dataConfidence?`confidence-${r.dataConfidence.toLowerCase()}`:"confidence-medium",b=r.dataConfidence?r.dataConfidence.charAt(0).toUpperCase()+r.dataConfidence.slice(1)+" Confidence":"Confidence Not Stated";return`
        <article class="product-card" aria-labelledby="prod-title-${r.id}">
          <div class="card-header">
            <span class="category-tag">${C(r.category||"Uncategorized")}</span>
            <div class="card-badges-wrap">
              ${I(r.verificationStatus)}
              <span class="confidence-pill ${E}" title="Data Confidence Level">${C(b)}</span>
            </div>
          </div>

          <div class="card-body">
            <h3 id="prod-title-${r.id}" class="product-card-title">
              <a href="product.html?id=${encodeURIComponent(r.id)}">${C(r.name)}</a>
            </h3>
            <span class="product-card-brand">Brand: <strong>${C(r.brand||"Unspecified Brand")}</strong></span>
          </div>

          <div class="card-footer">
            <div class="score-container">
              ${P(r.score)}
            </div>
            <a href="product.html?id=${encodeURIComponent(r.id)}" class="btn btn-sm btn-primary" aria-label="View chemical details for ${C(r.name)}">
              Inspect &rarr;
            </a>
          </div>
        </article>
      `}).join("")}n&&n.addEventListener("input",t),e&&e.addEventListener("change",t),d&&d.addEventListener("change",t),s&&s.addEventListener("change",t),l&&l.addEventListener("change",t),m&&m.addEventListener("click",()=>{n&&(n.value=""),e&&(e.value="all"),d&&(d.value="all"),s&&(s.value="all"),l&&(l.value="name_asc"),t()}),window.addEventListener("popstate",()=>{const o=new URLSearchParams(window.location.search);n&&(n.value=o.get("q")||""),e&&(e.value=o.get("category")||"all"),t()}),t()}function C(i){return typeof i!="string"?"":i.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;")}typeof document<"u"&&document.addEventListener("DOMContentLoaded",_);
