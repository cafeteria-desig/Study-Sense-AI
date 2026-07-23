const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-3.5-flash';

if (!GEMINI_API_KEY) {
  console.warn('[gemini] Missing GEMINI_API_KEY env variable.');
}

/**
 * Sends a generation request to the Gemini API
 * @param {Array} contents - Array of content objects conforming to Gemini's format
 * @param {string|null} systemInstruction - Optional system instruction/persona text
 */
async function callGeminiAPI(contents, systemInstruction = null) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;
  
  const payload = {
    contents,
  };

  if (systemInstruction) {
    payload.systemInstruction = {
      parts: [{ text: systemInstruction }]
    };
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  return data;
}

/**
 * Helper to generate a text response from a single prompt
 * @param {string} prompt - Prompt text
 * @param {string|null} systemInstruction - Optional system instructions
 */
async function generateText(prompt, systemInstruction = null) {
  const contents = [
    {
      parts: [{ text: prompt }]
    }
  ];
  const responseData = await callGeminiAPI(contents, systemInstruction);
  try {
    return responseData.candidates[0].content.parts[0].text;
  } catch (error) {
    throw new Error('Failed to parse text from Gemini response structure.');
  }
}

module.exports = {
  generateText,
  callGeminiAPI,
};
