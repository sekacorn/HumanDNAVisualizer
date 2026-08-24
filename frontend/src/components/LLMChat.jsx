import { useEffect, useRef, useState } from 'react'
import { queryLLM } from '../services/api'
import Icon from './ui/Icon'

const STYLES = [
  { value: 'strategic', label: 'Strategic', hint: 'Action-focused' },
  { value: 'empathetic', label: 'Empathetic', hint: 'Supportive' },
  { value: 'creative', label: 'Creative', hint: 'Narrative' },
  { value: 'analytical', label: 'Analytical', hint: 'Detailed' },
  { value: 'action_oriented', label: 'Quick tips', hint: 'Fast' },
]

const STARTERS = [
  'What health risks appear in my DNA?',
  'Explain my ancestry breakdown',
  'Which variants have the strongest evidence?',
]

function LLMChat({ userId }) {
  const [query, setQuery] = useState('')
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [personalityPreference, setPersonalityPreference] = useState('strategic')
  const scrollRef = useRef(null)

  // Keep the newest turn in view as the transcript grows.
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, loading])

  const send = async (text) => {
    const trimmed = text.trim()
    if (!trimmed || loading) return

    setMessages((prev) => [...prev, { role: 'user', content: trimmed }])
    setQuery('')
    setLoading(true)

    try {
      const response = await queryLLM({
        user_id: userId,
        query: trimmed,
        query_type: 'general',
        personality_preference: personalityPreference,
      })

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: response.data.response,
          suggestions: response.data.suggestions,
        },
      ])
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: `Error: ${error.message}. Please try again.`, isError: true },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    send(query)
  }

  return (
    <section className="glass-panel rounded-card flex flex-col overflow-hidden">
      <div className="flex items-center justify-between gap-4 border-b border-glass-border px-card-padding py-4">
        <h2 className="flex items-center gap-2 font-label-caps text-label-caps uppercase text-on-surface">
          <Icon name="forum" size={18} className="text-secondary" />
          Ask about your DNA
        </h2>
        <span className="hidden font-code-mono text-[10px] text-on-surface-variant sm:block">
          Grounded in your uploaded data
        </span>
      </div>

      {/* Response style — a horizontal scroller on mobile, wrapped chips above */}
      <div className="border-b border-glass-border px-card-padding py-3">
        <p className="mb-2 font-label-caps text-[10px] uppercase tracking-[0.16em] text-on-surface-variant/70">
          Response style
        </p>
        <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
          {STYLES.map((style) => {
            const active = personalityPreference === style.value
            return (
              <button
                key={style.value}
                type="button"
                onClick={() => setPersonalityPreference(style.value)}
                aria-pressed={active}
                className={`shrink-0 rounded-full border px-3 py-2 text-left transition-colors ${
                  active
                    ? 'border-secondary/40 bg-secondary/10 text-secondary'
                    : 'border-glass-border bg-white/[0.02] text-on-surface-variant hover:bg-white/[0.06]'
                }`}
              >
                <span className="block font-label-caps text-label-caps uppercase">
                  {style.label}
                </span>
                <span className="mt-0.5 block font-code-mono text-[10px] opacity-70">
                  {style.hint}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Transcript */}
      <div
        ref={scrollRef}
        className="h-72 space-y-3 overflow-y-auto bg-surface-container-lowest/40 p-4 md:h-80"
      >
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center px-4 text-center">
            <Icon name="genetics" size={36} className="mb-3 text-secondary/40" />
            <p className="text-sm text-on-surface-variant">
              Ask anything about your genomic data.
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {STARTERS.map((starter) => (
                <button
                  key={starter}
                  type="button"
                  onClick={() => send(starter)}
                  className="rounded-full border border-glass-border bg-white/[0.03] px-3 py-1.5 font-code-mono text-[11px] text-on-surface-variant transition-colors hover:border-secondary/40 hover:text-secondary"
                >
                  {starter}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg, index) => (
            <div
              // Transcript entries are append-only, so position is a stable identity
              key={index}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-card px-4 py-3 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-br from-cytosine-azure/25 to-secondary/20 text-on-surface'
                    : msg.isError
                      ? 'border border-error/40 bg-error/10 text-error'
                      : 'border border-glass-border bg-surface-container-high/60 text-on-surface-variant'
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.content}</p>

                {msg.suggestions?.length > 0 && (
                  <div className="mt-3 border-t border-glass-border pt-3">
                    <p className="mb-1.5 font-label-caps text-[10px] uppercase tracking-[0.16em] text-on-surface-variant/70">
                      Follow-ups
                    </p>
                    <ul className="space-y-1">
                      {msg.suggestions.map((sug) => (
                        <li key={sug}>
                          <button
                            type="button"
                            onClick={() => send(sug)}
                            className="text-left font-code-mono text-[11px] text-secondary transition-colors hover:text-secondary-fixed"
                          >
                            → {sug}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ))
        )}

        {loading && (
          <div className="flex justify-start">
            <div className="flex items-center gap-2 rounded-card border border-glass-border bg-surface-container-high/60 px-4 py-3 font-code-mono text-xs text-on-surface-variant">
              <span className="flex gap-1">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-secondary" />
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-secondary [animation-delay:150ms]" />
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-secondary [animation-delay:300ms]" />
              </span>
              Analysing
            </div>
          </div>
        )}
      </div>

      {/* Composer */}
      <form onSubmit={handleSubmit} className="flex gap-2 border-t border-glass-border p-3">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask a question…"
          disabled={loading}
          className="input-field flex-1 !rounded-full !py-2.5"
        />
        <button
          type="submit"
          disabled={loading || !query.trim()}
          aria-label="Send question"
          className="btn-primary tap-target !px-4 !py-2.5"
        >
          <Icon name="send" size={18} />
          <span className="hidden sm:inline">Send</span>
        </button>
      </form>
    </section>
  )
}

export default LLMChat
