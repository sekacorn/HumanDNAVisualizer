import { useState } from 'react'
import { queryLLM } from '../services/api'

function LLMChat({ userId }) {
  const [query, setQuery] = useState('')
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [personalityPreference, setPersonalityPreference] = useState('strategic')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!query.trim()) return

    const userMessage = { role: 'user', content: query }
    setMessages(prev => [...prev, userMessage])
    setQuery('')
    setLoading(true)

    try {
      const response = await queryLLM({
        user_id: userId,
        query: query,
        query_type: 'general',
        personality_preference: personalityPreference
      })

      const assistantMessage = {
        role: 'assistant',
        content: response.data.response,
        suggestions: response.data.suggestions
      }
      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      const errorMessage = {
        role: 'assistant',
        content: `Error: ${error.message}. Please try again.`
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card">
      <h2 className="text-2xl font-bold mb-6 text-green-400">Ask About Your DNA</h2>

      {/* Personality Preference */}
      <div className="mb-4">
        <label className="block text-gray-300 mb-2 text-sm">Response Style:</label>
        <select
          value={personalityPreference}
          onChange={(e) => setPersonalityPreference(e.target.value)}
          className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-green-500 focus:outline-none text-sm"
        >
          <option value="strategic">Strategic (Action-focused)</option>
          <option value="empathetic">Empathetic (Supportive)</option>
          <option value="creative">Creative (Narrative)</option>
          <option value="analytical">Analytical (Detailed)</option>
          <option value="action_oriented">Quick Tips (Fast)</option>
        </select>
      </div>

      {/* Chat Messages */}
      <div className="mb-4 h-64 overflow-y-auto space-y-3 bg-gray-800 p-4 rounded-lg border border-gray-700">
        {messages.length === 0 ? (
          <div className="text-gray-500 text-center py-8">
            <p className="mb-2">Ask me anything about your genomic data!</p>
            <p className="text-sm">Example: "What health risks are in my DNA?"</p>
          </div>
        ) : (
          messages.map((msg, index) => (
            <div key={index} className={`${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
              <div
                className={`inline-block max-w-3/4 p-3 rounded-lg ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-200'
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.content}</p>
                {msg.suggestions && (
                  <div className="mt-2 pt-2 border-t border-gray-600">
                    <p className="text-xs font-semibold mb-1">Suggestions:</p>
                    <ul className="text-xs space-y-1">
                      {msg.suggestions.map((sug, idx) => (
                        <li key={idx}>• {sug}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
        {loading && (
          <div className="text-left">
            <div className="inline-block bg-gray-700 text-gray-400 p-3 rounded-lg">
              Thinking...
            </div>
          </div>
        )}
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask a question..."
          className="flex-1 bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-green-500 focus:outline-none"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="btn-primary px-6 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Send
        </button>
      </form>
    </div>
  )
}

export default LLMChat
