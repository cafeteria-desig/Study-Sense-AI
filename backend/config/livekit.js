const { AccessToken } = require('livekit-server-sdk')

const LIVEKIT_URL = process.env.LIVEKIT_URL || 'wss://studysense-demo.livekit.cloud'
const LIVEKIT_API_KEY = process.env.LIVEKIT_API_KEY || 'devkey'
const LIVEKIT_API_SECRET = process.env.LIVEKIT_API_SECRET || 'secret'

async function generateLiveKitToken(roomName, participantName) {
  try {
    const at = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, {
      identity: participantName || `user_${Math.random().toString(36).substring(7)}`,
      name: participantName || 'Student Learner'
    })

    at.addGrant({
      roomJoin: true,
      room: roomName || 'studysense-live-room',
      canPublish: true,
      canSubscribe: true
    })

    const token = await at.toJwt()
    return {
      token,
      serverUrl: LIVEKIT_URL
    }
  } catch (error) {
    console.error('LiveKit Token Generation Error:', error)
    throw error
  }
}

module.exports = {
  generateLiveKitToken,
  LIVEKIT_URL
}
