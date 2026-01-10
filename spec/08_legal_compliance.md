# Legal Compliance Specification

**Document Version:** 1.0.0
**Last Updated:** 2025-01-09
**Status:** Active

---

## Overview

This document specifies the legal compliance requirements and automated guardrails for the HumanDNAVisualizer project. The system must maintain strict educational/research boundaries, vendor neutrality, and data privacy compliance.

**Core Principle:** This platform is for educational and research visualization only. It does NOT provide medical diagnosis, treatment recommendations, or health advice.

---

## 1. Prohibited Medical Language

### 1.1 Forbidden Terms

The following terms are **prohibited** in all user-facing content (UI, documentation, error messages):

**Medical Claims:**
-  "diagnose" / "diagnosis" / "diagnostic"
-  "treat" / "treatment" / "therapy"
-  "cure" / "healing"
-  "prescribe" / "prescription"
-  "recommend" (in medical context)
-  "you should" (in health context)
-  "medical advice"
-  "health advice"
-  "lifestyle advice"

**Risk/Prediction Language:**
-  "risk score"
-  "risk level"
-  "disease risk"
-  "health risk"
-  "at risk for"
-  "predicts disease"
-  "likely to develop"
-  "prognosis"

**Action-Oriented Health Terms:**
-  "prevent disease"
-  "avoid condition"
-  "improve health by"
-  "reduce risk by"

### 1.2 Approved Alternative Language

Use these terms instead:

** Approved Terms:**
- "association" (not "risk")
- "evidence level" (not "confidence" or "certainty")
- "model" / "data model"
- "visualization" / "educational visualization"
- "research purposes"
- "genomic-anatomic association"
- "variant" (not "mutation")
- "structure" (anatomical)
- "overlay" (visualization term)

** Approved Phrases:**
- "This visualization shows associations..."
- "Evidence quality: HIGH/MEDIUM/LOW"
- "For educational and research purposes only"
- "Not for medical diagnosis or treatment"
- "Consult qualified healthcare professionals for medical decisions"

---

## 2. Vendor-Neutral Requirements

### 2.1 Prohibited Vendor References

**No SDK Integration:**
-  23andMe API/SDK
-  AncestryDNA API/SDK
-  MyHeritage API/SDK
-  Living DNA API/SDK
-  FamilyTreeDNA API/SDK
-  Nebula Genomics API/SDK
-  Color Genomics API/SDK
-  Helix API/SDK

**No Data Scraping:**
-  Automated scraping of vendor websites
-  Scraping user accounts from testing services
-  Harvesting data from commercial platforms

**No Trademark Infringement:**
-  Using vendor names in marketing materials
-  Implying partnerships or endorsements
-  Using vendor logos or branding

### 2.2 Allowed Vendor Mentions

Vendor names may ONLY appear in:
- Import format documentation (neutral technical context)
- Disclaimer sections stating "not affiliated with..."
- Educational comparisons of file formats

**Example Allowed Usage:**
```
"This platform accepts VCF files from various sources including, but not limited to,
consumer genetic testing services. We are not affiliated with any genetic testing
company and do not access their proprietary systems."
```

### 2.3 User-Provided Data Only

** Allowed Data Sources:**
- User-uploaded VCF files
- User-uploaded TSV/CSV files
- User-provided FHIR genomic resources
- Manually entered genotype data

** Prohibited Data Sources:**
- Direct API integration with vendors
- Automated account access
- Web scraping
- Third-party data brokers
- Proprietary databases (unless open-licensed)

---

## 3. Data Privacy Compliance

### 3.1 GDPR Compliance (EU/EEA)

**General Data Protection Regulation Requirements:**

**Right to Access (Article 15):**
- Users can request all data stored about them
- Provide data export functionality
- Response within 30 days

**Right to Erasure (Article 17 - "Right to be Forgotten"):**
- Users can delete their account and all data
- Complete data removal within reasonable timeframe
- Cascade deletion of associated genomic data

**Right to Data Portability (Article 20):**
- Export user data in machine-readable format (JSON, CSV)
- Allow transfer to other services

**Data Minimization (Article 5):**
- Collect only necessary data
- No unnecessary tracking
- Purpose limitation

**Consent (Article 6-7):**
- Clear, specific consent for data processing
- Easy to withdraw consent
- Granular consent options (separate for different purposes)

**Privacy by Design (Article 25):**
- Encryption at rest and in transit
- Pseudonymization where possible
- Security measures documented

**Data Protection Officer (if required):**
- If processing >5000 data subjects in EU/EEA
- Contact information publicly available

