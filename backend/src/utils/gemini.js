const Groq = require('groq-sdk')

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

async function generateText({ model = 'llama-3.3-70b-versatile', messages = [], maxTokens = 1024 } = {}) {
  const completion = await groq.chat.completions.create({
    model,
    messages,
    max_tokens: maxTokens
  })
  return completion.choices[0]?.message?.content || ''
}

module.exports = { generateText }
