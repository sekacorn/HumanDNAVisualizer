/**
 * Frontend demo mode.
 *
 * When `VITE_MOCK_API=true`, `services/api.js` and `services/authService.js`
 * route through here instead of hitting the Java backend, so the whole UI can
 * be exercised with no database, no AI service and no LLM service running.
 *
 * Every function returns the same `{ data }` envelope axios produces, so the
 * calling components need no mock-specific branches.
 */

import {
  DEMO_USERS,
  SAMPLES,
  GENOMIC_VARIANTS,
  PREDICTIONS,
  ANATOMY_GRAPH,
  ANATOMY_STATS,
  LLM_REPLIES,
  DEFAULT_LLM_REPLY,
  EXPLANATION,
} from './fixtures'

/**
 * Inlined as a literal boolean by Vite's `define` (see vite.config.js), so that
 * outside demo builds every guard folds to `false` and this whole module —
 * fixtures and demo credentials included — is dropped from the bundle.
 */
export const MOCK_ENABLED = __MOCK_API__

const SAMPLES_KEY = 'mock_samples'

/** Simulated latency so loading and progress states are actually visible. */
const delay = (ms = 420) => new Promise((resolve) => setTimeout(resolve, ms))

const ok = async (data, ms) => {
  await delay(ms)
  return { data }
}

/** Mirrors an axios error closely enough for the existing `catch` blocks. */
const fail = async (message, status = 400) => {
  await delay(300)
  const error = new Error(message)
  error.response = { status, data: { message } }
  throw error
}

// --- Sample store (survives reloads so deletes and imports feel real) -------

function readSamples() {
  try {
    const raw = localStorage.getItem(SAMPLES_KEY)
    if (raw) return JSON.parse(raw)
  } catch {
    // Corrupt entry — fall through and reseed.
  }
  localStorage.setItem(SAMPLES_KEY, JSON.stringify(SAMPLES))
  return [...SAMPLES]
}

function writeSamples(samples) {
  localStorage.setItem(SAMPLES_KEY, JSON.stringify(samples))
}

// --- Auth -------------------------------------------------------------------

export const mockAuth = {
  async register(username, email, password) {
    await delay()

    if (DEMO_USERS.some((u) => u.username === username)) {
      return { success: false, error: 'Username already taken (demo user)' }
    }
    if (!password || password.length < 8) {
      return { success: false, error: 'Password must be at least 8 characters long' }
    }

    return {
      success: true,
      data: { username, email, message: 'Registration successful (demo mode)' },
    }
  },

  async login(username, password) {
    await delay()

    const match = DEMO_USERS.find((u) => u.username === username && u.password === password)
    if (!match) {
      return {
        success: false,
        error: 'Invalid credentials. Demo mode accepts demo/demo123, admin/admin123 or moderator/mod123.',
      }
    }

    const { password: _password, ...user } = match
    return {
      success: true,
      data: { token: `demo-token.${user.userId}`, user },
    }
  },
}

// --- Data APIs ---------------------------------------------------------------

export const mockApi = {
  uploadVCF: (file) =>
    ok({ success: true, recordsProcessed: GENOMIC_VARIANTS.length * 1140, fileName: file?.name }, 900),

  uploadFHIR: () => ok({ success: true, recordsProcessed: 42 }),

  uploadCSV: (file) => ok({ success: true, recordsProcessed: 128, fileName: file?.name }, 700),

  getGenomicData: () => ok(GENOMIC_VARIANTS),

  getPhenotypicData: () =>
    ok([
      { code: 'height_cm', value: 178 },
      { code: 'resting_hr', value: 62 },
    ]),

  getEnvironmentalData: () =>
    ok([
      { factor: 'activity_minutes_week', value: 210 },
      { factor: 'sleep_hours_mean', value: 7.1 },
    ]),

  predictTraits: (userId) => ok({ ...PREDICTIONS, user_id: userId }, 1100),

  queryLLM: (request) => {
    const query = request?.query || ''
    const hit = LLM_REPLIES.find((r) => r.match.test(query)) || DEFAULT_LLM_REPLY
    return ok(
      {
        response: hit.response,
        suggestions: hit.suggestions,
        personality: request?.personality_preference,
      },
      850
    )
  },

  getAnatomyGraph: (sampleId) => ok({ ...ANATOMY_GRAPH, sampleId: Number(sampleId) || sampleId }),

  getAnatomyGraphStats: (sampleId) =>
    ok({ ...ANATOMY_STATS, sampleId: Number(sampleId) || sampleId }),

  listUserSamples: () => ok(readSamples()),

  getSample: (sampleId) => {
    const found = readSamples().find((s) => String(s.id) === String(sampleId))
    return found ? ok(found) : fail(`Sample ${sampleId} not found`, 404)
  },

  deleteSample: (sampleId) => {
    const remaining = readSamples().filter((s) => String(s.id) !== String(sampleId))
    writeSamples(remaining)
    return ok({ success: true, deletedId: sampleId }, 600)
  },

  importVCF: (file) => {
    const samples = readSamples()
    const sample = {
      id: Math.max(0, ...samples.map((s) => s.id)) + 1,
      importFormat: 'vcf',
      importStatus: 'SUCCESS',
      importedAt: new Date().toISOString(),
      variantCount: 512480,
      genomeBuild: 'GRCh38/hg38',
      parserVersion: '2.4.1',
      fileHash: Math.random().toString(16).slice(2).padEnd(32, '0').slice(0, 32),
      label: file?.name || 'imported.vcf',
      assay: 'Imported in demo mode',
    }
    writeSamples([sample, ...samples])
    return ok(
      {
        sampleId: sample.id,
        variantCount: sample.variantCount,
        message: 'VCF file imported successfully (demo mode)',
      },
      1400
    )
  },

  importGenotype: (file) => {
    const samples = readSamples()
    const sample = {
      id: Math.max(0, ...samples.map((s) => s.id)) + 1,
      importFormat: 'csv',
      importStatus: 'SUCCESS',
      importedAt: new Date().toISOString(),
      variantCount: 640231,
      genomeBuild: 'GRCh37/hg19',
      parserVersion: '2.4.1',
      fileHash: Math.random().toString(16).slice(2).padEnd(32, '0').slice(0, 32),
      label: file?.name || 'imported.csv',
      assay: 'Imported in demo mode',
    }
    writeSamples([sample, ...samples])
    return ok(
      {
        sampleId: sample.id,
        variantCount: sample.variantCount,
        message: 'Genotype file imported successfully (demo mode)',
      },
      1400
    )
  },

  explainVisualization: (anatomyGraph, userQuestion, style) =>
    ok({ ...EXPLANATION, style: style || 'detailed', question: userQuestion }, 900),
}

/** Reseed the sample store — used by the demo banner's reset control. */
export function resetMockData() {
  localStorage.removeItem(SAMPLES_KEY)
}
