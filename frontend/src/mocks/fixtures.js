/**
 * Fixture data for frontend demo mode.
 *
 * Mirrors the shapes the real backend returns so components need no
 * mock-specific branches. Values are illustrative only — nothing here is real
 * genomic data or a real medical association.
 */

/** Demo accounts, matching the backend's demo-mode users (see DEMO-MODE-GUIDE.md). */
export const DEMO_USERS = [
  {
    username: 'demo',
    password: 'demo123',
    email: 'demo@demo.local',
    userId: 'demo-0001',
    roles: ['USER'],
  },
  {
    username: 'admin',
    password: 'admin123',
    email: 'admin@demo.local',
    userId: 'demo-0002',
    roles: ['ADMIN', 'USER'],
  },
  {
    username: 'moderator',
    password: 'mod123',
    email: 'moderator@demo.local',
    userId: 'demo-0003',
    roles: ['MODERATOR', 'USER'],
  },
]

export const SAMPLES = [
  {
    id: 8892,
    importFormat: 'vcf',
    importStatus: 'SUCCESS',
    importedAt: '2026-08-21T09:14:00Z',
    variantCount: 684213,
    genomeBuild: 'GRCh38/hg38',
    parserVersion: '2.4.1',
    fileHash: 'a91f3c7de4b52086cc17f9d0e3b41a55',
    label: 'SMPL-8892-ALPHA',
    assay: 'Whole genome · 30x coverage',
  },
  {
    id: 8893,
    importFormat: 'vcf',
    importStatus: 'PROCESSING',
    importedAt: '2026-08-22T16:02:00Z',
    variantCount: 128940,
    genomeBuild: 'GRCh38/hg38',
    parserVersion: '2.4.1',
    fileHash: 'c02b8ea14f7d3396ab5510e2f88c7741',
    label: 'SMPL-8893-BETA',
    assay: 'Exome · target capture',
  },
  {
    id: 8891,
    importFormat: 'csv',
    importStatus: 'FAILED',
    importedAt: '2026-08-20T11:47:00Z',
    variantCount: 0,
    genomeBuild: 'GRCh37/hg19',
    parserVersion: '2.3.9',
    fileHash: '5d7ac1980b3e64f2ba09cc71ed224f16',
    label: 'SMPL-8891-GAMMA',
    assay: 'RNA-Seq · quality check',
  },
]

export const GENOMIC_VARIANTS = [
  { chromosome: '1', position: 55516888, referenceAllele: 'G', alternateAllele: 'A', rsid: 'rs11591147' },
  { chromosome: '7', position: 117559590, referenceAllele: 'C', alternateAllele: 'T', rsid: 'rs113993960' },
  { chromosome: '9', position: 22125504, referenceAllele: 'G', alternateAllele: 'C', rsid: 'rs1333049' },
  { chromosome: '13', position: 32316461, referenceAllele: 'A', alternateAllele: 'G', rsid: 'rs28897696' },
  { chromosome: '17', position: 43093465, referenceAllele: 'T', alternateAllele: 'C', rsid: 'rs80357713' },
  { chromosome: '19', position: 44908684, referenceAllele: 'T', alternateAllele: 'C', rsid: 'rs429358' },
]

export const PREDICTIONS = {
  user_id: 'demo-0001',
  overall_risk_score: 0.42,
  model_version: 'trait-net-0.9.3',
  predictions: [
    {
      trait_name: 'Cardiovascular predisposition',
      risk_level: 'Moderate',
      confidence: 0.78,
      evidence_level: 'MEDIUM',
      description:
        'Two variants in the 9p21 locus are associated in published cohorts with modestly elevated coronary artery disease incidence. Effect sizes are small and heavily modified by lifestyle factors.',
      recommendations: [
        'Discuss a baseline lipid panel with your physician',
        'Regular aerobic activity shows the largest published effect modification',
        'Track blood pressure trends rather than single readings',
      ],
    },
    {
      trait_name: 'Caffeine metabolism',
      risk_level: 'Low',
      confidence: 0.91,
      evidence_level: 'HIGH',
      description:
        'CYP1A2 genotype is consistent with fast caffeine clearance. This is one of the better-replicated pharmacogenomic associations.',
      recommendations: [
        'Caffeine is likely cleared faster than average',
        'Timing matters less for sleep than in slow metabolizers',
      ],
    },
    {
      trait_name: 'Lactose tolerance',
      risk_level: 'Low',
      confidence: 0.88,
      evidence_level: 'HIGH',
      description:
        'The MCM6 regulatory variant associated with lactase persistence is present, consistent with continued lactase expression into adulthood.',
      recommendations: ['No dietary change indicated on genetic grounds alone'],
    },
    {
      trait_name: 'Type 2 diabetes predisposition',
      risk_level: 'High',
      confidence: 0.64,
      evidence_level: 'MEDIUM',
      description:
        'Several TCF7L2 risk alleles are present. Polygenic scores for type 2 diabetes explain only a fraction of population variance; family history and metabolic markers remain far more informative.',
      recommendations: [
        'HbA1c screening is a more actionable signal than genotype',
        'Weight and activity dominate published risk models',
        'Review family history with your physician',
      ],
    },
    {
      trait_name: 'Alzheimer’s-associated APOE status',
      risk_level: 'Moderate',
      confidence: 0.71,
      evidence_level: 'MEDIUM',
      description:
        'One APOE ε4 allele detected. This is an association with population-level risk, not a diagnosis or a prediction about any individual outcome.',
      recommendations: [
        'Genetic counselling is recommended before acting on APOE status',
        'Cardiovascular health is the best-supported modifiable factor',
      ],
    },
  ],
}

