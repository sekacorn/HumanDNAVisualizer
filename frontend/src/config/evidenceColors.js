/**
 * Colour tokens for anatomy rendering.
 *
 * Kept out of the 3D component so tests and non-WebGL code can import them
 * without pulling in three.js.
 */

/**
 * Evidence levels borrow the DNA base-pair spectrum, so a colour means the same
 * thing here as it does everywhere else in the app.
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

/** Relative size of each structure tier in the scene. */
export const NODE_TYPE_SCALE = {
  SYSTEM: 1.0,
  ORGAN: 0.8,
  SUBSTRUCTURE: 0.6,
}

export const DEFAULT_NODE_SCALE = 0.7
