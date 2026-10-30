import{i as $}from"./ui-CDB3veB4.js";import{c as S}from"./data-DBSestQL.js";async function w(){if(typeof document>"u")return;$();const t=document.getElementById("survey-container");if(t){t.innerHTML=`
    <div class="loading-state" aria-live="polite">
      <div class="spinner" aria-hidden="true"></div>
      <p>Checking survey registry...</p>
    </div>
  `;try{const e=await S();if(!e){l(t,"Survey results not yet available.");return}C(t,e)}catch(e){console.error("Error loading survey:",e),l(t,"Survey results not yet available.")}}}function C(t,e){if(!e||e.status==="no_data"||e.respondents===null||e.respondents===void 0||!Array.isArray(e.categories)||e.categories.length===0){l(t,"Survey results not yet available.",e);return}const c=e.respondents!==null&&e.respondents!==void 0?e.respondents:"N/A",g=e.collectedOn?new Date(e.collectedOn).toLocaleDateString(void 0,{year:"numeric",month:"short",day:"numeric"}):"Not Specified",v=(e.categories||[]).map(s=>{const i=s.respondents!==void 0&&s.respondents!==null?s.respondents:c,y=s.denominatorNote||`${i} respondents answered this category`,d=Array.isArray(s.brands)?[...s.brands].sort((a,r)=>(r.count||0)-(a.count||0)):[],m=d.length>0?d.map(a=>{const r=a.name||a.brand||"Unspecified Brand",b=a.productId&&!a.isNonBrand&&!a.isOther?`<a href="product.html?id=${encodeURIComponent(a.productId)}" class="product-inline-link"><strong>${n(r)}</strong> <span class="inline-tag">View Product</span></a>`:`<span><strong>${n(r)}</strong>${a.isNonBrand?' <em class="text-muted">(Non-brand response)</em>':""}${a.isOther?' <em class="text-muted">(Write-in / Unlisted)</em>':""}</span>`,p=a.count!==void 0&&a.count!==null?a.count:0,o=a.percentage!==void 0&&a.percentage!==null?a.percentage:i>0?Math.round(p/i*1e3)/10:0;return`
          <tr>
            <td class="brand-cell">${b}</td>
            <td class="count-cell"><strong>${p}</strong></td>
            <td class="percentage-cell">
              <div class="survey-bar-cell">
                <span class="pct-text">${o}%</span>
                <div class="survey-progress-track" role="progressbar" aria-valuenow="${o}" aria-valuemin="0" aria-valuemax="100" aria-label="${n(r)}: ${o}% of responses in ${n(s.category)}">
                  <div class="survey-progress-fill" style="width: ${Math.min(o,100)}%"></div>
                </div>
              </div>
            </td>
            <td class="notes-cell">${a.otherResponses?n(a.otherResponses):'<span class="text-subtle">-</span>'}</td>
          </tr>
        `}).join(""):'<tr><td colspan="4" class="text-muted">No specific brand counts recorded</td></tr>',f=s.otherCount&&s.otherCount>0?`<div class="other-count-note"><strong>Other / Unlisted mentions:</strong> Recorded ${s.otherCount} responses in this category.</div>`:"";return`
      <section class="survey-category-block" aria-labelledby="cat-heading-${n(s.categoryKey||s.category)}">
        <div class="category-summary-header">
          <div>
            <h3 id="cat-heading-${n(s.categoryKey||s.category)}">${n(s.category||s.name||"Category")}</h3>
            <p class="category-denominator-note">${n(y)}</p>
          </div>
          <div class="cat-stat-pills">
            <span class="stat-pill">Responses: <strong>${i}</strong></span>
          </div>
        </div>

        <div class="table-responsive">
          <table class="chemical-table survey-table" aria-label="Survey results for ${n(s.category||s.name)}">
            <thead>
              <tr>
                <th scope="col" style="width: 32%;">Surveyed Brand / Option</th>
                <th scope="col" style="width: 12%;">Count</th>
                <th scope="col" style="width: 30%;">Share / Distribution</th>
                <th scope="col" style="width: 26%;">Notes / Context</th>
              </tr>
            </thead>
            <tbody>
              ${m}
            </tbody>
          </table>
        </div>
        ${f}
      </section>
    `}).join(""),h=Array.isArray(e.observations)&&e.observations.length>0?`
      <section class="detail-section survey-observations-section" aria-labelledby="observations-heading">
        <h2 id="observations-heading" class="section-title">Key Survey Observations & Literacy Analysis</h2>
        <div class="observations-cards-grid">
          ${e.observations.map(s=>`
            <div class="observation-card">
              <div class="observation-icon" aria-hidden="true">💡</div>
              <p class="observation-text">${n(s)}</p>
            </div>
          `).join("")}
        </div>
      </section>
    `:"";t.innerHTML=`
    <header class="page-intro">
      <div class="academic-tag">Consumer Chemical Literacy Survey</div>
      <h1>College Survey Results</h1>
      <p class="intro-lead">Empirical findings from <strong>${c} student survey participants</strong> evaluating daily product choices, brand market penetration, and category usage frequency across campus cohorts.</p>
      
      <div class="survey-meta-pills">
        <span class="meta-pill">Total Survey Participants: <strong>${c}</strong></span>
        <span class="meta-pill">Collection Date: <strong>${g}</strong></span>
        <span class="meta-pill">Selection Mode: <strong>Single Choice (Most Frequently Used)</strong></span>
      </div>
    </header>

    <div class="survey-data-sections">
      ${v}
    </div>

    ${h}
  `}function l(t,e,u={}){t.innerHTML=`
    <!-- Page Header -->
    <header class="page-intro">
      <div class="academic-tag">College Research Survey</div>
      <h1>Chemical Awareness Survey</h1>
      <p class="intro-lead">Campus-wide research evaluating consumer understanding of product chemical formulations, hazard awareness, and label transparency.</p>
    </header>

    <!-- Empty / Pending Survey State Card -->
    <section class="survey-pending-card" aria-label="Survey Status">
      <div class="pending-icon-wrap" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="20" x2="18" y2="10"></line>
          <line x1="12" y1="20" x2="12" y2="4"></line>
          <line x1="6" y1="20" x2="6" y2="14"></line>
        </svg>
      </div>

      <h2 class="pending-title">${n(e)}</h2>
      <p class="pending-desc">
        The Chemical Awareness project survey data collection and response aggregation are currently underway. No official response counts or statistics have been published yet for this academic cohort.
      </p>

      <div class="pending-schema-preview">
        <h4>Prepared Data Pipeline Structure</h4>
        <p class="schema-note">Once the sampling window concludes, this page will dynamically display aggregated metrics across the following dimensions:</p>
        
        <div class="schema-tags-grid">
          <div class="schema-tag-item">
            <span class="tag-title">Total Respondents</span>
            <span class="tag-desc">Verified sample count across student and campus cohorts</span>
          </div>
          <div class="schema-tag-item">
            <span class="tag-title">Category Breakdown</span>
            <span class="tag-desc">Distribution across all 8 consumer product categories</span>
          </div>
          <div class="schema-tag-item">
            <span class="tag-title">Brand Usage Counts</span>
            <span class="tag-desc">Specific consumer product brands and formulation mentions</span>
          </div>
          <div class="schema-tag-item">
            <span class="tag-title">Percentages & Share</span>
            <span class="tag-desc">Normalized awareness metrics and concern prevalence</span>
          </div>
          <div class="schema-tag-item">
            <span class="tag-title">Other Responses</span>
            <span class="tag-desc">Qualitative student commentary and write-in feedback</span>
          </div>
          <div class="schema-tag-item">
            <span class="tag-title">Academic Observations</span>
            <span class="tag-desc">Synthesized findings and chemical literacy takeaways</span>
          </div>
        </div>
      </div>

      <div class="pending-actions">
        <a href="explore.html" class="btn btn-primary">Explore Product Catalog</a>
        <a href="methodology.html" class="btn btn-secondary">Review Scoring Methodology</a>
      </div>
    </section>
  `}function n(t){return typeof t!="string"?"":t.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;")}typeof document<"u"&&document.addEventListener("DOMContentLoaded",w);
