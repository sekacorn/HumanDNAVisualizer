/** @type {import('tailwindcss').Config} */
// Design system: "Genomic Command Center" (Glassmorphic Command / Living Blueprint).
//
// This file is the source of truth for the palette, type scale and spacing rhythm.
// It was derived from the original Stitch design export; that export is no longer
// in the repo, so change tokens here rather than looking for an upstream file.
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // --- Surfaces (Obsidian tonal ladder) ---
        'surface': '#131315',
        'surface-dim': '#131315',
        'surface-bright': '#2a3a4f',
        'surface-container-lowest': '#0d0e10',
        'surface-container-low': '#1b1b1d',
        'surface-container': '#1f2021',
        'surface-container-high': '#292a2b',
        'surface-container-highest': '#343536',
        'surface-variant': '#343536',
        'surface-tint': '#b7c8e1',
        'background': '#131315',

        // --- Content ---
        'on-surface': '#e4e2e4',
        'on-surface-variant': '#c4c6cd',
        'on-background': '#e4e2e4',
        'inverse-surface': '#e4e2e4',
        'inverse-on-surface': '#303032',

        // --- Outlines ---
        'outline': '#8e9197',
        'outline-variant': '#44474c',
        'glass-border': 'rgba(255, 255, 255, 0.1)',

        // --- Primary (Deep space azure) ---
        'primary': '#b7c8e1',
        'on-primary': '#213146',
        'primary-container': '#031427',
        'on-primary-container': '#6f7f97',
        'inverse-primary': '#505f76',
        'primary-fixed': '#d3e4fe',
        'primary-fixed-dim': '#b7c8e1',
        'on-primary-fixed': '#0b1c30',
        'on-primary-fixed-variant': '#38485d',

        // --- Secondary (Adenine emerald) ---
        'secondary': '#4edea3',
        'on-secondary': '#003824',
        'secondary-container': '#00b47d',
        'on-secondary-container': '#003e28',
        'secondary-fixed': '#6ffbbe',
        'secondary-fixed-dim': '#4edea3',
        'on-secondary-fixed': '#002114',
        'on-secondary-fixed-variant': '#005236',

        // --- Tertiary (Warm amber-sand) ---
        'tertiary': '#ecbda1',
        'on-tertiary': '#472916',
        'tertiary-container': '#240d01',
        'on-tertiary-container': '#9e755e',
        'tertiary-fixed': '#ffdbc8',
        'tertiary-fixed-dim': '#ecbda1',
        'on-tertiary-fixed': '#2e1505',
        'on-tertiary-fixed-variant': '#603f2b',

        // --- Error (Thymine crimson) ---
        'error': '#ffb4ab',
        'on-error': '#690005',
        'error-container': '#93000a',
        'on-error-container': '#ffdad6',

        // --- DNA base-pair spectrum (data signification only) ---
        'adenine-emerald': '#4edea3',
        'thymine-crimson': '#ffb4ab',
        'guanine-amber': '#ffb400',
        'cytosine-azure': '#adc6ff',
      },

      fontFamily: {
        'display-xl': ['Inter', 'system-ui', 'sans-serif'],
        'headline-lg': ['Inter', 'system-ui', 'sans-serif'],
        'headline-md': ['Inter', 'system-ui', 'sans-serif'],
        'body-lg': ['Inter', 'system-ui', 'sans-serif'],
        'body-md': ['Inter', 'system-ui', 'sans-serif'],
        'label-caps': ['Inter', 'system-ui', 'sans-serif'],
        'code-mono': ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },

      fontSize: {
        'display-xl': ['48px', { lineHeight: '1.1', letterSpacing: '-0.04em', fontWeight: '800' }],
        'headline-lg': ['32px', { lineHeight: '1.2', letterSpacing: '-0.02em', fontWeight: '700' }],
        'headline-md': ['24px', { lineHeight: '1.3', fontWeight: '600' }],
        'body-lg': ['18px', { lineHeight: '1.6', fontWeight: '400' }],
        'body-md': ['16px', { lineHeight: '1.5', fontWeight: '400' }],
        'label-caps': ['12px', { lineHeight: '1', letterSpacing: '0.1em', fontWeight: '600' }],
        'code-mono': ['14px', { lineHeight: '1.5', fontWeight: '400' }],
      },

      spacing: {
        'margin': '2rem',
        'bento-gap': '1.5rem',
        'card-padding': '1.5rem',
        'section-stack': '4rem',
        'sidebar-width': '280px',
        'bottom-nav': '5.5rem',
      },

      borderRadius: {
        DEFAULT: '0.25rem',
        'card': '0.75rem',
      },

      backdropBlur: {
        glass: '12px',
        'glass-elevated': '24px',
      },

      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'glass-elevated': '0 16px 48px 0 rgba(0, 0, 0, 0.5)',
        'glow-adenine': '0 0 12px rgba(78, 222, 163, 0.45)',
        'glow-thymine': '0 0 12px rgba(255, 180, 171, 0.45)',
        'glow-guanine': '0 0 12px rgba(255, 180, 0, 0.45)',
        'glow-cytosine': '0 0 12px rgba(173, 198, 255, 0.45)',
      },

      keyframes: {
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(200%)' },
        },
        scan: {
          '0%': { left: '-100%' },
          '100%': { left: '200%' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '1', filter: 'brightness(1)' },
          '50%': { opacity: '0.75', filter: 'brightness(1.35)' },
        },
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in-left': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
      },

      animation: {
        shimmer: 'shimmer 2s infinite',
        scan: 'scan 0.6s ease-out',
        'pulse-glow': 'pulse-glow 2.4s ease-in-out infinite',
        'fade-up': 'fade-up 0.4s ease-out both',
        'slide-in-left': 'slide-in-left 0.25s ease-out both',
        float: 'float 4s ease-in-out infinite',
      },

      maxWidth: {
        'command': '1600px',
      },
    },
  },
  plugins: [],
}
