const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

if (!GROQ_API_KEY) {
  console.warn('[groq] Missing GROQ_API_KEY env variable.');
}

/**
 * Sends a chat completion request to the Groq API
 * @param {Array} messages - Chat history array of { role, content }
 * @param {string|null} systemPrompt - Optional system instructions
 */
async function generateChatCompletion(messages, systemPrompt = null) {
  const url = 'https://api.groq.com/openai/v1/chat/completions';
  
  const formattedMessages = [];
  if (systemPrompt) {
    formattedMessages.push({ role: 'system', content: systemPrompt });
  }
  formattedMessages.push(...messages);

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: formattedMessages,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Groq API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  if (data.choices && data.choices[0] && data.choices[0].message) {
    return data.choices[0].message.content || '';
  }
  throw new Error('Malformed response structure from Groq API');
}

module.exports = {
  generateChatCompletion,
};
