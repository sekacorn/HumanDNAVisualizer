import { useEffect, useMemo, useRef, useState } from 'react'

const BASES = ['A', 'T', 'G', 'C']
const BASE_CLASS = { A: 'base-A', T: 'base-T', G: 'base-G', C: 'base-C' }

/** Deterministic PRNG so the strip renders identically between paints. */
function seededRandom(seed) {
  let s = seed >>> 0
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 4294967296
  }
}

function makeRow(rand, width) {
  let row = ''
  for (let i = 0; i < width; i += 1) row += BASES[Math.floor(rand() * 4)]
  return row
}

/**
 * Live read stream. Renders monospaced base pairs with the bioluminescent
 * palette; when `live` is set, new reads scroll in from the bottom.
 */
function SequenceStrip({ rows = 12, width = 44, seed = 42, live = true, className = '' }) {
  const randRef = useRef(seededRandom(seed))
  const initial = useMemo(() => {
    const rand = seededRandom(seed)
    randRef.current = rand
    return Array.from({ length: rows }, () => makeRow(rand, width))
  }, [rows, width, seed])

  const [lines, setLines] = useState(initial)

  useEffect(() => {
    setLines(initial)
  }, [initial])

  useEffect(() => {
    if (!live) return undefined
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (media.matches) return undefined

    const id = setInterval(() => {
      setLines((prev) => [...prev.slice(1), makeRow(randRef.current, width)])
    }, 900)
    return () => clearInterval(id)
  }, [live, width])

  return (
    <div className={`sequence-readout relative overflow-hidden font-code-mono text-[11px] leading-[1.7] sm:text-code-mono ${className}`}>
      {/* Fade the stream out at both ends so it reads as a window into a longer read */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-6 bg-gradient-to-b from-[#031427] to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-8 bg-gradient-to-t from-[#031427] to-transparent" />
      {lines.map((line, rowIndex) => (
        // Rows are positional (a scrolling window), so index is the stable identity here
        // eslint-disable-next-line react/no-array-index-key
        <div key={rowIndex} className="whitespace-nowrap">
          {line.split('').map((base, i) => (
            // eslint-disable-next-line react/no-array-index-key
            <span key={i} className={BASE_CLASS[base]}>
              {base}
            </span>
          ))}
        </div>
      ))}
    </div>
  )
}

export default SequenceStrip