export const ANATOMY_GRAPH = {
  sampleId: 8892,
  rulesVersion: 'anatomy-rules-1.4.0',
  generatedAt: '2026-08-22T18:30:00Z',
  disclaimer:
    'Overlays describe genomic-anatomic associations drawn from published literature and are graded by evidence quality. They are not medical predictions, diagnoses, or treatment recommendations.',
  nodes: [
    { id: 'cardiovascular_system', label: 'Cardiovascular System', type: 'SYSTEM' },
    { id: 'nervous_system', label: 'Nervous System', type: 'SYSTEM' },
    { id: 'metabolic_system', label: 'Metabolic System', type: 'SYSTEM' },
    { id: 'heart', label: 'Heart', type: 'ORGAN' },
    { id: 'brain', label: 'Brain', type: 'ORGAN' },
    { id: 'liver', label: 'Liver', type: 'ORGAN' },
    { id: 'left_ventricle', label: 'Left Ventricle', type: 'SUBSTRUCTURE' },
    { id: 'hippocampus', label: 'Hippocampus', type: 'SUBSTRUCTURE' },
    { id: 'hepatocytes', label: 'Hepatocytes', type: 'SUBSTRUCTURE' },
  ],
  edges: [
    { from: 'cardiovascular_system', to: 'heart' },
    { from: 'heart', to: 'left_ventricle' },
    { from: 'nervous_system', to: 'brain' },
    { from: 'brain', to: 'hippocampus' },
    { from: 'metabolic_system', to: 'liver' },
    { from: 'liver', to: 'hepatocytes' },
  ],
  overlays: [
    {
      targetNodeId: 'heart',
      label: 'Cardiovascular predisposition (9p21 locus)',
      evidence: 'MEDIUM',
      intensity: 0.58,
      variantCount: 12,
      sources: ['Demo data - placeholder reference'],
    },
    {
      targetNodeId: 'left_ventricle',
      label: 'Left ventricular wall thickness association',
      evidence: 'LOW',
      intensity: 0.24,
      variantCount: 3,
      sources: ['Demo data - placeholder reference'],
    },
    {
      targetNodeId: 'brain',
      label: 'APOE e4 carrier status',
      evidence: 'MEDIUM',
      intensity: 0.51,
      variantCount: 3,
      sources: ['Demo data - placeholder reference'],
    },
    {
      targetNodeId: 'hippocampus',
      label: 'Hippocampal volume association',
      evidence: 'LOW',
      intensity: 0.19,
      variantCount: 2,
      sources: ['Demo data - placeholder reference'],
    },
    {
      targetNodeId: 'liver',
      label: 'Caffeine metabolism (CYP1A2)',
      evidence: 'HIGH',
      intensity: 0.82,
      variantCount: 4,
      sources: ['Demo data - placeholder reference'],
    },
    {
      targetNodeId: 'hepatocytes',
      label: 'Statin response (SLCO1B1)',
      evidence: 'HIGH',
      intensity: 0.74,
      variantCount: 2,
      sources: ['Demo data - placeholder reference'],
    },
    {
      targetNodeId: 'metabolic_system',
      label: 'Type 2 diabetes predisposition (TCF7L2)',
      evidence: 'MEDIUM',
      intensity: 0.64,
      variantCount: 9,
      sources: ['Demo data - placeholder reference'],
    },
  ],
}

