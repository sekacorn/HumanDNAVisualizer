# HumanDNAVisualizer

> Exploring genomic data through interactive 3D visualization and evidence-labeled biological models

![License](https://img.shields.io/badge/license-AGPL--3.0--or--later-blue.svg)
![Java](https://img.shields.io/badge/Java-17-orange.svg)
![Python](https://img.shields.io/badge/Python-3.10-blue.svg)
![React](https://img.shields.io/badge/React-18.2-blue.svg)

---

## Important Disclaimer

**HumanDNAVisualizer is an educational and research-oriented visualization platform.**

It does **NOT**:

- Provide medical diagnoses
- Predict disease outcomes
- Recommend treatments or lifestyle changes
- Replace professional medical advice

All visualizations, mappings, and AI-generated explanations are **informational**, **non-diagnostic**, and **explicitly labeled with uncertainty and evidence levels**.

---

## Screenshots

### Command Centre

![HumanDNAVisualizer dashboard](docs/screenshots/01-dashboard.jpg)
*Session dashboard — pipeline progress, variant impact breakdown, recent samples, and a live read stream in a bento layout*

### Gene Explorer

![3D DNA visualization](docs/screenshots/02-gene-explorer-3d.jpg)
*Interactive double helix rendered with Three.js. Base pairs use the A/T/G/C colour spectrum applied consistently across the platform; the control rail toggles auto-rotate, reference grid, and backbone*

### Variant Analysis

![Variant analysis and trait predictions](docs/screenshots/03-variant-analysis.jpg)
*Connect genomic, health-record, and lifestyle sources, then run trait predictions. Every result carries an evidence grade*

### Anatomy Map

![3D anatomy visualization with evidence overlays](docs/screenshots/04-anatomy-map.jpg)
*Genomic associations projected onto anatomical structures. Node colour encodes evidence level — emerald (high), amber (medium), azure (low)*

### Data Import

![Genomic data import pipeline](docs/screenshots/05-import-data.jpg)
*Vendor-neutral ingest for VCF and TSV/CSV, with format requirements and the validate → parse → store → model pipeline made explicit*

### Learn Mode

![Guided educational tours](docs/screenshots/06-learn-mode.jpg)
*Guided tours through body systems, filterable by difficulty level and system*

### Sign In

![Sign in](docs/screenshots/07-sign-in.jpg)
*Authentication with MFA support and enterprise SSO options*

---

## Overview

HumanDNAVisualizer is a **local-first, open-source platform** that enables individuals, researchers, and educators to explore genomic, phenotypic, and environmental data through **interactive 3D visualizations** and **transparent biological mapping models**.

The project emphasizes:

- Scientific honesty over overclaiming
- Vendor-neutral data compatibility
- Evidence-labeled associations
- Privacy-first, offline-capable architecture

Rather than producing clinical conclusions, HumanDNAVisualizer focuses on **making complex biological data visible, navigable, and explainable**.

---

## What Makes HumanDNAVisualizer Different?

Unlike proprietary tools or black-box analytics platforms, HumanDNAVisualizer:

- **Visualizes** biological associations instead of diagnosing
- **Labels uncertainty and evidence levels**
- **Separates data, logic, and interpretation**
- **Processes data locally by default**
- **Supports learning, research, and exploration**
- **Avoids vendor lock-in, proprietary SDKs, and ToS violations**

---

## Key Features

- **Data Import (User-Provided)**

  - Genomic variants (VCF, generic genotype TSV/CSV)
  - Phenotypic records (FHIR-compatible JSON)
  - Environmental and lifestyle data (CSV)

- **3D Visualization**

  - Interactive 3D models (Three.js)
  - Organ and system highlighting
  - Layered overlays with evidence labels

- **Evidence-Labeled Biological Mapping**

  - Variant → pathway → system associations
  - Explicit certainty levels (High / Medium / Low)
  - Source references for supported biology

- **AI-Assisted Explanations**

  - Natural-language summaries of _what is being visualized_
  - No autonomous conclusions or prescriptions
  - Clear labeling of AI-generated content

- **Privacy & Security**
  - Local-first processing
  - Encryption at rest
  - No default cloud uploads

---

## Supported Data Formats

### Genomic Data

HumanDNAVisualizer provides **vendor-neutral import capabilities** for genomic variant data. The platform supports flexible column mapping and validation for various file formats:

- **VCF (Variant Call Format)** - `.vcf` and `.vcf.gz`
  - Supports VCF 4.x standard format
  - Extracts chromosome, position, rsID, reference/alternate alleles, quality scores, and genotypes
  - Automatic genome build detection from header metadata
  - Strict and lenient validation modes

- **Generic Genotype Files** - TSV or CSV format
  - Flexible column naming (e.g., `rsid`/`snp`/`variant`, `chromosome`/`chrom`/`chr`, `position`/`pos`)
  - Supports genotype formats: `AA`, `AG`, `A/G`, `A|G`
  - Can use either combined genotype column or separate allele columns
  - Automatic delimiter detection (tab or comma)

**Import Features:**
- Row-level error reporting with line numbers
- SHA-256 file hashing for integrity verification
- Provenance tracking (parser version, import timestamp, source format)
- Configurable validation (strict mode fails on first error; lenient mode collects all errors)

> Users are responsible for ensuring they have the right to use and process uploaded genetic data. All imports are for educational and research purposes only.

### Phenotypic Data

- **FHIR R4-compatible JSON**

### Environmental Data

- **CSV / JSON**

---

## Architecture Overview

```
HumanDNAVisualizer/
├── backend/
├── frontend/
├── ai-service/
├── llm-service/
├── database/
├── spec/
└── .claude/
```

---

## Tech Stack

| Layer          | Technology           |
| -------------- | -------------------- |
| Frontend       | React 18, Three.js   |
| Backend        | Java 17, Spring Boot |
| AI Services    | Python 3.10, FastAPI |
| Database       | PostgreSQL / SQLite  |
| Infrastructure | Docker               |

---

## Quick Start

### Prerequisites
- **Java 17** or higher
- **Node.js 18** or higher
- **Maven 3.8+**
- **8GB RAM minimum** (for development)

### Start Demo Mode (Fastest Way)

**Windows:**
```bash
start-demo.bat
```

**Linux/Mac:**
```bash
./start-demo.sh
```

This will start:
- Backend API on `http://localhost:8081`
- Frontend on `http://localhost:3000`
- AI Model Service on `http://localhost:8000`

**Demo Users (auto-created):**
- Username: `demo` / Password: `demo123` (USER)
- Username: `admin` / Password: `admin123` (ADMIN)
- Username: `moderator` / Password: `mod123` (MODERATOR)

### UI-Only Demo (No Backend Required)

To browse the interface without Java, Maven, or a database — useful for design review and screenshots:

```bash
npm run dev:demo --prefix frontend
```

This runs the frontend at `http://localhost:3000` with `VITE_MOCK_API=true`, routing every API and
auth call through local fixtures in `frontend/src/mocks/`. Sign in with the same demo credentials
listed above; a banner in the UI marks the session as mock data and lists the accounts.

Nothing leaves your machine, and the mock layer is inert in normal `npm run dev` / `npm run build`.

### Manual Setup

**1. Start Backend:**
```bash
cd backend/dna-integrator
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

**2. Start Frontend:**
```bash
cd frontend
npm install
npm run dev
```

**3. Access the Application:**
- Frontend: http://localhost:3000
- Swagger UI: http://localhost:8081/swagger-ui.html
- H2 Database Console: http://localhost:8081/h2-console

### First Steps

1. **Login** with demo credentials at http://localhost:3000
2. **Upload genomic data** (VCF or TSV file)
3. **View 3D anatomy visualization** with variant overlays
4. **Try Learn Mode** for guided educational tours

> For detailed setup instructions, see [QUICK-START-DEMO.md](QUICK-START-DEMO.md)

---

## Legal & Licensing

- **License:** AGPL-3.0-or-later (GNU Affero General Public License v3.0 or later)
- **Copyright:** Cornmeister LLC
- **Contact:** sekacorn@gmail.com
- No proprietary SDKs or datasets
- Vendor-neutral file format compatibility

See LICENSE file for complete terms.

---

**HumanDNAVisualizer exists to make biology visible — not to replace human judgment.**
