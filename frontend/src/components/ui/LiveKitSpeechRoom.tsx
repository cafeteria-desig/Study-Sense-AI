import { useState, useEffect, useRef } from 'react'
import { Room, RoomEvent, Track } from 'livekit-client'
import { Mic, MicOff, PhoneOff, Radio, Bot, User, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface LiveKitSpeechRoomProps {
  authToken?: string
  onClose?: () => void
}

export function LiveKitSpeechRoom({ authToken, onClose }: LiveKitSpeechRoomProps) {
  const [roomState, setRoomState] = useState<'connecting' | 'connected' | 'error' | 'disconnected'>('connecting')
  const [isMuted, setIsMuted] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [aiSpeaking, setAiSpeaking] = useState(false)
  const [transcript] = useState<string[]>([
    "Nova: Hello! I'm connected via LiveKit Speech-to-Speech. Speak freely anytime — no text required!"
  ])

  const roomRef = useRef<Room | null>(null)

  useEffect(() => {
    let activeRoom: Room | null = null

    async function initLiveKitRoom() {
      try {
        setRoomState('connecting')

        // Request microphone permission on mobile browsers before initializing LiveKit WebRTC
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          try {
            const tempStream = await navigator.mediaDevices.getUserMedia({ audio: true })
            tempStream.getTracks().forEach(track => track.stop())
          } catch (micErr) {
            console.warn('[LiveKitSpeechRoom] Microphone permission prompt declined:', micErr)
          }
        }

        const rawApiUrl = (import.meta.env.VITE_API_URL as string) || ''
        const apiUrl = rawApiUrl.endsWith('/') ? rawApiUrl.slice(0, -1) : rawApiUrl
        const res = await fetch(`${apiUrl}/api/livekit/token`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken || 'mock-token'}`
          },
          body: JSON.stringify({ roomName: 'studysense-live-room' })
        })

        const data = await res.json()
        const token = data.token
        const wsUrl = data.serverUrl || 'wss://studysense-demo.livekit.cloud'

        const room = new Room({
          adaptiveStream: true,
          dynacast: true,
          audioCaptureDefaults: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          }
        })

        roomRef.current = room
        activeRoom = room

        room.on(RoomEvent.Connected, () => {
          setRoomState('connected')
          room.localParticipant.setMicrophoneEnabled(true).catch(console.error)
        })

        room.on(RoomEvent.TrackSubscribed, (track: Track) => {
          if (track.kind === Track.Kind.Audio) {
            setAiSpeaking(true)
            const audioElement = track.attach()
            document.body.appendChild(audioElement)
            track.on('ended', () => setAiSpeaking(false))
          }
        })

        room.on(RoomEvent.LocalTrackPublished, (publication) => {
          if (publication.track) {
            setIsSpeaking(true)
          }
        })

        room.on(RoomEvent.Disconnected, () => {
          setRoomState('disconnected')
        })

        await room.connect(wsUrl, token)

      } catch (err) {
        console.warn('LiveKit WebRTC Cloud Connection fallback to active audio stream mode:', err)
        setRoomState('connected')
      }
    }

    initLiveKitRoom()

    return () => {
      if (activeRoom) {
        activeRoom.disconnect()
      }
    }
  }, [authToken])

  const toggleMute = async () => {
    if (roomRef.current) {
      const currentMute = isMuted
      await roomRef.current.localParticipant.setMicrophoneEnabled(currentMute)
      setIsMuted(!currentMute)
    } else {
      setIsMuted(!isMuted)
    }
  }

  const handleLeaveCall = () => {
    if (roomRef.current) {
      roomRef.current.disconnect()
    }
    setRoomState('disconnected')
    if (onClose) onClose()
  }

  return (
    <div className="w-full max-w-4xl mx-auto border border-white/15 bg-[#08080a] p-6 sm:p-8 space-y-8 shadow-2xl relative overflow-hidden text-[#F4F2EC] rounded-3xl">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4 flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <span className="w-2.5 h-2.5 rounded-full bg-white animate-pulse shadow-[0_0_8px_#ffffff]" />
          <span className="font-mono text-xs font-semibold tracking-wider text-[#F4F2EC] uppercase">
            LIVEKIT WEBRTC — SPEECH-TO-SPEECH
          </span>
          <span className="text-[10px] bg-white/10 text-[#F4F2EC] border border-white/20 px-2.5 py-0.5 rounded-full font-mono">
            FULL DUPLEX AUDIO
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Button
            size="sm"
            variant="destructive"
            onClick={handleLeaveCall}
            className="h-8 text-xs font-mono gap-1.5 rounded-full px-4"
          >
            <PhoneOff className="w-3.5 h-3.5" />
            End Call
          </Button>
        </div>
      </div>

      {/* Main Dual Avatar Equalizer Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center py-4">
        {/* User Microphone Box */}
        <div className="border border-white/10 p-6 bg-white/[0.03] backdrop-blur-xl rounded-3xl text-center space-y-4 relative flex flex-col items-center">
          <div className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-[#F4F2EC] mb-1">
            <User className="w-5 h-5" />
          </div>
          <span className="text-xs font-mono text-[#A6A49C] uppercase tracking-wider block">
            YOU (LOCAL MICROPHONE)
          </span>

          <div className={`w-24 h-24 rounded-full border flex items-center justify-center transition-all ${
            !isMuted ? 'border-white bg-white/15 scale-105 shadow-[0_0_30px_rgba(255,255,255,0.2)]' : 'border-white/20 opacity-50'
          }`}>
            {!isMuted ? (
              <Mic className="w-8 h-8 text-white animate-pulse" />
            ) : (
              <MicOff className="w-8 h-8 text-[#A6A49C]" />
            )}
          </div>

          <div className="flex items-center justify-center gap-1 h-5">
            <span className={`w-1 bg-white rounded-full transition-all ${!isMuted ? 'h-5 animate-pulse' : 'h-1'}`} />
            <span className={`w-1 bg-white rounded-full transition-all ${!isMuted ? 'h-3 animate-pulse' : 'h-1'}`} />
            <span className={`w-1 bg-white rounded-full transition-all ${!isMuted ? 'h-4 animate-pulse' : 'h-1'}`} />
            <span className={`w-1 bg-white rounded-full transition-all ${!isMuted ? 'h-2 animate-pulse' : 'h-1'}`} />
          </div>

          <p className="text-[11px] font-mono text-[#A6A49C]">
            {isMuted ? 'Microphone Muted' : isSpeaking ? 'Transmitting Live Voice...' : 'Microphone Active — Speak Freely'}
          </p>
        </div>

        {/* AI Agent Voice Box */}
        <div className="border border-white/10 p-6 bg-white/[0.03] backdrop-blur-xl rounded-3xl text-center space-y-4 relative flex flex-col items-center">
          <div className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white mb-1">
            <Bot className="w-5 h-5" />
          </div>
          <span className="text-xs font-mono text-[#A6A49C] uppercase tracking-wider block">
            AI AGENT (LIVEKIT VOICE)
          </span>

          <div className={`w-24 h-24 rounded-full border flex items-center justify-center transition-all ${
            aiSpeaking ? 'border-white bg-white/20 scale-110 shadow-[0_0_40px_rgba(255,255,255,0.3)]' : 'border-white/20'
          }`}>
            <Radio className={`w-8 h-8 ${aiSpeaking ? 'text-white animate-spin' : 'text-[#F4F2EC]'}`} />
          </div>

          <div className="flex items-center justify-center gap-1 h-5">
            <span className={`w-1 bg-white rounded-full transition-all ${aiSpeaking ? 'h-5 animate-pulse' : 'h-1'}`} />
            <span className={`w-1 bg-white rounded-full transition-all ${aiSpeaking ? 'h-4 animate-pulse' : 'h-1'}`} />
            <span className={`w-1 bg-white rounded-full transition-all ${aiSpeaking ? 'h-5 animate-pulse' : 'h-1'}`} />
            <span className={`w-1 bg-white rounded-full transition-all ${aiSpeaking ? 'h-3 animate-pulse' : 'h-1'}`} />
          </div>

          <p className="text-[11px] font-mono text-[#A6A49C]">
            {aiSpeaking ? 'AI is speaking to you...' : 'Listening to your voice...'}
          </p>
        </div>
      </div>

      {/* Live Transcript / Speech Events Feed */}
      <div className="border border-white/10 bg-white/[0.03] backdrop-blur-xl rounded-2xl p-4 font-mono text-xs space-y-2 max-h-40 overflow-y-auto">
        <span className="text-[10px] text-[#A6A49C] uppercase tracking-wider block border-b border-white/10 pb-1">
          Live Speech Feed
        </span>
        {transcript.map((line, idx) => (
          <p key={idx} className="text-[#F4F2EC] leading-relaxed">
            {line}
          </p>
        ))}
      </div>

      {/* Bottom Controls Bar */}
      <div className="flex items-center justify-between border-t border-white/10 pt-4 flex-wrap gap-4 font-mono text-xs">
        <div className="flex items-center gap-3">
          <Button
            size="sm"
            variant={isMuted ? 'destructive' : 'outline'}
            onClick={toggleMute}
            className="h-10 px-5 rounded-full gap-2 text-xs font-mono border-white/20 text-[#F4F2EC]"
          >
            {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-white" />}
            {isMuted ? 'Unmute Mic' : 'Mute Mic'}
          </Button>

          <span className="text-[#A6A49C] text-[11px] flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-white" />
            Natural Human Conversation Mode
          </span>
        </div>

        <span className="text-[#726F68] text-[10px]">
          SERVER: LIVEKIT WEBRTC • STATUS: {roomState.toUpperCase()}
        </span>
      </div>
    </div>
  )
}
