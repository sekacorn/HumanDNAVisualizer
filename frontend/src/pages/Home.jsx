import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import Icon from '../components/ui/Icon'
import GlassCard from '../components/ui/GlassCard'
import StatCard from '../components/ui/StatCard'
import StatusPill from '../components/ui/StatusPill'
import ProgressBar from '../components/ui/ProgressBar'
import SequenceStrip from '../components/ui/SequenceStrip'
import authService from '../services/authService'

const CAPABILITIES = [
  {
    icon: 'cloud_upload',
    accent: 'text-cytosine-azure',
    title: 'Data Integration',
    body: 'Ingest VCF exports from 23andMe or AncestryDNA, FHIR health records and lifestyle surveys through one validated pipeline.',
  },
  {
    icon: 'biotech',
    accent: 'text-secondary',
    title: '3D Visualization',
    body: 'Interactive double-helix structures with rotate, zoom and pan — exportable to PNG, SVG, STL and OBJ for research and teaching.',
  },
  {
    icon: 'psychology',
    accent: 'text-guanine-amber',
    title: 'AI Predictions',
    body: 'PyTorch-backed trait models covering health risk, cognitive traits and ancestry, every result carrying an evidence grade.',
  },
  {
    icon: 'forum',
    accent: 'text-cytosine-azure',
    title: 'Natural Language Queries',
    body: 'Ask questions about your genome in plain English and get grounded answers that cite the variants behind them.',
  },
  {
    icon: 'public',
    accent: 'text-secondary',
    title: 'Global Accessibility',
    body: 'Open-source throughout, designed to run in low-resource settings and to represent diverse populations honestly.',
  },
  {
    icon: 'shield_lock',
    accent: 'text-error',
    title: 'Privacy & Security',
    body: 'Encryption at rest and in transit, MFA, role-based access, and workflows built around GDPR and HIPAA expectations.',
  },
]

const STEPS = [
  {
    n: '01',
    title: 'Upload your data',
    body: 'Import VCF files from a genetic testing service, FHIR health records, or environmental CSV data.',
    to: '/import',
    cta: 'Open import',
  },
  {
    n: '02',
    title: 'Analyze traits',
    body: 'Run AI predictions to understand genetic predispositions across health and cognitive traits.',
    to: '/analyze',
    cta: 'Run analysis',
  },
  {
    n: '03',
    title: 'Visualize in 3D',
    body: 'Explore interactive double-helix structures and see where each trait maps onto the sequence.',
    to: '/explore',
    cta: 'Open viewport',
  },
  {
    n: '04',
    title: 'Get insight',
    body: 'Ask questions in plain language and receive answers tied back to your own genomic profile.',
    to: '/analyze',
    cta: 'Ask a question',
  },
]

