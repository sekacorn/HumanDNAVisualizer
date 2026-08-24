/**
 * Single source of truth for navigation across the desktop sidebar, the mobile
 * bottom bar and the mobile drawer. Keeping one model avoids the three
 * surfaces drifting apart as routes are added.
 */

export const primaryNav = [
  {
    to: '/',
    label: 'Dashboard',
    icon: 'dashboard',
    requiresAuth: false,
    end: true,
    description: 'Mission overview and session status',
  },
  {
    to: '/explore',
    label: 'Gene Explorer',
    shortLabel: 'Explore',
    icon: 'biotech',
    requiresAuth: true,
    description: 'Interactive 3D double-helix viewport',
  },
  {
    to: '/analyze',
    label: 'Variant Analysis',
    shortLabel: 'Analyze',
    icon: 'analytics',
    requiresAuth: true,
    description: 'AI trait predictions and variant impact',
  },
  {
    to: '/anatomy',
    label: 'Anatomy Map',
    shortLabel: 'Anatomy',
    icon: 'monitor_heart',
    requiresAuth: true,
    description: 'Trait overlays projected onto body systems',
  },
]

export const dataNav = [
  {
    to: '/import',
    label: 'Import Data',
    shortLabel: 'Import',
    icon: 'cloud_upload',
    requiresAuth: true,
    description: 'VCF, FHIR and lifestyle ingest pipeline',
  },
  {
    to: '/samples',
    label: 'Sample Library',
    shortLabel: 'Samples',
    icon: 'science',
    requiresAuth: true,
    description: 'Managed datasets and demo cohorts',
  },
  {
    to: '/learn',
    label: 'Learn Mode',
    shortLabel: 'Learn',
    icon: 'school',
    requiresAuth: false,
    description: 'Guided tours through genomic concepts',
  },
]

export const allNav = [...primaryNav, ...dataNav]

/** Bottom bar holds at most five destinations — anything else lives in the drawer. */
export const mobileTabs = [
  primaryNav[0], // Dashboard
  primaryNav[1], // Explore
  primaryNav[2], // Analyze
  dataNav[0], // Import
  dataNav[2], // Learn
]

export const footerNav = [
  { to: '/learn', label: 'Documentation', icon: 'help' },
  { to: '/learn', label: 'Support', icon: 'contact_support' },
]