**International Transfers (Article 44-50):**
- If transferring data outside EU/EEA, use Standard Contractual Clauses
- Document legal basis for transfers

### 3.2 CCPA/CPRA Compliance (California)

**California Consumer Privacy Act (as amended) Requirements:**

**Right to Know (§1798.100):**
- Disclose categories of personal information collected
- Disclose sources of personal information
- Disclose business purposes for collection
- Disclose categories of third parties (if any)

**Right to Delete (§1798.105):**
- Users can request deletion
- Exceptions: legal obligations, research (with consent)
- Confirm deletion within 45 days

**Right to Opt-Out (§1798.120):**
- "Do Not Sell or Share My Personal Information" link
- (Not applicable if no data selling/sharing occurs)

**Right to Correct (CPRA §1798.106):**
- Users can request inaccurate data correction

**Right to Limit Use of Sensitive Personal Information (CPRA §1798.121):**
- Genetic data is "sensitive personal information"
- Provide opt-out for uses beyond necessary purposes

**Disclosure Requirements (§1798.130):**
- Privacy notice must be accessible
- Updated at least annually
- Available in languages served (if >threshold)

**Accessibility (CPRA requirement):**
- Privacy notice must meet WCAG 2.1 Level AA standards
- Ensure screen reader compatibility
- Keyboard navigation support

**Verify Consumer Requests (§1798.140):**
- Reasonable authentication to prevent fraud
- At least 2-step verification for deletion

**Non-Discrimination (§1798.125):**
- Cannot deny service for exercising privacy rights
- Cannot charge different prices
- Cannot provide different quality

### 3.3 Additional Jurisdictions

**Other US States with Privacy Laws:**
- **Virginia (VCDPA)**
- **Colorado (CPA)**
- **Connecticut (CTDPA)**
- **Utah (UCPA)**

**Similar requirements:** Right to access, delete, correct, opt-out

**General Best Practice:**
- Comply with most stringent law (typically GDPR/CPRA)
- Apply protections globally, not just in specific regions

### 3.4 Genetic Information Non-Discrimination Act (GINA)

**Note:** GINA (US federal law) prohibits discrimination based on genetic information by health insurers and employers.

