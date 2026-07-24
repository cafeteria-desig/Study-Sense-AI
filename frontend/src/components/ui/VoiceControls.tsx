import { useState, useEffect, useRef } from 'react'
import { Volume2, Mic, MicOff, Loader2, Square } from 'lucide-react'

interface VoiceControlsProps {
  textToRead?: string
  onSpeechResult?: (transcript: string) => void
  size?: 'sm' | 'md'
  authToken?: string
}

export function VoiceControls({ textToRead, onSpeechResult, size = 'md', authToken }: VoiceControlsProps) {
  // TTS State
  const [isPlaying, setIsPlaying] = useState(false)
  const [isTtsLoading, setIsTtsLoading] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // STT State
  const [isListening, setIsListening] = useState(false)
  const recognitionRef = useRef<any>(null)
  const accumulatedTranscriptRef = useRef<string>('')

  const stopAllAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      audioRef.current = null
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
    }
    setIsPlaying(false)
  }

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop()
      } catch (e) {}
    }
    setIsListening(false)
  }

  useEffect(() => {
    return () => {
      stopAllAudio()
      stopListening()
    }
  }, [])

  // Text-To-Speech handler via ElevenLabs API (Male Voice)
  const handleReadAloud = async () => {
    if (!textToRead) return

    if (isPlaying) {
      stopAllAudio()
      return
    }

    try {
      setIsTtsLoading(true)
      stopAllAudio()

      const rawApiUrl = (import.meta.env.VITE_API_URL as string) || ''
      const apiUrl = rawApiUrl.endsWith('/') ? rawApiUrl.slice(0, -1) : rawApiUrl
      const response = await fetch(`${apiUrl}/api/tts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken || 'mock-token'}`
        },
        body: JSON.stringify({
          text: textToRead,
          gender: localStorage.getItem('studysense_voice_gender') || 'male'
        })
      })

      if (!response.ok) {
        throw new Error('TTS request failed')
      }

      const audioBlob = await response.blob()
      const audioUrl = URL.createObjectURL(audioBlob)

      const audio = new Audio(audioUrl)
      audioRef.current = audio

      audio.onended = () => {
        setIsPlaying(false)
      }
      audio.onerror = () => {
        setIsPlaying(false)
        setIsTtsLoading(false)
      }

      await audio.play()
      setIsPlaying(true)
    } catch (err) {
      console.warn('ElevenLabs TTS failed, using browser speech synthesis fallback:', err)
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel()
        const utterance = new SpeechSynthesisUtterance(textToRead)
        const selectedGender = localStorage.getItem('studysense_voice_gender') || 'male'
        const voices = window.speechSynthesis.getVoices()
        if (selectedGender === 'male') {
          const maleVoice = voices.find(v => 
            v.name.toLowerCase().includes('david') || 
            v.name.toLowerCase().includes('male') || 
            v.name.toLowerCase().includes('george') || 
            v.name.toLowerCase().includes('mark') ||
            v.name.toLowerCase().includes('guy')
          )
          if (maleVoice) utterance.voice = maleVoice
        } else {
          const femaleVoice = voices.find(v => 
            v.name.toLowerCase().includes('zira') || 
            v.name.toLowerCase().includes('female') || 
            v.name.toLowerCase().includes('hazel') ||
            v.name.toLowerCase().includes('jenny')
          )
          if (femaleVoice) utterance.voice = femaleVoice
        }
        utterance.onend = () => setIsPlaying(false)
        utterance.onerror = () => setIsPlaying(false)
        window.speechSynthesis.speak(utterance)
        setIsPlaying(true)
      }
    } finally {
      setIsTtsLoading(false)
    }
  }

  // Speech-To-Text handler via Web Speech API with Mobile Compatibility
  const toggleListening = async () => {
    if (isListening) {
      stopListening()
      return
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.')
      return
    }

    // Check secure context for mobile devices
    if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      alert('Microphone access requires a secure HTTPS connection on mobile devices.')
      return
    }

    // Prompt/verify microphone permission for mobile browsers (iOS Safari / Android Chrome)
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        // Asynchronously release mic stream so hardware session stays active for WebSpeech API on mobile
        setTimeout(() => {
          stream.getTracks().forEach(track => track.stop())
        }, 2000)
      }
    } catch (micErr: any) {
      console.warn('[VoiceControls] Microphone permission denied:', micErr)
      alert('Microphone access was denied. Please allow microphone permission in your browser settings to dictate with voice.')
      return
    }

    accumulatedTranscriptRef.current = ''
    const recognition = new SpeechRecognition()
    recognition.continuous = false
    recognition.interimResults = true
    recognition.lang = navigator.language || 'en-US'

    recognition.onstart = () => {
      setIsListening(true)
    }

    recognition.onresult = (event: any) => {
      let text = ''
      if (event.results) {
        for (let i = 0; i < event.results.length; i++) {
          if (event.results[i] && event.results[i][0]) {
            text += event.results[i][0].transcript
          }
        }
      }
      accumulatedTranscriptRef.current = text
      if (text && onSpeechResult) {
        onSpeechResult(text)
      }
    }

    recognition.onerror = (event: any) => {
      console.error('[VoiceControls] Speech recognition error:', event.error)
      setIsListening(false)
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        alert('Microphone permission denied. Please allow microphone access in site settings.')
      } else if (event.error === 'audio-capture') {
        alert('Microphone hardware was not found or is in use by another app.')
      }
    }

    recognition.onend = () => {
      setIsListening(false)
      const finalVal = accumulatedTranscriptRef.current.trim()
      if (finalVal && onSpeechResult) {
        onSpeechResult(finalVal)
      }
    }

    recognitionRef.current = recognition
    try {
      recognition.start()
    } catch (startErr) {
      console.error('[VoiceControls] Start error:', startErr)
      setIsListening(false)
    }
  }

  const iconBtnClasses = size === 'sm' ? 'w-7 h-7' : 'w-8 h-8'

  return (
    <div className="inline-flex items-center gap-1.5">
      {/* TTS Listen Icon Button */}
      {textToRead && (
        <button
          type="button"
          onClick={handleReadAloud}
          disabled={isTtsLoading}
          className={`${iconBtnClasses} rounded-full border border-white/15 bg-white/5 hover:bg-white/15 text-[#A6A49C] hover:text-[#F4F2EC] flex items-center justify-center transition-all shadow-xs ${
            isPlaying ? 'border-white/50 bg-white/20 text-white animate-pulse' : ''
          }`}
          title={isPlaying ? 'Stop Voiceover Audio' : 'Listen with AI Voice'}
          aria-label="Listen with AI Voice"
        >
          {isTtsLoading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
          ) : isPlaying ? (
            <Square className="w-3 h-3 fill-white text-white" />
          ) : (
            <Volume2 className="w-3.5 h-3.5" />
          )}
        </button>
      )}

      {/* STT Dictate Icon Button */}
      {onSpeechResult && (
        <button
          type="button"
          onClick={toggleListening}
          className={`${iconBtnClasses} rounded-full border border-white/15 bg-white/5 hover:bg-white/15 text-[#A6A49C] hover:text-[#F4F2EC] flex items-center justify-center transition-all shadow-xs ${
            isListening ? 'border-white/60 bg-white/25 text-white animate-pulse' : ''
          }`}
          title={isListening ? 'Stop Listening' : 'Dictate with Voice'}
          aria-label="Dictate with Voice"
        >
          {isListening ? (
            <MicOff className="w-3.5 h-3.5 text-white" />
          ) : (
            <Mic className="w-3.5 h-3.5" />
          )}
        </button>
      )}
    </div>
  )
}

export default VoiceControls