const countBy = (predicate) => ANATOMY_GRAPH.overlays.filter(predicate).length
const nodesOfType = (type) => ANATOMY_GRAPH.nodes.filter((n) => n.type === type).length

export const ANATOMY_STATS = {
  sampleId: 8892,
  nodeCount: ANATOMY_GRAPH.nodes.length,
  edgeCount: ANATOMY_GRAPH.edges.length,
  overlayCount: ANATOMY_GRAPH.overlays.length,
  highEvidenceCount: countBy((o) => o.evidence === 'HIGH'),
  mediumEvidenceCount: countBy((o) => o.evidence === 'MEDIUM'),
  lowEvidenceCount: countBy((o) => o.evidence === 'LOW'),
  systemCount: nodesOfType('SYSTEM'),
  organCount: nodesOfType('ORGAN'),
  substructureCount: nodesOfType('SUBSTRUCTURE'),
  variantsMapped: 35,
}

/** Canned LLM responses keyed by loose intent match. */
export const LLM_REPLIES = [
  {
    match: /risk|health|disease/i,
    response:
      'Across your demo dataset the models flag five traits. The strongest signal is caffeine metabolism (HIGH evidence, 91% model confidence) — that one is well replicated. Cardiovascular and type 2 diabetes predispositions carry MEDIUM evidence, which means the published effect sizes are small and heavily modified by lifestyle. None of this is a diagnosis; it describes population-level association only.',
    suggestions: [
      'Which variants drive the cardiovascular signal?',
      'What does MEDIUM evidence actually mean?',
    ],
  },
  {
    match: /ancestry|population|origin/i,
    response:
      'Ancestry inference is not enabled on this demo sample. In a full run the platform compares your genotypes against reference panels and reports admixture proportions with confidence intervals — deliberately as ranges rather than single percentages, because point estimates overstate certainty.',
    suggestions: ['How are reference panels chosen?', 'Show me the trait predictions instead'],
  },
  {
    match: /evidence|confidence|certain/i,
    response:
      'Evidence level and model confidence are different things. Evidence level (HIGH/MEDIUM/LOW) grades how well the underlying association is replicated in the literature. Model confidence describes how sure the classifier is given your genotypes. A HIGH-evidence, low-confidence result means the science is solid but your data is ambiguous — the reverse is far less trustworthy.',
    suggestions: ['Which of my traits are HIGH evidence?', 'How is the risk score computed?'],
  },
  {
    match: /variant|snp|rsid|gene/i,
    response:
      'The demo sample carries six annotated variants, including rs1333049 (9p21, cardiovascular), rs429358 (APOE), and rs11591147 (PCSK9). The 9p21 locus is one of the most replicated cardiovascular association regions, though its individual effect size is modest.',
    suggestions: ['Explain rs429358', 'Show these on the anatomy map'],
  },
]

export const DEFAULT_LLM_REPLY = {
  response:
    'This is HumanDNAVisualizer running in demo mode, so answers come from fixture data rather than a live model. Try asking about your health risks, specific variants, ancestry, or what the evidence grades mean.',
  suggestions: [
    'What health risks are in my DNA?',
    'Which variants have the strongest evidence?',
    'What does MEDIUM evidence mean?',
  ],
}

export const EXPLANATION = {
  explanationText: [
    'This visualization maps trait associations from the demo sample onto body systems.',
    'The liver node carries the strongest association — caffeine metabolism via CYP1A2, graded HIGH evidence because genotype-to-clearance is among the best-replicated pharmacogenomic findings.',
    'Heart and metabolic-system nodes carry MEDIUM evidence: real but small effects that lifestyle factors substantially modify. The 9p21 cardiovascular locus replicates well across cohorts, yet its individual effect size is modest.',
    'Substructure overlays (left ventricle, hippocampus) are LOW evidence and should be read as preliminary signals only.',
    'Overlay brightness encodes association strength, not certainty about any individual outcome.',
  ].join('\n\n'),
  method: 'template-grounded (demo mode)',
  safetyLabels: ['Non-diagnostic', 'Evidence-graded', 'Educational use'],
  citationsUsed: [
    'Demo data - placeholder reference (9p21 locus)',
    'Demo data - placeholder reference (CYP1A2 caffeine clearance)',
    'Demo data - placeholder reference (TCF7L2 association)',
  ],
  queryWasRewritten: false,
  safetyMessage: null,
  disclaimer: 'Educational and research use only. Not a medical device.',
}
