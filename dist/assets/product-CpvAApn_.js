import{i as I}from"./ui-BlCxtn1L.js";import{b as L,f as B}from"./data-6mhSYh5v.js";import{a as S,r as M}from"./score-B4Ecq_Ph.js";async function D(){if(typeof document>"u")return;I();const n=document.getElementById("product-detail-container");if(!n)return;const r=new URLSearchParams(window.location.search).get("id");if(!r||!r.trim()){w(n,"No Product Selected","Please select a product from the Explore catalog to inspect its chemical formulation.");return}n.innerHTML=`
    <div class="loading-state" aria-live="polite">
      <div class="spinner" aria-hidden="true"></div>
      <p>Loading chemical formulation data...</p>
    </div>
  `;try{const i=await L(r.trim());if(!i){w(n,"Product Not Found",`No cataloged chemical profile matching ID "${r}" was found in our academic registry.`);return}let o=[];if(Array.isArray(i.alternatives)&&i.alternatives.length>0){const d=await B();o=i.alternatives.map(f=>d.find(u=>u.id===f)).filter(Boolean)}H(n,i,o)}catch(i){console.error("Error loading product details:",i),w(n,"Error Loading Data","An unexpected error occurred while retrieving the chemical profile. Please return to the explore catalog.")}}function H(n,s,r=[]){const i=s.brand||"Unspecified Brand",o=s.name||"Unnamed Product",d=s.category||"Uncategorized",f=s.productType||"Standard Formulation",u=s.exposureType||"Standard Topical",C=s.dataConfidence?s.dataConfidence.charAt(0).toUpperCase()+s.dataConfidence.slice(1)+" Confidence":"Not Recorded",T=s.lastVerified?new Date(s.lastVerified).toLocaleDateString(void 0,{year:"numeric",month:"short",day:"numeric"}):"Not Recorded";let g="";const t=s.score&&typeof s.score=="object"?s.score:null,l=typeof s.score=="number"?s.score:(t==null?void 0:t.displayedScore)??null;if(l!=null&&typeof l=="number"&&(t==null?void 0:t.status)!=="not_scored"){const e=t==null?void 0:t.factors;let c="";e&&(c=`
        <div class="score-breakdown-box">
          <h4 class="breakdown-title">Five-Factor Methodology Breakdown</h4>
          <div class="factor-grid">
            <div class="factor-item">
              <span class="factor-label">Ingredient Concern Profile</span>
              <span class="factor-val"><strong>${e.ingredientConcernProfile}</strong> / 35</span>
            </div>
            <div class="factor-item">
              <span class="factor-label">Exposure Characteristics</span>
              <span class="factor-val"><strong>${e.exposureCharacteristics}</strong> / 20</span>
            </div>
            <div class="factor-item">
              <span class="factor-label">Frequency of Use</span>
              <span class="factor-val"><strong>${e.frequencyOfUse}</strong> / 15</span>
            </div>
            <div class="factor-item">
              <span class="factor-label">Evidence Strength</span>
              <span class="factor-val"><strong>${e.evidenceStrength}</strong> / 20</span>
            </div>
            <div class="factor-item">
              <span class="factor-label">Concern Areas</span>
              <span class="factor-val"><strong>${e.concernAreas}</strong> / 10</span>
            </div>
            <div class="factor-item factor-total-item">
              <span class="factor-label">Total Evaluated Points</span>
              <span class="factor-val"><strong>${t.total}</strong> / 100</span>
            </div>
          </div>
          ${t.rationale?`<p class="score-rationale-text"><strong>Scoring Rationale:</strong> ${a(t.rationale)}</p>`:""}
        </div>
      `),g=`
      <div class="score-display-card">
        <div class="score-header-flex">
          <div class="score-main-value">${l.toFixed(1)}</div>
          <div class="score-details">
            <h4>Chemical Awareness Score</h4>
            <p>${S(l)}</p>
            <span class="score-subtext">Evaluated on a 1.0 – 10.0 scale (higher score indicates higher level of identified concerns)</span>
          </div>
        </div>
        ${c}
      </div>
    `}else{const e=(t==null?void 0:t.explanation)||"This formulation has been cataloged for chemical composition review, but a quantitative hazard score has not yet been computed in this educational phase.";g=`
      <div class="score-unrated-card">
        <div class="score-unrated-pill">Not yet scored</div>
        <p class="score-unrated-note">${a(e)}</p>
      </div>
    `}const p=Array.isArray(s.ingredients)?s.ingredients:[],v=p.filter(e=>e.flag===!0||typeof e.flag=="string"&&e.flag.trim().length>0);let m="";v.length>0?m=`
      <div class="table-responsive">
        <table class="chemical-table" aria-label="Ingredients Requiring Awareness">
          <thead>
            <tr>
              <th scope="col">Ingredient</th>
              <th scope="col">Function</th>
              <th scope="col">Potential Concern</th>
              <th scope="col">Evidence</th>
              <th scope="col">Source</th>
            </tr>
          </thead>
          <tbody>
            ${v.map(e=>{const c=e.sourceIds&&e.sourceIds.length>0?e.sourceIds.map(P=>`<span class="source-tag">${a(P)}</span>`).join(" "):e.evidence?'<span class="source-tag">Literature</span>':'<span class="text-muted">Not specified</span>',A=typeof e.flag=="string"?`<span class="flag-badge flag-${a(e.flag.toLowerCase())}">${a(e.flag)}</span>`:e.flag===!0?'<span class="flag-badge flag-concern">Awareness Flag</span>':"";return`
                <tr>
                  <td class="col-ingredient">
                    <strong>${a(e.name||"Unnamed")}</strong>
                    ${A}
                  </td>
                  <td class="col-function">${a(e.function||"Not specified")}</td>
                  <td class="col-concern">${a(e.concern||"Specific concern flagged in review")}</td>
                  <td class="col-evidence">${a(e.evidence||"Documented in toxicological dossiers")}</td>
                  <td class="col-source">${c}</td>
                </tr>
              `}).join("")}
          </tbody>
        </table>
      </div>
    `:m=`
      <div class="info-notice-box">
        <p>No ingredients requiring specific awareness identified in current review.</p>
      </div>
    `;let h="";p.length>0?h=`
      <div class="table-responsive">
        <table class="chemical-table all-ingredients-table" aria-label="All Ingredients">
          <thead>
            <tr>
              <th scope="col">Ingredient</th>
              <th scope="col">Function</th>
              <th scope="col">Review Status</th>
            </tr>
          </thead>
          <tbody>
            ${p.map(e=>{let c="";return e.flag===!0||typeof e.flag=="string"&&e.flag.trim().length>0?c='<span class="status-pill status-flagged">Flagged for Awareness</span>':e.flag===!1||!e.flag&&(e.function||e.evidence||e.note)?c='<span class="status-pill status-reviewed">Reviewed, no concern identified</span>':c='<span class="status-pill status-pending">Not yet reviewed</span>',`
                <tr>
                  <td class="col-ingredient">
                    <strong>${a(e.name||"Unnamed Ingredient")}</strong>
                  </td>
                  <td class="col-function">${a(e.function||"Not specified")}</td>
                  <td class="col-status">${c}</td>
                </tr>
              `}).join("")}
          </tbody>
        </table>
      </div>
    `:h=`
      <div class="info-notice-box">
        <p>No ingredient formulation list captured for this product record.</p>
      </div>
    `;let y="";s.usage&&s.usage.trim()?y=`<p class="usage-text">${a(s.usage)}</p>`:y='<p class="missing-text text-muted">Manufacturer guidance not captured</p>';let b="";r.length>0?b=`
      <div class="alternatives-grid">
        ${r.map(e=>`
          <a href="product.html?id=${encodeURIComponent(e.id)}" class="alt-card" aria-label="Inspect alternative ${a(e.name)}">
            <span class="alt-category">${a(e.category)}</span>
            <h4>${a(e.name)}</h4>
            <span class="alt-brand">Brand: ${a(e.brand)}</span>
            <div class="alt-footer">
              ${S(e.score)}
              <span class="alt-link-text">Inspect Details &rarr;</span>
            </div>
          </a>
        `).join("")}
      </div>
    `:b='<p class="missing-text text-muted">Alternative not yet verified</p>';let $="";const x=Array.isArray(s.sources)?s.sources.filter(Boolean):[];x.length>0?$=`
      <ul class="sources-bullet-list">
        ${x.map(e=>`<li>${a(e)}</li>`).join("")}
      </ul>
    `:$='<p class="missing-text text-muted">Source verification required</p>',n.innerHTML=`
    <!-- Breadcrumbs -->
    <nav class="breadcrumb" aria-label="Breadcrumb">
      <a href="index.html">Home</a>
      <span class="separator">/</span>
      <a href="explore.html">Explore Products</a>
      <span class="separator">/</span>
      <span aria-current="page">${a(o)}</span>
    </nav>

    <!-- Page Title Header -->
    <header class="product-page-header">
      <div class="category-pill">${a(d)}</div>
      <h1 class="product-main-title">${a(o)}</h1>
      <p class="product-brand-sub">Brand: <strong>${a(i)}</strong></p>
    </header>

    <div class="product-layout-grid">
      <!-- Left Column / Main Information -->
      <div class="product-main-column">

        <!-- 1. Product Information Section -->
        <section class="detail-section" aria-labelledby="sec-product-info">
          <h2 id="sec-product-info" class="section-title">Product Information</h2>
          <div class="info-table-card">
            <dl class="meta-definition-list">
              <div class="meta-row">
                <dt>Brand</dt>
                <dd>${a(i)}</dd>
              </div>
              <div class="meta-row">
                <dt>Product Name</dt>
                <dd>${a(o)}</dd>
              </div>
              <div class="meta-row">
                <dt>Category</dt>
                <dd>${a(d)}</dd>
              </div>
              <div class="meta-row">
                <dt>Product Type</dt>
                <dd>${a(f)}</dd>
              </div>
              <div class="meta-row">
                <dt>Exposure Type</dt>
                <dd>${a(u)}</dd>
              </div>
              <div class="meta-row">
                <dt>Verification Status</dt>
                <dd>${M(s.verificationStatus)}</dd>
              </div>
              <div class="meta-row">
                <dt>Data Confidence</dt>
                <dd><span class="confidence-pill confidence-${s.dataConfidence?s.dataConfidence.toLowerCase():"medium"}">${a(C)}</span></dd>
              </div>
              <div class="meta-row">
                <dt>Last Verified</dt>
                <dd>${T}</dd>
              </div>
            </dl>
          </div>
        </section>

        <!-- 2. Chemical Awareness Score Section -->
        <section class="detail-section" aria-labelledby="sec-score">
          <h2 id="sec-score" class="section-title">Chemical Awareness Score</h2>
          ${g}
        </section>

        <!-- 3. Ingredients Requiring Awareness -->
        <section class="detail-section" aria-labelledby="sec-flagged-ing">
          <div class="section-header-wrap">
            <h2 id="sec-flagged-ing" class="section-title">Ingredients Requiring Awareness</h2>
            <span class="count-tag">${v.length} Flagged</span>
          </div>
          <p class="section-desc">Chemical compounds identified with potential irritation, contact allergenicity, or environmental concerns:</p>
          ${m}
        </section>

        <!-- 4. All Ingredients -->
        <section class="detail-section" aria-labelledby="sec-all-ing">
          <div class="section-header-wrap">
            <h2 id="sec-all-ing" class="section-title">All Ingredients</h2>
            <span class="count-tag">${p.length} Total</span>
          </div>
          <p class="section-desc">Complete formulation composition as recorded from packaging and regulatory filings:</p>
          ${h}
        </section>

        <!-- 5. Usage Section -->
        <section class="detail-section" aria-labelledby="sec-usage">
          <h2 id="sec-usage" class="section-title">Usage & Application Guidance</h2>
          <div class="content-box">
            ${y}
          </div>
        </section>

        <!-- 6. Alternative Section -->
        <section class="detail-section" aria-labelledby="sec-alternatives">
          <h2 id="sec-alternatives" class="section-title">Alternative Formulations</h2>
          ${b}
        </section>

        <!-- 7. Sources Section -->
        <section class="detail-section" aria-labelledby="sec-sources">
          <h2 id="sec-sources" class="section-title">Verified Sources & References</h2>
          <div class="content-box">
            ${$}
          </div>
        </section>

      </div>
    </div>
  `}function w(n,s,r){n.innerHTML=`
    <nav class="breadcrumb" aria-label="Breadcrumb">
      <a href="index.html">Home</a>
      <span class="separator">/</span>
      <a href="explore.html">Explore Products</a>
    </nav>
    <div class="empty-state-card" role="status">
      <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="12"></line>
        <line x1="12" y1="16" x2="12.01" y2="16"></line>
      </svg>
      <h2>${a(s)}</h2>
      <p>${a(r)}</p>
      <a href="explore.html" class="btn btn-primary">Browse All Cataloged Products</a>
    </div>
  `}function a(n){return typeof n!="string"?"":n.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;")}typeof document<"u"&&document.addEventListener("DOMContentLoaded",D);
