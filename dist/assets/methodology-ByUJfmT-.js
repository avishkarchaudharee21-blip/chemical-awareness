import{i as d}from"./ui-CDB3veB4.js";import{a as p}from"./data-DBSestQL.js";async function g(){if(typeof document>"u")return;d();const a=document.getElementById("methodology-container");if(a){a.innerHTML=`
    <div class="loading-state" aria-live="polite">
      <div class="spinner" aria-hidden="true"></div>
      <p>Loading scoring methodology...</p>
    </div>
  `;try{const e=await p();if(!e){a.innerHTML='<p class="error-notice">Failed to load methodology specifications.</p>';return}m(a,e)}catch(e){console.error("Error loading methodology:",e),a.innerHTML='<p class="error-notice">An error occurred while loading methodology.</p>'}}}function m(a,e){var s;const n=(e.scoringFactors||[]).map((i,l)=>`
    <article class="dimension-card">
      <div class="dimension-header">
        <div>
          <span class="factor-num">Factor ${l+1}</span>
          <h3>${o(i.name)}</h3>
        </div>
        <span class="dimension-weight">${i.maxPoints} Points Max</span>
      </div>
      <p class="dimension-criteria">${o(i.description)}</p>
    </article>
  `).join(""),t=(e.scoreBands||[]).map(i=>`
    <div class="tier-card tier-${i.badgeClass}">
      <div class="tier-header">
        <span class="badge ${i.badgeClass}">${o(i.label)}</span>
        <span class="tier-range">Scale: ${o(i.range)}</span>
      </div>
      <p class="tier-desc">${o(i.description)}</p>
    </div>
  `).join(""),r=(e.limitations||[]).map(i=>`
    <li class="limitation-item">
      <svg class="icon-bullet" viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
      </svg>
      <span>${o(i)}</span>
    </li>
  `).join(""),c=(e.authoritativeSources||[]).map(i=>`
    <div class="source-card">
      <div class="source-code-badge">${o(i.code)}</div>
      <h4>${o(i.organization)}</h4>
      <p>${o(i.description)}</p>
    </div>
  `).join("");a.innerHTML=`
    <!-- Page Header -->
    <header class="page-intro">
      <div class="badge badge-verified">College Research Methodology v${o(e.version||"2.0")}</div>
      <h1>${o(e.title)}</h1>
      <p class="intro-lead">${o(e.purpose)}</p>
    </header>

    <!-- Important Notice Alert -->
    <div class="disclaimer-banner" role="alert" aria-label="Important Scoring Notice">
      <div class="disclaimer-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
      </div>
      <div class="disclaimer-content">
        <h4>Important Educational Notice</h4>
        <p><strong>${o(e.disclaimer)}</strong></p>
        <p class="notice-sub">Higher score means: <em>"${o(e.scoreInterpretation)}"</em></p>
      </div>
    </div>

    <!-- 1. Five Scoring Factors -->
    <section class="methodology-section" aria-labelledby="factors-heading">
      <div class="section-header-wrap">
        <h2 id="factors-heading">1. Five Scoring Factors</h2>
        <span class="count-tag">Total = ${e.totalMaximumPoints} Points</span>
      </div>
      <p class="section-lead">The Chemical Awareness Score integrates five distinct toxicological and behavioral dimensions to evaluate consumer product formulations:</p>
      <div class="dimensions-grid">
        ${n}
      </div>
    </section>

    <!-- 2. Score Calculation Formula -->
    <section class="methodology-section" aria-labelledby="calculation-heading">
      <h2 id="calculation-heading">2. Score Calculation Formula</h2>
      <div class="calc-formula-card">
        <div class="formula-box">
          <span class="formula-label">Displayed Score Formula</span>
          <code>displayedScore = max(1.0, totalPoints / 10)</code>
        </div>
        <p class="calc-desc">${o(((s=e.scoreCalculation)==null?void 0:s.description)||"")}</p>
        
        <div class="calc-example-box">
          <h4>Calculation Example</h4>
          <ol class="example-steps">
            <li><strong>Sum Factor Points:</strong> e.g., 20 (concern) + 12 (exposure) + 10 (frequency) + 14 (evidence) + 6 (concern areas) = <strong>62 Total Points</strong> (out of 100).</li>
            <li><strong>Normalize to 10-point scale:</strong> 62 / 10 = <strong>6.2</strong>.</li>
            <li><strong>Apply minimum floor:</strong> <code>max(1.0, 6.2)</code> = <strong>6.2</strong> &rarr; <em>Moderate identified concern</em>.</li>
          </ol>
        </div>
      </div>
    </section>

    <!-- 3. Score Bands -->
    <section class="methodology-section" aria-labelledby="bands-heading">
      <h2 id="bands-heading">3. Score Bands & Classifications</h2>
      <p class="section-lead">Displayed scores fall into three defined awareness bands:</p>
      <div class="tiers-grid">
        ${t}
      </div>
    </section>

    <!-- 4. Limitations -->
    <section class="methodology-section" aria-labelledby="limitations-heading">
      <h2 id="limitations-heading">4. Project Scope & Limitations</h2>
      <p class="section-lead">Users and evaluators should consider the following academic and data boundaries:</p>
      <div class="limitations-card">
        <ul class="limitations-list">
          ${r}
        </ul>
      </div>
    </section>

    <!-- 5. Authoritative Sources -->
    <section class="methodology-section" aria-labelledby="sources-heading">
      <h2 id="sources-heading">5. Authoritative Regulatory & Scientific Databases</h2>
      <p class="section-lead">Scoring criteria are referenced against public monographs from international safety and regulatory authorities:</p>
      <div class="sources-grid">
        ${c}
      </div>
    </section>
  `}function o(a){return typeof a!="string"?"":a.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;")}typeof document<"u"&&document.addEventListener("DOMContentLoaded",g);
