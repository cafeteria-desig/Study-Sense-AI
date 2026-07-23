const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY || 'sk_d348206605571ffe7391dc8b0d5a162fcb957da8f4b6637a'

const VOICE_MAP = {
  male: 'JBFqnCBsd6RMkjVDRZzb',   // George (Deep Human Male Voice)
  female: 'EXAVITQu4vr4xnSDxMaL'  // Bella (Human Female Voice)
}

const DEFAULT_VOICE_ID = process.env.ELEVENLABS_VOICE_ID || VOICE_MAP.male

/**
 * Generate audio MP3 buffer from text using ElevenLabs API
 * @param {string} text 
 * @param {string} [voiceIdOrGender] 
 * @returns {Promise<Buffer>}
 */
async function generateSpeech(text, voiceIdOrGender = 'male') {
  if (!text) {
    throw new Error('Text input is required for ElevenLabs speech generation.')
  }

  let targetVoice = DEFAULT_VOICE_ID
  if (voiceIdOrGender && VOICE_MAP[voiceIdOrGender.toLowerCase()]) {
    targetVoice = VOICE_MAP[voiceIdOrGender.toLowerCase()]
  } else if (voiceIdOrGender) {
    targetVoice = voiceIdOrGender
  }

  const url = `https://api.elevenlabs.io/v1/text-to-speech/${targetVoice}`

  // Clean text to avoid markdown overload
  const cleanText = text
    .replace(/```[\s\S]*?```/g, '')
    .replace(/[#*`_~]/g, '')
    .slice(0, 2500)

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Accept': 'audio/mpeg',
      'Content-Type': 'application/json',
      'xi-api-key': ELEVENLABS_API_KEY
    },
    body: JSON.stringify({
      text: cleanText,
      model_id: 'eleven_turbo_v2_5',
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75
      }
    })
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`ElevenLabs API returned status ${response.status}: ${errorText}`)
  }

  const audioBuffer = await response.arrayBuffer()
  return Buffer.from(audioBuffer)
}

module.exports = {
  generateSpeech,
  ELEVENLABS_API_KEY,
  VOICE_MAP
}