function GuestHero() {
  return (
    <section className="relative overflow-hidden rounded-card border border-glass-border bg-gradient-to-br from-primary-container/70 via-surface-container-low/60 to-surface/40 px-6 py-12 backdrop-blur-glass md:px-12 md:py-16">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-secondary/10 blur-[90px]"
      />
      <div className="relative max-w-3xl">
        <StatusPill tone="success" pulse>
          Open source · Research grade
        </StatusPill>

        <h1 className="mt-6 font-display-xl text-4xl leading-[1.05] tracking-tight text-on-surface sm:text-5xl md:text-display-xl">
          Democratizing <span className="text-gradient-dna">genomic insight</span>
        </h1>

        <p className="mt-5 max-w-2xl font-body-lg text-base text-on-surface-variant md:text-body-lg">
          Explore your DNA through interactive 3D visualization and AI-driven trait predictions —
          with the evidence behind every claim kept in plain sight.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link to="/analyze" className="btn-primary btn-scan">
            <Icon name="rocket_launch" size={18} />
            Start analysis
          </Link>
          <Link to="/explore" className="btn-secondary">
            <Icon name="3d_rotation" size={18} />
            Explore 3D DNA
          </Link>
        </div>

        <dl className="mt-10 grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4">
          {[
            ['Formats supported', 'VCF · FHIR · CSV'],
            ['Structure formats', 'PDB · FASTA · .dna'],
            ['Licence', 'Apache / MIT'],
            ['Proprietary code', 'None'],
          ].map(([label, value]) => (
            <div key={label}>
              <dt className="font-label-caps text-[10px] uppercase tracking-[0.16em] text-on-surface-variant/70">
                {label}
              </dt>
              <dd className="mt-1 font-code-mono text-sm text-secondary">{value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}

function CommandDeck({ user }) {
  return (
    <div className="grid grid-cols-1 gap-bento-gap sm:grid-cols-2 lg:grid-cols-12">
      {/* Live viewport preview */}
      <GlassCard
        className="sm:col-span-2 lg:col-span-8"
        bodyClassName="!p-0"
        title="Live Sequence Visualizer"
        icon="radio_button_checked"
        action={
          <Link
            to="/explore"
            className="btn-ghost !py-1.5 !text-[10px]"
          >
            Open viewport
            <Icon name="arrow_forward" size={14} />
          </Link>
        }
      >
        <div className="viewport-canvas relative flex min-h-[280px] items-center justify-center md:min-h-[380px]">
          <Icon
            name="biotech"
            size={160}
            className="animate-float text-cytosine-azure opacity-20"
          />
          <div className="absolute bottom-4 left-4 space-y-0.5 font-code-mono text-[11px] text-on-surface-variant/60">
            <div>Render engine: three.js / R3F</div>
            <div>Session: {user?.username || 'guest'}</div>
            <div>Target: 60 FPS</div>
          </div>
          <div className="absolute right-4 top-4 flex gap-2">
            <StatusPill tone="processing" pulse>
              Streaming
            </StatusPill>
          </div>
        </div>
      </GlassCard>

      {/* Right rail */}
      <div className="flex flex-col gap-bento-gap sm:col-span-2 lg:col-span-4">
        <div className="glass-panel rounded-card p-card-padding">
          <p className="font-label-caps text-label-caps uppercase text-on-surface-variant">
            Pipeline progress
          </p>
          <div className="mt-4 flex items-end gap-3">
            <span className="font-display-xl text-4xl leading-none text-secondary">85</span>
            <span className="pb-1 text-xl text-on-surface-variant">%</span>
            <span className="flex items-center gap-1 pb-1.5 font-code-mono text-xs text-secondary-fixed-dim">
              <Icon name="trending_up" size={16} />
              +2.4%/hr
            </span>
          </div>
          <ProgressBar value={85} showValue={false} className="mt-5" />
          <div className="mt-5 grid grid-cols-2 gap-4">
            <div>
              <p className="font-code-mono text-[11px] text-on-surface-variant">Time remaining</p>
              <p className="mt-1 text-on-surface">02:14:00</p>
            </div>
            <div>
              <p className="font-code-mono text-[11px] text-on-surface-variant">Compute nodes</p>
              <p className="mt-1 text-on-surface">1,024 active</p>
            </div>
          </div>
        </div>

        <div className="glass-panel rounded-card bg-gradient-to-br from-transparent to-error-container/10 p-card-padding">
          <p className="flex items-center gap-2 font-label-caps text-label-caps uppercase text-error">
            <Icon name="warning" size={16} />
            Variants detected
          </p>
          <p className="mt-3 font-headline-lg text-3xl text-on-surface">14,203</p>
          <ul className="mt-4 space-y-3">
            {[
              ['High impact (pathogenic)', '24', 'text-error'],
              ['Moderate impact', '1,402', 'text-guanine-amber'],
              ['Low impact (benign)', '12,777', 'text-on-surface-variant'],
            ].map(([label, count, tone]) => (
              <li
                key={label}
                className="flex items-center justify-between gap-3 border-b border-glass-border pb-2 text-sm last:border-0 last:pb-0"
              >
                <span className={`font-code-mono text-xs ${tone}`}>{label}</span>
                <span className="text-on-surface">{count}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Metrics row */}
      <StatCard
        className="sm:col-span-1 lg:col-span-3"
        label="Samples in library"
        value="12"
        icon="science"
        accent="azure"
        trend="+3 this week"
        footnote="VCF · BAM"
      />
      <StatCard
        className="sm:col-span-1 lg:col-span-3"
        label="Traits predicted"
        value="48"
        icon="psychology"
        accent="amber"
        trend="6 need review"
        footnote="Evidence graded"
      />
      <StatCard
        className="sm:col-span-1 lg:col-span-3"
        label="Coverage depth"
        value="30"
        unit="x"
        icon="stacked_line_chart"
        accent="emerald"
        trend="Nominal"
        footnote="Whole genome"
      />
      <StatCard
        className="sm:col-span-1 lg:col-span-3"
        label="Open alerts"
        value="2"
        icon="notifications_active"
        accent="crimson"
        trend="1 new"
        trendDirection="down"
        footnote="QC failures"
      />

      {/* Recent samples */}
      <GlassCard
        className="sm:col-span-2 lg:col-span-7"
        title="Recent samples"
        icon="science"
        action={
          <Link to="/samples" className="btn-ghost !py-1.5 !text-[10px]">
            View all
            <Icon name="arrow_forward" size={14} />
          </Link>
        }
        bodyClassName="!p-3 sm:!p-card-padding"
      >
        <ul className="space-y-3">
          {[
            ['SMPL-8892-ALPHA', 'Whole genome · 30x coverage', 'success', 'Complete', '2 min ago'],
            ['SMPL-8893-BETA', 'Exome · target capture', 'processing', 'Processing', '45 min ago'],
            ['SMPL-8891-GAMMA', 'RNA-Seq · quality check', 'danger', 'Failed QC', '3 hr ago'],
          ].map(([id, meta, tone, status, when]) => (
            <li
              key={id}
              className="flex items-center justify-between gap-3 rounded-lg bg-surface-container-high/40 p-3 transition-colors hover:bg-surface-container-high"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span
                  className={`h-2 w-2 shrink-0 rounded-full ${
                    tone === 'success'
                      ? 'bg-secondary shadow-glow-adenine'
                      : tone === 'processing'
                        ? 'animate-pulse bg-cytosine-azure shadow-glow-cytosine'
                        : 'bg-error shadow-glow-thymine'
                  }`}
                />
                <div className="min-w-0">
                  <p className="truncate text-sm text-on-surface">{id}</p>
                  <p className="mt-0.5 truncate font-code-mono text-[11px] text-on-surface-variant">
                    {meta}
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <StatusPill tone={tone}>{status}</StatusPill>
                <span className="font-code-mono text-[10px] text-on-surface-variant/60">{when}</span>
              </div>
            </li>
          ))}
        </ul>
      </GlassCard>

      {/* Live read stream */}
      <GlassCard
        className="sm:col-span-2 lg:col-span-5"
        title="Live read stream"
        icon="sensors"
        action={<StatusPill tone="processing" pulse>Active</StatusPill>}
        bodyClassName="!px-4 !py-3"
      >
        <div className="h-[220px] overflow-hidden">
          <SequenceStrip rows={12} width={38} seed={19} />
        </div>
      </GlassCard>

      {/* Quick actions */}
      <GlassCard className="sm:col-span-2 lg:col-span-12" title="Quick actions" icon="bolt">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ['/import', 'upload_file', 'Import VCF', 'Add a new genome'],
            ['/explore', '3d_rotation', 'Open 3D viewer', 'Inspect the helix'],
            ['/anatomy', 'monitor_heart', 'Anatomy overlay', 'Map traits to systems'],
            ['/learn', 'school', 'Guided tour', 'Learn the basics'],
          ].map(([to, icon, title, sub]) => (
            <Link
              key={title}
              to={to}
              className="btn-scan group flex items-center gap-3 rounded-lg border border-glass-border bg-surface-container-high/50 p-4 transition-colors hover:bg-surface-bright/40"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary/10 text-secondary">
                <Icon name={icon} size={20} />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm text-on-surface">{title}</span>
                <span className="block truncate font-code-mono text-[11px] text-on-surface-variant">
                  {sub}
                </span>
              </span>
              <Icon
                name="chevron_right"
                size={18}
                className="ml-auto shrink-0 text-on-surface-variant transition-transform group-hover:translate-x-1"
              />
            </Link>
          ))}
        </div>
      </GlassCard>
    </div>
  )
}

function Home() {
  const [user, setUser] = useState(authService.getCurrentUser())
  const [isAuthenticated, setIsAuthenticated] = useState(authService.isAuthenticated())

  useEffect(() => {
    setUser(authService.getCurrentUser())
    setIsAuthenticated(authService.isAuthenticated())
  }, [])

  return (
    <div className="space-y-bento-gap md:space-y-10">
      {isAuthenticated ? (
        <>
          <header>
            <p className="font-label-caps text-label-caps uppercase text-secondary">
              Command centre
            </p>
            <h1 className="mt-2 font-headline-lg text-2xl tracking-tight text-on-surface md:text-headline-lg">
              Welcome back, <span className="text-gradient-dna">{user?.username || 'researcher'}</span>
            </h1>
            <p className="mt-2 font-code-mono text-xs text-on-surface-variant sm:text-code-mono">
              Pipeline nominal · <span className="text-secondary">sequencing active</span> · 3
              analyses await review
            </p>
          </header>
          <CommandDeck user={user} />
        </>
      ) : (
        <GuestHero />
      )}

      {/* Capabilities */}
      <section>
        <h2 className="font-headline-md text-xl text-on-surface md:text-headline-md">
          What the platform does
        </h2>
        <div className="mt-5 grid grid-cols-1 gap-bento-gap sm:grid-cols-2 lg:grid-cols-3">
          {CAPABILITIES.map((c) => (
            <article
              key={c.title}
              className="glass-panel rounded-card group p-card-padding transition-transform duration-300 hover:-translate-y-1"
            >
              <span className={`inline-flex rounded-lg bg-white/5 p-3 ${c.accent}`}>
                <Icon name={c.icon} size={24} />
              </span>
              <h3 className="mt-4 font-headline-md text-lg text-on-surface">{c.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">{c.body}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Getting started */}
      <section>
        <h2 className="font-headline-md text-xl text-on-surface md:text-headline-md">
          Getting started
        </h2>
        <ol className="mt-5 grid grid-cols-1 gap-bento-gap sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step) => (
            <li key={step.n} className="glass-panel rounded-card flex flex-col p-card-padding">
              <span className="font-code-mono text-2xl text-secondary/40">{step.n}</span>
              <h3 className="mt-3 font-headline-md text-base text-on-surface">{step.title}</h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-on-surface-variant">
                {step.body}
              </p>
              <Link
                to={step.to}
                className="mt-4 inline-flex items-center gap-1 font-label-caps text-label-caps uppercase text-secondary transition-colors hover:text-secondary-fixed"
              >
                {step.cta}
                <Icon name="arrow_forward" size={14} />
              </Link>
            </li>
          ))}
        </ol>
      </section>

      <p className="text-center font-code-mono text-xs leading-relaxed text-on-surface-variant/60">
        HumanDNAVisualizer is an original open-source work built on Apache/MIT licensed libraries.
        <br className="hidden sm:block" /> Compatible with VCF, FHIR, CSV, JSON, PDB, FASTA and .dna
        without proprietary code.
      </p>
    </div>
  )
}

export default Home
