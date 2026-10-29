/**
 * AROVA DESIGN SYSTEM — ARENOVA BRAND TOKENS
 * Obsidian × Ember × Intelligence
 */

export const ARENOVA_TOKENS = {
  colors: {
    // Canvas & Surfaces
    deepObsidian: '#080505',
    charcoalBase: '#111110',
    elevatedSurface: '#161514',
    surfaceSecondary: '#1C1916',
    surfaceRaised: '#211B17',
    surfaceHover: '#26201B',
    glassSurface: 'rgba(24, 23, 22, 0.8)',
    glassEmberSurface: 'rgba(28, 25, 22, 0.85)',

    // Typography & Ink
    primaryText: '#F3F0E8',
    secondaryText: '#D0CBC1',
    mutedText: '#A39E93',
    technicalText: '#9E9B93',

    // Phoenix Ember Accents
    flameOrange: '#E84B2C',
    orangeHover: '#D94022',
    burnishedCopper: '#C86938',
    radiantAmber: '#FFAA3D',
    editorialGold: '#D4AF37',

    // Functional & Status
    success: '#34D399',
    error: '#E84B2C',
    warning: '#FFAA3D',
    info: '#C86938',

    // Borders
    subtleBorder: 'rgba(243, 240, 232, 0.08)',
    standardBorder: 'rgba(243, 240, 232, 0.12)',
    hoverBorder: 'rgba(243, 240, 232, 0.20)',
    activeBorder: 'rgba(232, 75, 44, 0.35)',
    amberBorder: 'rgba(255, 170, 61, 0.28)',
  },

  fonts: {
    display: 'var(--font-syne)',
    sans: 'var(--font-sans)',
    editorial: 'var(--font-cinzel)',
    mono: 'var(--font-mono)',
  },

  radii: {
    sm: '6px',
    md: '10px',
    lg: '14px',
    xl: '20px',
    full: '9999px',
  },

  shadows: {
    subtle: '0 4px 20px rgba(0, 0, 0, 0.4), 0 1px 3px rgba(0, 0, 0, 0.3)',
    elevated: '0 12px 36px -4px rgba(0, 0, 0, 0.6), 0 4px 12px -2px rgba(0, 0, 0, 0.4)',
    emberAmbient: '0 0 60px 10px rgba(232, 75, 44, 0.10)',
    emberAccent: '0 0 35px -5px rgba(232, 75, 44, 0.25)',
    amberGlow: '0 0 35px rgba(255, 170, 61, 0.20)',
  },
} as const;

export type ArenovaColors = typeof ARENOVA_TOKENS.colors;

