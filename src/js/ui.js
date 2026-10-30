/**
 * Shared UI Controller & Accessibility Utilities
 * Handles navigation active states, responsive mobile drawer toggle, and accessible modals.
 */

export function initNavigation() {
  // 1. Mobile menu toggle
  const menuBtn = document.querySelector('[data-menu-toggle]');
  const navMenu = document.querySelector('[data-nav-menu]');

  if (menuBtn && navMenu) {
    menuBtn.addEventListener('click', () => {
      const isExpanded = menuBtn.getAttribute('aria-expanded') === 'true';
      menuBtn.setAttribute('aria-expanded', !isExpanded);
      navMenu.classList.toggle('nav-menu-open');
    });
  }

  // 2. Active nav link highlight based on current path
  const currentPath = window.location.pathname.replace(/\/$/, '') || '/index.html';
  const navLinks = document.querySelectorAll('.nav-link');

  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (!href) return;
    const cleanHref = href.replace(/^\.\//, '/');
    if (
      currentPath.endsWith(href) ||
      ((currentPath === '/' || currentPath.endsWith('/ChemAware') || currentPath.endsWith('/index.html')) && (href === 'index.html' || href === './index.html' || href === '/')) ||
      (currentPath.endsWith('index.html') && href.includes('index.html')) ||
      (currentPath.endsWith('explore.html') && href.includes('explore.html')) ||
      (currentPath.endsWith('product.html') && href.includes('product.html')) ||
      (currentPath.endsWith('survey.html') && href.includes('survey.html')) ||
      (currentPath.endsWith('methodology.html') && href.includes('methodology.html')) ||
      (currentPath.endsWith('about.html') && href.includes('about.html'))
    ) {
      link.classList.add('active');
      link.setAttribute('aria-current', 'page');
    } else {
      link.classList.remove('active');
      link.removeAttribute('aria-current');
    }
  });
}

/**
 * Render standard educational disclaimer card
 * @returns {string} HTML string
 */
export function getEducationalDisclaimerHTML() {
  return `
    <div class="disclaimer-banner" role="region" aria-label="Educational Disclaimer">
      <div class="disclaimer-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
      </div>
      <div class="disclaimer-content">
        <h4>Academic & Educational Disclaimer</h4>
        <p>This platform is developed as a college research project to promote chemical awareness and ingredient literacy. Toxicological profiles and hazard flags are derived from public regulatory databases (ECHA, CIR, US EPA, WHO) for educational evaluation and do not constitute clinical or medical advice.</p>
      </div>
    </div>
  `;
}

// Auto-initialize when DOM is ready
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
  });
}
