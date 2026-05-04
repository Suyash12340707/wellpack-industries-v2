import { useState, useCallback } from 'react'
import { retrieveContext } from '../data/knowledgeBase'

function buildSystemPrompt(contextEntries) {
  const contextText = contextEntries.map(e => e.content).join('\n\n---\n\n')
  return `You are WellBot, a friendly customer support assistant for Wellpack Industries — a PP (Polypropylene) strap manufacturer based in Pune, India.

Your ONLY job is to answer questions related to:
- PP strapping products (types, specifications, usage, selection)
- Ordering, pricing, delivery, and payment at Wellpack Industries
- Technical issues, troubleshooting, and storage of PP straps
- Company information, certifications, and contact details

STRICT RULES:
1. ONLY answer questions about PP straps, packaging, and Wellpack Industries.
2. If someone asks something unrelated (cooking, coding, politics etc.), politely say you can only help with PP strap related questions.
3. Base your answers on the CONTEXT provided below. Do not make up specs or prices.
4. If you don't know the exact answer, say so honestly and suggest contacting Wellpack directly.
5. Keep responses concise and helpful. Use bullet points for lists.
6. Always be warm and encourage the customer to reach out for quotes or samples.

RETRIEVED CONTEXT (use this to answer):
---
${contextText}
---

Respond in a friendly, professional tone. Keep responses under 200 words unless genuinely needed.`
}

export function useChatbot() {
  const [messages, setMessages] = useState([])
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState(null)

  const sendMessage = useCallback(async (userText) => {
    if (!userText.trim()) return

    const userMsg = { role: 'user', content: userText }
    const updatedMessages = [...messages, userMsg]
    setMessages(updatedMessages)
    setLoading(true)
    setError(null)

    try {
      // 1. Retrieve relevant knowledge base context
      const context = retrieveContext(userText)
      const systemPrompt = buildSystemPrompt(context)

      // 2. Call Groq API (free, OpenAI-compatible)
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          max_tokens: 512,
          temperature: 0.4,
          messages: [
            { role: 'system', content: systemPrompt },
            ...updatedMessages.map(m => ({ role: m.role, content: m.content })),
          ],
        }),
      })

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err?.error?.message || 'API error')
      }

      const data = await response.json()
      const assistantText = data.choices?.[0]?.message?.content
        || 'Sorry, I could not generate a response.'

      setMessages(prev => [...prev, { role: 'assistant', content: assistantText }])

    } catch (err) {
      console.error('Chatbot error:', err)
      setError('Something went wrong.')
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Apologies, I ran into a technical issue. Please email us at sales@wellpackindustries.com or call +91 98765 43210.',
      }])
    } finally {
      setLoading(false)
    }
  }, [messages])

  const clearChat = useCallback(() => {
    setMessages([])
    setError(null)
  }, [])

  return { messages, loading, error, sendMessage, clearChat }
}