**Platform Obligations:**
- Warn users about potential misuse of genetic data
- Recommend not sharing data with unauthorized parties
- Disclaimer about limited protections (GINA doesn't cover life, disability, long-term care insurance)

### 3.5 Required Privacy Notices

**At Data Collection:**
```
"By uploading genomic data, you consent to processing for educational
visualization purposes. Your data is stored securely and will not be
shared with third parties without your explicit consent. You may request
deletion at any time. See our Privacy Policy for details."
```

**At Account Creation:**
```
"We collect: email, username, genomic data files (VCF/TSV/CSV).
We use this data for: educational visualization and research.
We do NOT sell or share your data. You have the right to access, delete,
correct, and export your data. See Privacy Policy for exercising these rights."
```

### 3.6 Data Retention Policy

**Default Retention:**
- Active accounts: Data retained indefinitely (until deletion request)
- Inactive accounts (>2 years no login): Send deletion notice, delete after 90 days if no response
- Deleted accounts: Immediate removal from production, backups purged within 30 days

**Audit Logs:**
- Retain for legal compliance (typically 1-3 years)
- Pseudonymized where possible

**Research Data:**
- If user opted into research use: Retain until study completion or withdrawal
- Must be de-identified/anonymized for long-term research

---

## 4. Required Disclaimers

### 4.1 Primary Disclaimer (Always Visible)

**Location:** Top of every page, or persistent banner

```
 EDUCATIONAL/RESEARCH USE ONLY

This platform provides educational visualizations of genomic data.
It is NOT a medical device and does NOT provide medical diagnosis,
treatment advice, or health recommendations. All associations are
labeled with evidence quality to indicate uncertainty. For medical
decisions, always consult qualified healthcare professionals.
```

### 4.2 Upload Disclaimer

**Location:** File upload pages

```
📋 DATA PRIVACY NOTICE

By uploading genomic data, you acknowledge:
- This is an educational/research tool, not a medical service
- Data is stored securely but you are responsible for its sensitivity
- You have the right to delete your data at any time
- We do not sell or share your data with third parties
- Genetic data may have implications for family members; use responsibly

By clicking "Upload," you consent to our Terms of Service and Privacy Policy.
```

### 4.3 Visualization Disclaimer

**Location:** Anatomy viewer, 3D visualizations

```
📊 VISUALIZATION DISCLAIMER

This 3D visualization shows genomic-anatomic associations from current
data models. These are NOT medical predictions or diagnoses. Evidence
levels (HIGH/MEDIUM/LOW) indicate association strength from research,
not medical certainty. Educational and research purposes only.
```

### 4.4 AI/LLM Explanation Disclaimer

**Location:** Explanation modals

```
🤖 AI-ASSISTED EXPLANATION

This explanation is generated for educational purposes. It describes
associations from data models, not medical advice. The system has
safety filters to prevent medical claims. For health decisions,
consult qualified healthcare professionals.
```

### 4.5 Vendor Neutrality Disclaimer

**Location:** About page, documentation

```
🔒 VENDOR-NEUTRAL PLATFORM

HumanDNAVisualizer is an independent educational tool. We are NOT
affiliated with, endorsed by, or partnering with any genetic testing
company including but not limited to: 23andMe, AncestryDNA, MyHeritage,
or others. We accept user-provided data files only and do not access
vendor APIs or proprietary systems.
```

### 4.6 GINA Disclaimer

**Location:** FAQ, privacy policy

```
⚖️ GENETIC DISCRIMINATION PROTECTIONS

In the United States, the Genetic Information Nondiscrimination Act (GINA)
prohibits discrimination by health insurers and employers based on genetic
information. However, GINA does NOT cover life, disability, or long-term
care insurance. Be cautious about sharing genetic data and understand your
local legal protections. This platform is for educational purposes and does
not provide legal advice.
```

---

## 5. Content Linting Rules

### 5.1 Automated Checks

The content linter must scan:
- All markdown files (`*.md`)
- All React/JavaScript UI files (`*.jsx`, `*.js`, `*.tsx`, `*.ts`)
- All Python backend files (`*.py`)
- README files
- Documentation

**Exceptions:**
- Files in `spec/` directory (this document contains forbidden terms for reference)
- Files named `LEGAL_COMPLIANCE.md`, `PRIVACY_POLICY.md`, `TERMS_OF_SERVICE.md`
- Test files containing expected violations
- Comments explaining what NOT to do

### 5.2 Severity Levels

**ERROR (Fail CI):**
- Medical claim terms in user-facing text
- Vendor API/SDK references in code
- Missing required disclaimers

**WARNING (Pass but notify):**
- Vendor name in non-disclaimer context
- Ambiguous language that could be medical
- Missing evidence labels on biological claims

### 5.3 Exclusion Patterns

Allow terms in these contexts:
- Within code comments explaining violations: `// Don't use "diagnose" here`
- In disclaimer text: `"not for diagnosis"`
- In test assertions: `expect(text).not.toContain("diagnose")`
- In legal documentation: This file

---

## 6. Trademark and Brand Guidelines

### 6.1 Platform Naming

**Official Name:** HumanDNAVisualizer

**Allowed Variations:**
- Human DNA Visualizer
- DNA Visualizer (informal)

**Prohibited:**
- Any name implying medical use: "DNA Diagnostics", "Genetic Health Platform"
- Any name implying vendor affiliation: "23andMe Viewer", "Ancestry Importer"

### 6.2 Logo and Branding

**Requirements:**
- Must not resemble medical symbols (caduceus, red cross)
- Must not use vendor color schemes
- Should emphasize educational/research nature

**Approved Visual Themes:**
- Scientific visualization
- Educational graphics
- Data modeling
- Research iconography

### 6.3 Taglines

** Approved:**
- "Educational Genomic Visualization"
- "Research-Focused DNA Data Modeling"
- "Vendor-Neutral Genomic Data Platform"

** Prohibited:**
- "Know Your Health Risks"
- "Personalized Medical Insights"
- "The Better 23andMe Alternative"

---

## 7. Open Source Licensing

### 7.1 Code License

**Recommended:** MIT License or Apache 2.0

**Requirements:**
- Clearly state license in LICENSE file
- Include license headers in source files
- Maintain NOTICE file for attributions

### 7.2 Data License

**User-Uploaded Data:**
- Users retain all rights to their genomic data
- Platform has license to process for service provision
- Must delete upon request

**Platform-Generated Data:**
- Visualizations, models, rules: Can be open-sourced
- Do not include user-specific genomic data

### 7.3 Third-Party Dependencies

**Allowed:**
- Open-source libraries with compatible licenses
- No proprietary genomic databases
- Public reference genomes (GRCh37, GRCh38) OK

**Track:**
- Maintain dependency list
- Review licenses annually
- Document any copyleft implications

---

## 8. Incident Response

### 8.1 Medical Claim Violation

**If a medical claim appears in production:**

1. **Immediate:** Remove the violating content within 4 hours
2. **Investigation:** Determine how it bypassed linting
3. **Fix Linter:** Update rules to catch similar violations
4. **User Notice:** If users saw the claim, send correction notice
5. **Document:** Update incident log

### 8.2 Data Breach

**GDPR requires notification within 72 hours of discovery:**

1. **Contain:** Stop the breach, secure systems
2. **Assess:** Determine scope, affected users, data types
3. **Notify Authorities:** Report to supervisory authority (if EU/EEA users)
4. **Notify Users:** Inform affected users if high risk
5. **Remediate:** Fix vulnerability, prevent recurrence
6. **Document:** Full incident report

**CCPA requires notification without unreasonable delay:**
- If California residents affected, notify California Attorney General (if >500 residents)

### 8.3 Vendor Affiliation Claim

**If someone claims partnership/endorsement:**

1. **Cease and Desist:** Immediately stop any such claim
2. **Clarify:** Public statement of independence
3. **Update Disclaimers:** Strengthen vendor-neutral language
4. **Legal Review:** Consult attorney if vendor threatened action

---

## 9. Compliance Checklist

**Before Each Release:**

- [ ] Run content linter on all files
- [ ] Verify all disclaimers are present and visible
- [ ] Check no vendor SDKs in dependencies
- [ ] Ensure privacy policy is up-to-date
- [ ] Verify data deletion works end-to-end
- [ ] Test accessibility of privacy notices (WCAG 2.1 AA)
- [ ] Review new features for medical language
- [ ] Update changelog for legal-relevant changes

**Quarterly:**

- [ ] Review privacy policy for accuracy
- [ ] Audit data retention compliance
- [ ] Check for new privacy regulations
- [ ] Review third-party dependencies
- [ ] Test user data export functionality
- [ ] Verify GDPR/CCPA request handling

**Annually:**

- [ ] Full legal review with attorney (if budget allows)
- [ ] Update privacy policy publication date
- [ ] Review all jurisdictions served
- [ ] Assess need for DPO (GDPR) or privacy officer
- [ ] Audit all disclaimers for completeness

---

## 10. Contact Information

**Privacy Inquiries:**
- Email: privacy@humandnavisualizer.org (placeholder)
- Response time: Within 30 days (GDPR requirement)

**Data Subject Requests (GDPR/CCPA):**
- Portal: Account Settings → Privacy → Submit Request
- Email: privacy@humandnavisualizer.org
- Verification: 2-factor authentication required

**Legal Questions:**
- Email: legal@humandnavisualizer.org (placeholder)

**Data Protection Officer (if appointed):**
- Email: dpo@humandnavisualizer.org (placeholder)

---

## 11. Definitions

**Personal Information:** Information that identifies, relates to, or could reasonably be linked with a consumer or household (CCPA definition).

**Sensitive Personal Information:** Genetic data, health data, biometric data (CCPA/GDPR).

**Processing:** Any operation on personal data: collection, storage, use, disclosure, deletion (GDPR definition).

**User-Provided Data:** Data uploaded by users, not obtained from third parties.

**Vendor-Neutral:** No commercial affiliation, partnership, or data integration with genetic testing companies.

**Educational/Research Use:** Non-clinical purposes for learning, teaching, or scientific investigation.

---

## 12. Updates and Maintenance

**This Document:**
- Version: 1.0.0
- Review schedule: Quarterly
- Update trigger: New regulations, legal advice, incidents

**Changelog:**
- 2025-01-09: Initial version created
- [Future updates here]

---

## Appendix A: Accessibility Requirements (WCAG 2.1 Level AA)

**For Privacy Notices (CCPA/CPRA Requirement):**

1. **Perceivable:**
   - Text contrast ratio ≥4.5:1 for normal text
   - Text contrast ratio ≥3:1 for large text (18pt+)
   - Non-text content has text alternatives

2. **Operable:**
   - All functionality available via keyboard
   - No keyboard traps
   - Skip navigation links

3. **Understandable:**
   - Language of page identified (lang attribute)
   - Predictable navigation
   - Input assistance for errors

4. **Robust:**
   - Valid HTML
   - ARIA labels where needed
   - Compatible with assistive technologies

**Testing Tools:**
- WAVE (WebAIM)
- axe DevTools
- Lighthouse accessibility audit

---

**END OF LEGAL COMPLIANCE SPECIFICATION**

**Disclaimer:** This document provides guidance and is not legal advice. Consult a qualified attorney for compliance with specific jurisdictions. Laws change; maintain current knowledge.
