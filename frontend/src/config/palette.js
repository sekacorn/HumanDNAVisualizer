/**
 * Colour and scale tokens consumed from JavaScript.
 *
 * These live outside component files for two reasons: tests and non-WebGL code
 * can import them without pulling in three.js, and React Fast Refresh only
 * works when a module exports components alone.
 *
 * Values mirror the Tailwind theme in tailwind.config.js — change both together.
 */

/**
 * DNA base-pair spectrum. Colour here is data signification, not decoration:
 * each base keeps its hue everywhere in the app.
 */
export const BASE_COLORS = {
  A: '#4edea3', // adenine — emerald
  T: '#ffb4ab', // thymine — crimson
  G: '#ffb400', // guanine — amber
  C: '#adc6ff', // cytosine — azure
}

/**
 * Evidence levels borrow the same spectrum, so a colour means the same thing
 * on the anatomy map as it does on the helix.
 */
export const EVIDENCE_COLORS = {
  HIGH: '#4edea3', // adenine emerald
  MEDIUM: '#ffb400', // guanine amber
  LOW: '#adc6ff', // cytosine azure
}

/** Unhighlighted anatomy sits in the neutral surface ladder so overlays pop. */
export const NODE_TYPE_COLORS = {
  SYSTEM: '#b7c8e1', // primary
  ORGAN: '#8e9197', // outline
  SUBSTRUCTURE: '#44474c', // outline variant
}

/** Relative size of each structure tier in the anatomy scene. */
export const NODE_TYPE_SCALE = {
  SYSTEM: 1.0,
  ORGAN: 0.8,
  SUBSTRUCTURE: 0.6,
}

export const DEFAULT_NODE_SCALE = 0.7

/** Sugar-phosphate backbone in the helix viewer. */
export const BACKBONE_COLOR = '#b7c8e1'
