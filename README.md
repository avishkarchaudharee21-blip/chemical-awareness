# 🧪 Chemical Awareness — College Research Project

**Chemical Awareness** is a clean, modern, and accessible web platform created as a college research project to promote chemical ingredient literacy, toxicity awareness, and consumer transparency in everyday personal care and household products.

---

## 🚀 Key Features

* **6 Core Pages**:
  1. `index.html` — Project introduction, 8 category cards, and educational disclaimers.
  2. `explore.html` — Live client-side product search, multi-parameter filtering, and ingredient inspector.
  3. `product.html` — Detailed chemical formulation breakdown, CAS/regulatory citations, and safer alternatives.
  4. `survey.html` — Empirical survey results (250 student respondents) with pure CSS analytics charts.
  5. `methodology.html` — Scientific scoring rubrics, 4 evaluation dimensions, and regulatory source index.
  6. `about.html` — College project background, academic mission, and technical architecture.

* **Eight Consumer Product Categories**:
  1. Shampoo / Conditioner
  2. Body Wash / Bar Soap
  3. Toothpaste
  4. House Cleaning Products
  5. Facial Cleanser / Face Wash
  6. Deodorant / Perfume
  7. Detergent / Cloth Washing Soap
  8. Dishwashing / Utensil Cleaning

* **Architecture & Standards**:
  * **Vite** fast bundling & development server
  * **Plain JavaScript ES Modules (ESM)** (Zero React, zero heavy frameworks)
  * **Semantic HTML5 & Modern CSS3** (Zero Tailwind, zero Bootstrap)
  * **No Backend & No Auth** required
  * **Structured JSON Data Architecture** with strict schema validation
  * **WCAG AA Compliant** color contrast, accessible focus rings, and mobile-responsive layout

---

## 📂 Project Structure

```
chemical-awareness/
├── public/
│   └── data/
│       ├── products.json        # Verified chemical & product dataset (V2 Schema)
│       ├── survey.json          # College chemical awareness survey results
│       └── methodology.json     # Scoring rubric, hazard tiers, scientific references
├── scripts/
│   └── build-data.mjs           # Data validation and build script
├── src/
│   ├── css/
│   │   └── styles.css           # Modern, scientific, responsive plain CSS
│   └── js/
│       ├── data.js              # Data fetching and caching layer
│       ├── search.js            # Search, filter, and explore page controller
│       ├── score.js             # Hazard score formatting & badge utilities
│       ├── product.js           # Single product detail view controller
│       ├── survey.js            # Survey results and pure CSS charts controller
│       ├── methodology.js       # Methodology explanation and rubric renderer
│       └── ui.js                # Shared navigation, active states, and mobile drawer
├── index.html                   # 1. Home
├── explore.html                 # 2. Explore Products
├── product.html                 # 3. Product Details
├── survey.html                  # 4. Survey Results
├── methodology.html             # 5. Methodology
├── about.html                   # 6. About
├── package.json                 # Project dependencies & npm scripts
├── vite.config.js               # Vite multi-page configuration
└── README.md                    # Documentation
```

---

## 🛠️ How to Run

### 1. Install Dependencies
```bash
npm install
```

### 2. Validate Data Integrity
```bash
npm run test:data
```

### 3. Start Local Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for Production
```bash
npm run build
```
Generates the optimized static distribution in the `dist/` directory.

---

## 📚 Academic Citations & Regulatory References

This project references monographs and safety assessments from:
* **European Chemicals Agency (ECHA)** — REACH Database
* **Cosmetic Ingredient Review (CIR)** — Expert Panel Reports
* **EU Scientific Committee on Consumer Safety (SCCS)**
* **US Environmental Protection Agency (EPA)** — Safer Choice Program
* **World Health Organization (WHO)** — International Chemical Safety Cards (ICSC)
* **US Food and Drug Administration (FDA)** — Code of Federal Regulations (CFR 21)

---

## ⚖️ Educational Disclaimer

This platform is developed strictly for college research and consumer education. Hazard classifications and ingredient analyses are for comparative reference only and do not constitute clinical or medical diagnosis.
