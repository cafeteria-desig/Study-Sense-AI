import { useState, useRef, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic, MicOff, PhoneOff, Radio } from 'lucide-react'
import { VoiceSelector } from '@/components/ui/VoiceSelector'
import { VoicePoweredOrb } from '@/components/ui/voice-powered-orb'

type ConvPhase = 'idle' | 'listening' | 'thinking' | 'speaking'

interface Turn {
  role: 'user' | 'nora'
  text: string
}

interface NoraSpeechRoomProps {
  authToken?: string
  onClose?: () => void
}

// ── Hue values for different states ─────────────────────────────────────────
const HUE_IDLE = 0         // purple-blue (default orb)
const HUE_USER = 160       // teal-cyan when user speaks
const HUE_AI   = 200       // warm amber/gold when AI speaks

export function NoraSpeechRoom({ authToken, onClose }: NoraSpeechRoomProps) {
  const [phase, setPhase] = useState<ConvPhase>('idle')
  const [muted, setMuted] = useState(false)
  const [turns, setTurns] = useState<Turn[]>([
    { role: 'nora', text: "Hi! I'm Nora. Press Start to begin — just speak and I'll respond live. What topic shall we drill?" }
  ])
  const [liveTranscript, setLiveTranscript] = useState('')
  const [statusMsg, setStatusMsg] = useState('Ready when you are')
  const [errorMsg, setErrorMsg] = useState('')
  const [aiAudioLevel, setAiAudioLevel] = useState<number | undefined>(undefined)
  const [userAudioLevel, setUserAudioLevel] = useState<number | undefined>(undefined)
  const [isMorphingToCall, setIsMorphingToCall] = useState(false)

  const recognitionRef = useRef<any>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const historyRef = useRef<{ role: string; content: string }[]>([])
  const muteRef = useRef(false)
  const activeRef = useRef(false)
  const feedRef = useRef<HTMLDivElement>(null)
  const loopRef = useRef(false)
  const noSpeechCountRef = useRef(0)
  const aiLevelIntervalRef = useRef<any>(null)
  const userLevelIntervalRef = useRef<any>(null)

  const startUserLevelSim = useCallback(() => {
    if (userLevelIntervalRef.current) clearInterval(userLevelIntervalRef.current)
    userLevelIntervalRef.current = setInterval(() => {
      setUserAudioLevel(0.2 + Math.random() * 0.4)
    }, 140)
  }, [])

  const stopUserLevelSim = useCallback(() => {
    if (userLevelIntervalRef.current) {
      clearInterval(userLevelIntervalRef.current)
      userLevelIntervalRef.current = null
    }
    setUserAudioLevel(undefined)
  }, [])
  
  // Ref to prevent stale closure in STT onend callback
  const liveTranscriptRef = useRef('')

  useEffect(() => { muteRef.current = muted }, [muted])

  useEffect(() => {
    feedRef.current?.scrollTo({ top: feedRef.current.scrollHeight, behavior: 'smooth' })
  }, [turns, liveTranscript])

  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.src = ''
      audioRef.current = null
    }
    window.speechSynthesis?.cancel()
    if (aiLevelIntervalRef.current) {
      clearInterval(aiLevelIntervalRef.current)
      aiLevelIntervalRef.current = null
    }
    setAiAudioLevel(undefined)
  }, [])

  const stopRecognition = useCallback(() => {
    stopUserLevelSim()
    try {
      if (recognitionRef.current) {
        recognitionRef.current.onresult = null
        recognitionRef.current.onerror = null
        recognitionRef.current.onend = null
        recognitionRef.current.abort()
        recognitionRef.current.stop()
      }
    } catch (_) {}
    recognitionRef.current = null
  }, [stopUserLevelSim])

  const startAiLevelSim = useCallback(() => {
    if (aiLevelIntervalRef.current) clearInterval(aiLevelIntervalRef.current)
    aiLevelIntervalRef.current = setInterval(() => {
      setAiAudioLevel(0.3 + Math.random() * 0.6)
    }, 120)
  }, [])

  const stopAiLevelSim = useCallback(() => {
    if (aiLevelIntervalRef.current) {
      clearInterval(aiLevelIntervalRef.current)
      aiLevelIntervalRef.current = null
    }
    setAiAudioLevel(undefined)
  }, [])

  const speakText = useCallback((text: string): Promise<void> => {
    return new Promise((resolve) => {
      setPhase('speaking')
      setStatusMsg('Nora is speaking…')
      stopAudio()
      startAiLevelSim()

      const finishSpeaking = () => {
        stopAiLevelSim()
        resolve()
      }

      const tryElevenLabs = async () => {
        try {
          const rawApiUrl = (import.meta.env.VITE_API_URL as string) || ''
          const apiUrl = rawApiUrl.endsWith('/') ? rawApiUrl.slice(0, -1) : rawApiUrl
          const res = await fetch(`${apiUrl}/api/tts`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${authToken || 'mock-token'}`
            },
            body: JSON.stringify({
              text,
              gender: localStorage.getItem('studysense_voice_gender') || 'female'
            })
          })
          if (!res.ok) throw new Error('TTS failed')
          const blob = await res.blob()
          const url = URL.createObjectURL(blob)
          const audio = new Audio(url)
          audioRef.current = audio
          audio.onended = () => { URL.revokeObjectURL(url); finishSpeaking() }
          audio.onerror = () => { URL.revokeObjectURL(url); finishSpeaking() }
          await audio.play()
        } catch {
          const synth = window.speechSynthesis
          synth.cancel()
          const utt = new SpeechSynthesisUtterance(text)
          utt.rate = 0.95; utt.pitch = 1.05
          const voices = synth.getVoices()
          const pick = voices.find(v =>
            v.name.toLowerCase().includes('zira') ||
            v.name.toLowerCase().includes('hazel') ||
            v.name.toLowerCase().includes('female') ||
            v.name.toLowerCase().includes('jenny')
          )
          if (pick) utt.voice = pick
          utt.onend = () => finishSpeaking()
          utt.onerror = () => finishSpeaking()
          synth.speak(utt)
        }
      }
      tryElevenLabs()
    })
  }, [authToken, stopAudio, startAiLevelSim, stopAiLevelSim])

  const askNora = useCallback(async (userText: string): Promise<string> => {
    setPhase('thinking')
    setStatusMsg('Nora is thinking…')
    setErrorMsg('')
    historyRef.current.push({ role: 'user', content: userText })
    const apiUrl = import.meta.env.VITE_API_URL || ''
    let res: Response
    try {
      res = await fetch(`${apiUrl}/api/nora`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken || 'mock-token'}`
        },
        body: JSON.stringify({ prompt: userText, messages: historyRef.current.slice(-10) })
      })
    } catch (fetchErr: any) {
      const msg = `Backend unreachable: ${fetchErr?.message || 'Check server connection'}`
      setErrorMsg(msg)
      setStatusMsg('Error connecting to Nora')
      throw new Error(msg)
    }
    if (!res.ok) {
      const errBody = await res.text().catch(() => '')
      const msg = `API error ${res.status}: ${errBody || res.statusText}`
      setErrorMsg(msg)
      setStatusMsg('Nora response error')
      throw new Error(msg)
    }
    const data = await res.json()
    const reply = data.response || "I didn't catch that. Could you say it again?"
    historyRef.current.push({ role: 'assistant', content: reply })
    return reply
  }, [authToken])

  const startListening = useCallback(() => {
    if (muteRef.current || !activeRef.current || loopRef.current) return
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRec) {
      setPhase('idle')
      setStatusMsg('Speech recognition unavailable in browser')
      return
    }

    loopRef.current = true
    liveTranscriptRef.current = ''
    setLiveTranscript('')

    const rec = new SpeechRec()
    recognitionRef.current = rec
    rec.continuous = false
    rec.interimResults = true
    rec.lang = 'en-US'

    setPhase('listening')
    setStatusMsg('Listening… speak now')
    startUserLevelSim()

    rec.onresult = (e: any) => {
      let current = ''
      if (e.results) {
        for (let i = 0; i < e.results.length; i++) {
          if (e.results[i] && e.results[i][0]) {
            current += e.results[i][0].transcript
          }
        }
      }
      liveTranscriptRef.current = current
      setLiveTranscript(current)
    }

    rec.onerror = (e: any) => {
      loopRef.current = false
      stopUserLevelSim()
      if (e.error === 'not-allowed' || e.error === 'service-not-allowed' || e.error === 'audio-capture') {
        activeRef.current = false
        setPhase('idle')
        setStatusMsg('Microphone access denied')
        setErrorMsg('Microphone permission was denied. Please allow mic access in your browser settings.')
        return
      }
      if (e.error === 'no-speech') {
        noSpeechCountRef.current += 1
        if (noSpeechCountRef.current >= 3) {
          setStatusMsg('Still listening… say a topic or question!')
        }
      }
      if (activeRef.current && !muteRef.current) {
        setTimeout(() => startListening(), 400)
      }
    }

    rec.onend = async () => {
      loopRef.current = false
      stopUserLevelSim()
      const text = liveTranscriptRef.current.trim()
      liveTranscriptRef.current = ''
      setLiveTranscript('')

      if (text && activeRef.current && !muteRef.current) {
        noSpeechCountRef.current = 0
        setTurns(prev => [...prev, { role: 'user', text }])
        try {
          const replyText = await askNora(text)
          setTurns(prev => [...prev, { role: 'nora', text: replyText }])
          await speakText(replyText)
        } catch (err) {
          console.error('[NoraSpeechRoom] Turn error:', err)
        }
      }

      if (activeRef.current && !muteRef.current) {
        setTimeout(() => startListening(), 300)
      } else if (!activeRef.current) {
        setPhase('idle')
      }
    }

    try {
      rec.start()
    } catch (err) {
      console.error('[NoraSpeechRoom] Rec start error:', err)
      loopRef.current = false
      setPhase('idle')
      setStatusMsg('Could not start microphone')
    }
  }, [askNora, speakText])


  const startSession = useCallback(async () => {
    activeRef.current = true
    muteRef.current = false
    loopRef.current = false
    noSpeechCountRef.current = 0
    setMuted(false)
    historyRef.current = []

    // Ensure mic permission on user gesture (especially for mobile iOS/Android)
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        // Asynchronously release mic stream so OS audio hardware session remains active for Web Speech API
        setTimeout(() => {
          stream.getTracks().forEach(track => track.stop())
        }, 2000)
      }
    } catch (micErr: any) {
      console.warn('[NoraSpeechRoom] Mic permission denied:', micErr)
      activeRef.current = false
      setPhase('idle')
      setStatusMsg('Microphone access denied')
      setErrorMsg('Microphone permission was denied. Please allow mic access in browser settings.')
      return
    }

    startListening()
  }, [startListening])

  const handleStartWithMorphingOrb = () => {
    setIsMorphingToCall(true)
    setTimeout(() => {
      startSession()
      setIsMorphingToCall(false)
    }, 550)
  }

  const endSession = useCallback(() => {
    activeRef.current = false
    loopRef.current = false
    stopRecognition()
    stopAudio()
    setPhase('idle')
    setStatusMsg('Session ended')
    setLiveTranscript('')
    liveTranscriptRef.current = ''
    if (onClose) onClose()
  }, [stopRecognition, stopAudio, onClose])

  const toggleMute = useCallback(() => {
    const nowMuted = !muteRef.current
    muteRef.current = nowMuted
    setMuted(nowMuted)
    if (nowMuted) {
      stopRecognition()
      loopRef.current = false
      setStatusMsg('Microphone muted')
      setPhase(prev => prev === 'speaking' ? 'speaking' : 'idle')
    } else {
      if (activeRef.current) {
        setStatusMsg('Mic on — listening…')
        setTimeout(() => startListening(), 200)
      }
    }
  }, [stopRecognition, startListening])

  useEffect(() => {
    return () => {
      activeRef.current = false
      loopRef.current = false
      stopRecognition()
      stopAudio()
    }
  }, [stopRecognition, stopAudio])

  const isSessionActive = phase !== 'idle' || activeRef.current

  const orbHue = phase === 'speaking' ? HUE_AI : phase === 'listening' ? HUE_USER : HUE_IDLE
  const orbEnableVoice = false
  const orbExternalLevel = phase === 'speaking' ? (aiAudioLevel ?? 0) : phase === 'listening' ? (liveTranscript ? 0.75 : (userAudioLevel ?? 0.25)) : undefined

  return (
    <div className="w-full h-full bg-[#08080a] text-[#F4F2EC] flex flex-col overflow-hidden relative font-sans select-none">

      {/* ── Header ── */}
      <div className="w-full px-3 sm:px-6 py-3 sm:py-4 flex flex-wrap sm:flex-nowrap items-center justify-between gap-2 border-b border-white/[0.07] shrink-0 z-10">
        <div className="flex items-center gap-2 shrink-0">
          <span className={`w-2 h-2 rounded-full transition-colors duration-500 shrink-0 ${
            phase === 'speaking' ? 'bg-amber-300 shadow-[0_0_8px_theme(colors.amber.300)] animate-pulse'
            : phase === 'listening' ? 'bg-cyan-300 shadow-[0_0_8px_theme(colors.cyan.300)] animate-pulse'
            : isSessionActive ? 'bg-white animate-pulse shadow-[0_0_8px_#fff]'
            : 'bg-white/20'
          }`} />
          <span className="font-mono text-[10px] sm:text-[11px] font-semibold uppercase tracking-widest text-[#A6A49C]">
            Nora Live Call
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0 max-w-full overflow-x-auto no-scrollbar">
          <div className="border border-white/10 rounded-full px-1 py-0.5 bg-white/[0.03] hover:bg-white/[0.06] transition-colors shrink-0">
            <VoiceSelector />
          </div>

          {isSessionActive && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              onClick={endSession}
              className="flex items-center gap-1.5 text-[11px] font-mono font-medium text-red-400/90 border border-red-500/30 rounded-full px-3 py-1.5 hover:bg-red-500/10 transition-colors shrink-0"
            >
              <PhoneOff className="w-3.5 h-3.5" />
              <span>End Call</span>
            </motion.button>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════
          PRE-CALL IDLE STAGE (WITH DISSOLVING ORB DYNAMICS)
          ══════════════════════════════════════════════════════════ */}
      <AnimatePresence mode="wait">
        {!isSessionActive && (
          <motion.div
            key="pre-call-container"
            exit={{ opacity: 0, transition: { duration: 0.3 } }}
            className="flex-1 flex flex-col items-center justify-center gap-10 px-6 z-10 relative"
          >

            {/* Orb — Disintegrates outward when morphing */}
            <motion.div
              animate={isMorphingToCall ? {
                scale: 2.5,
                opacity: 0,
                filter: 'blur(24px)'
              } : {
                scale: 1,
                opacity: 1,
                filter: 'blur(0px)'
              }}
              transition={{ duration: 0.55, ease: [0.4, 0, 0.2, 1] }}
              className="w-56 h-56 sm:w-72 sm:h-72 relative"
            >
              {/* Particle shockwave ring on disintegrate */}
              {isMorphingToCall && (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0.8 }}
                  animate={{ scale: 3.2, opacity: 0 }}
                  transition={{ duration: 0.55, ease: 'easeOut' }}
                  className="absolute inset-0 rounded-full border border-white/60 bg-white/10 blur-md pointer-events-none"
                />
              )}

              <VoicePoweredOrb
                hue={HUE_IDLE}
                enableVoiceControl={false}
                className="rounded-full overflow-hidden"
              />
            </motion.div>

            {/* Pre-call Text & Button (Fades & slides down) */}
            <motion.div
              animate={isMorphingToCall ? { opacity: 0, y: 15 } : { opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="flex flex-col items-center gap-8 text-center"
            >
              <div className="space-y-2">
                <h2 className="text-2xl sm:text-3xl font-serif text-[#F4F2EC] tracking-tight">Ready for your Oral Drill?</h2>
                <p className="text-xs text-[#726F68] font-mono max-w-xs mx-auto leading-relaxed">
                  Nora evaluates your answers live. Click to begin.
                </p>
              </div>

              <button
                onClick={handleStartWithMorphingOrb}
                disabled={isMorphingToCall}
                className="relative group p-[2px] rounded-full overflow-hidden shadow-[0_0_25px_rgba(255,255,255,0.15)] hover:shadow-[0_0_40px_rgba(255,255,255,0.35)] hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                <div className="absolute inset-[-200%] animate-[spin_3s_linear_infinite] bg-[conic-gradient(from_0deg,transparent_0_240deg,#ffffff_360deg)] opacity-90 pointer-events-none" />
                <div className="relative flex items-center gap-2.5 px-10 py-3.5 rounded-full bg-[#08080a] text-sm font-mono font-semibold text-[#F4F2EC] z-10">
                  <Radio className="w-4 h-4 text-white animate-pulse" />
                  Start Live Session
                </div>
              </button>
            </motion.div>

          </motion.div>
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════════════════════════════
          ACTIVE CALL STAGE (REFORMS ORB & CONVERGES INTERFACE)
          ══════════════════════════════════════════════════════════ */}
      <AnimatePresence mode="wait">
        {isSessionActive && (
          <motion.div
            key="active-call-container"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="flex-1 flex flex-col items-center gap-5 px-4 sm:px-6 py-5 z-10 overflow-hidden relative"
          >

            {/* ── Central Orb: Reforms & condenses inward from exact same position ── */}
            <div className="relative flex flex-col items-center shrink-0">

              {/* Speaker state pill — converges from top */}
              <motion.div
                initial={{ opacity: 0, y: -12, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' }}
                className={`mb-3 px-4 py-1 rounded-full border font-mono text-[11px] font-medium tracking-wider uppercase transition-all duration-500 ${
                  phase === 'speaking'
                    ? 'border-amber-400/40 text-amber-300 bg-amber-400/5'
                    : phase === 'listening'
                    ? 'border-cyan-400/40 text-cyan-300 bg-cyan-400/5'
                    : phase === 'thinking'
                    ? 'border-white/20 text-white/60 bg-white/5'
                    : 'border-white/10 text-white/30 bg-transparent'
                }`}
              >
                {phase === 'speaking' ? '✦ Nora Speaking'
                  : phase === 'listening' ? '◉ You Speaking'
                  : phase === 'thinking' ? '· · · Thinking'
                  : 'Connected'}
              </motion.div>

              {/* Orb reforming container */}
              <motion.div
                initial={{ scale: 0.25, opacity: 0, filter: 'blur(18px)' }}
                animate={{ scale: 1, opacity: 1, filter: 'blur(0px)' }}
                transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
                className="w-44 h-44 sm:w-56 sm:h-56 relative"
              >
                {/* Re-implosion ring glow */}
                <motion.div
                  initial={{ scale: 2.4, opacity: 0.7 }}
                  animate={{ scale: 1, opacity: 0.2 }}
                  transition={{ duration: 0.65, ease: 'easeOut' }}
                  className={`absolute inset-0 rounded-full blur-2xl pointer-events-none ${
                    phase === 'speaking' ? 'bg-amber-500/30'
                    : phase === 'listening' ? 'bg-cyan-500/30'
                    : 'bg-white/20'
                  }`}
                />

                <VoicePoweredOrb
                  hue={orbHue}
                  enableVoiceControl={orbEnableVoice}
                  externalAudioLevel={orbExternalLevel}
                  maxRotationSpeed={1.8}
                  maxHoverIntensity={1.0}
                  voiceSensitivity={2.0}
                  className="rounded-full overflow-hidden"
                />
              </motion.div>

              {/* Live transcript bubble */}
              <AnimatePresence>
                {liveTranscript && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    className="mt-3 px-4 py-2 rounded-2xl border border-cyan-400/20 bg-cyan-400/5 text-cyan-200 text-[12px] font-mono italic max-w-xs text-center leading-relaxed"
                  >
                    {liveTranscript}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Conversation Feed — assembles up from below */}
            {errorMsg && (
              <div className="w-full max-w-xl px-4 py-2.5 rounded-xl border border-red-500/30 bg-red-500/5 font-mono text-xs text-red-300 text-center shrink-0">
                {errorMsg}
              </div>
            )}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25, ease: 'easeOut' }}
              ref={feedRef}
              className="flex-1 w-full max-w-xl overflow-y-auto space-y-3 px-1 min-h-0 scrollbar-thin scrollbar-thumb-white/10"
            >
              {turns.map((turn, idx) => (
                <div key={idx} className={`flex flex-col gap-0.5 ${turn.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <span className="text-[10px] font-mono text-[#4A4845] uppercase tracking-widest px-1">
                    {turn.role === 'user' ? 'You' : 'Nora'}
                  </span>
                  <div className={`px-3.5 py-2.5 rounded-2xl max-w-[85%] text-sm leading-relaxed ${
                    turn.role === 'user'
                      ? 'bg-white/10 text-[#F4F2EC] rounded-tr-none border border-white/10'
                      : 'bg-white/[0.04] text-[#D8D6CF] rounded-tl-none border border-white/[0.08]'
                  }`}>
                    {turn.text}
                  </div>
                </div>
              ))}
            </motion.div>

            {/* Bottom Control Bar — assembles up from bottom */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.35, ease: 'easeOut' }}
              className="w-full max-w-xl shrink-0 border-t border-white/[0.07] pt-4 flex items-center justify-between gap-4"
            >
              <span className="flex items-center gap-2 font-mono text-[11px] text-[#4A4845]">
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 transition-colors duration-500 ${
                  phase === 'speaking' ? 'bg-amber-300 animate-pulse'
                  : phase === 'listening' ? 'bg-cyan-300 animate-pulse'
                  : phase === 'thinking' ? 'bg-white/60 animate-pulse'
                  : 'bg-white/20'
                }`} />
                {statusMsg}
              </span>

              <button
                onClick={toggleMute}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-mono text-xs font-semibold border transition-all ${
                  muted
                    ? 'border-red-500/40 text-red-400 bg-red-500/5 hover:bg-red-500/10'
                    : 'border-white/15 text-[#F4F2EC] bg-white/[0.04] hover:bg-white/[0.08]'
                }`}
              >
                {muted ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                {muted ? 'Unmute' : 'Mute Mic'}
              </button>
            </motion.div>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default NoraSpeechRoom
