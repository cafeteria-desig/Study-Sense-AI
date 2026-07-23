import { useState } from 'react'

import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import { VoiceControls } from '@/components/ui/VoiceControls'
import { VoiceSelector } from '@/components/ui/VoiceSelector'
import { NoraSpeechRoom } from '@/components/ui/NoraSpeechRoom'
import { DownloadDropdown } from '@/components/ui/DownloadDropdown'
import { KineticGrid } from '@/components/ui/KineticGrid'
import { GlowingSearchDock } from '@/components/ui/GlowingSearchDock'
import { Message, MessageAvatar, MessageContent } from '@/components/ui/message'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  MessageScroller,
  MessageScrollerViewport,
  MessageScrollerContent,
  MessageScrollerButton
} from '@/components/ui/message-scroller'
import { ArrowLeft, Copy, Check, MessageSquare, Radio, Bot, User, Activity } from 'lucide-react'
import { MarkdownViewer } from '@/components/ui/MarkdownViewer'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

export function PdfPage() {
  const { session } = useAuth()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [copiedId, setCopiedId] = useState<number | null>(null)
  const [isLiveVoiceMode, setIsLiveVoiceMode] = useState(false)
  const [isSearchExpanded, setIsSearchExpanded] = useState(false)

  const handleSend = async (e?: React.FormEvent, customText?: string) => {
    if (e) e.preventDefault()
    const textToSend = customText || input
    if (!textToSend.trim() || loading) return

    const userMessage: ChatMessage = {
      role: 'user',
      content: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    setMessages((prev) => [...prev, userMessage])
    if (!customText) setInput('')
    setLoading(true)

    try {
      const apiUrl = import.meta.env.VITE_API_URL || ''
      const response = await fetch(`${apiUrl}/api/tutor`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token || ''}`
        },
        body: JSON.stringify({
          prompt: userMessage.content,
          messages: [...messages, userMessage].map(m => ({ role: m.role, content: m.content }))
        })
      })

      if (!response.ok) {
        throw new Error('API request failed')
      }

      const data = await response.json()
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: data.notes || data.summary || data.response || 'No response generated.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error(error)
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I encountered an issue connecting to Nora AI. Please check your backend service.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text)
    setCopiedId(index)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const isInitialState = messages.length === 0

  return (
    <div className="h-[100dvh] bg-[#08080a] text-[#F4F2EC] flex flex-col overflow-hidden font-sans relative selection:bg-white/20 selection:text-[#08080a]">
      {/* Kinetic Warp Grid Background */}
      <KineticGrid globalColor="monochrome" />

      {/* ─── SLEEK MONOCHROME HEADER BAR ─── */}
      <header className="px-6 py-3 border-b border-white/10 bg-[#08080a]/80 backdrop-blur-xl sticky top-0 flex items-center justify-between z-30 shrink-0">
        <div className="flex items-center gap-3">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-mono text-[#A6A49C] hover:text-[#F4F2EC] transition-colors p-1"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Dashboard</span>
          </Link>

          <span className="text-white/20 hidden sm:inline">|</span>

          {/* Nora Badge with White Pulsing Dot */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/15 bg-white/5 backdrop-blur-md text-[11px] font-semibold tracking-wider text-[#F4F2EC]">
            <span className="relative flex h-2 w-2 items-center justify-center">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white" />
            </span>
            <span className="font-offbit">NORA AI SPECIALIST</span>
          </div>
        </div>

        {/* Mode Switcher & Voice Selector */}
        <div className="flex items-center gap-2">
          <div className="flex items-center border border-white/15 p-0.5 bg-white/5 text-xs rounded-full backdrop-blur-md">
            <button
              type="button"
              onClick={() => setIsLiveVoiceMode(false)}
              className={`px-2.5 sm:px-3.5 py-1.5 transition-all flex items-center gap-1.5 rounded-full text-xs font-medium ${
                !isLiveVoiceMode
                  ? 'bg-[#F4F2EC] text-[#08080a] font-semibold shadow-md'
                  : 'text-[#A6A49C] hover:text-[#F4F2EC]'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">Chat Mode</span>
            </button>
            <button
              type="button"
              onClick={() => setIsLiveVoiceMode(true)}
              className={`px-2.5 sm:px-3.5 py-1.5 transition-all flex items-center gap-1.5 rounded-full text-xs font-medium ${
                isLiveVoiceMode
                  ? 'bg-[#F4F2EC] text-[#08080a] font-semibold shadow-md'
                  : 'text-[#A6A49C] hover:text-[#F4F2EC]'
              }`}
            >
              <Radio className="w-3.5 h-3.5 animate-pulse shrink-0" />
              <span className="hidden sm:inline">Live Voice</span>
            </button>
          </div>

          {!isLiveVoiceMode && <VoiceSelector />}
        </div>
      </header>

      {/* ─── LIVE VOICE MODE ─── */}
      {isLiveVoiceMode && (
        <div className="flex-1 overflow-hidden z-10">
          <NoraSpeechRoom
            authToken={session?.access_token}
            onClose={() => setIsLiveVoiceMode(false)}
          />
        </div>
      )}

      {/* ─── TEXT CHAT MODE ─── */}
      {!isLiveVoiceMode && (
        <main className="flex-1 flex flex-col items-center justify-between overflow-hidden relative z-10 w-full min-h-0">
          
          {/* ─── ACTIVE CONVERSATION STREAM WITH MESSAGE SCROLLER ─── */}
          {!isInitialState && (
            <MessageScroller className="w-full flex-1 min-h-0">
              <MessageScrollerViewport className="px-4 sm:px-6 py-6 flex flex-col items-center">
                <MessageScrollerContent className="w-full max-w-3xl space-y-5 my-auto">
                  {messages.map((msg, i) => (
                    <Message key={i} role={msg.role}>
                      <MessageAvatar>
                        <Avatar className="w-8 h-8 border border-white/20 bg-white/10">
                          <AvatarFallback className="text-[#F4F2EC] bg-transparent">
                            {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                          </AvatarFallback>
                        </Avatar>
                      </MessageAvatar>

                      <MessageContent>
                        <div className="flex items-center justify-between mb-1.5 font-mono text-xs">
                          <span className="uppercase tracking-wider text-[#A6A49C] font-semibold">
                            {msg.role === 'user' ? 'Student' : 'Nora (AI Specialist)'}
                          </span>
                          <span className="text-[10px] text-[#726F68]">{msg.timestamp}</span>
                        </div>

                        <div className="text-sm sm:text-base font-sans leading-relaxed text-[#F4F2EC]">
                          {msg.role === 'assistant' ? (
                            <MarkdownViewer content={msg.content} />
                          ) : (
                            <p className="font-mono text-xs sm:text-sm whitespace-pre-wrap">{msg.content}</p>
                          )}
                        </div>

                        {msg.role === 'assistant' && (
                          <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between flex-wrap gap-2">
                            <VoiceControls
                              textToRead={msg.content}
                              authToken={session?.access_token}
                              size="sm"
                            />

                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => copyToClipboard(msg.content, i)}
                                className="inline-flex items-center gap-1.5 text-xs font-mono text-[#A6A49C] hover:text-[#F4F2EC] transition-colors"
                              >
                                {copiedId === i ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
                                {copiedId === i ? 'Copied' : 'Copy'}
                              </button>
                              <DownloadDropdown
                                title={`Nora Response ${i + 1}`}
                                content={msg.content}
                                filenamePrefix="nora-notes"
                              />
                            </div>
                          </div>
                        )}
                      </MessageContent>
                    </Message>
                  ))}

                  {loading && (
                    <div className="p-6 border border-white/15 bg-white/[0.04] backdrop-blur-xl animate-pulse flex items-center justify-between max-w-2xl rounded-3xl shadow-lg">
                      <span className="text-xs font-mono text-[#F4F2EC] flex items-center gap-3">
                        <Activity className="w-4 h-4 text-white animate-spin" />
                        Nora is analyzing your request...
                      </span>
                      <span className="inline-block w-2 h-4 bg-[#F4F2EC] font-bold animate-pulse">▍</span>
                    </div>
                  )}
                </MessageScrollerContent>
              </MessageScrollerViewport>
              <MessageScrollerButton />
            </MessageScroller>
          )}

          {/* ─── CENTERED & ANIMATED GLOWING SEARCH DOCK CONTAINER ─── */}
          <div
            className={`w-full transition-all duration-700 ease-in-out px-4 flex flex-col items-center z-20 ${
              isInitialState
                ? 'my-auto justify-center max-w-2xl text-center space-y-6'
                : 'pb-4 pt-1 shrink-0 max-w-2xl'
            }`}
          >
            {/* Header Title in Initial State */}
            {isInitialState && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-2"
              >
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif-italic text-[#F4F2EC] tracking-tight leading-[1.12] max-w-xl mx-auto">
                  I'm Nora, your AI Study Companion
                </h1>
                <p className="text-xs sm:text-sm text-[#A6A49C] font-mono tracking-wide">
                  Click to expand search or start typing your study question
                </p>
              </motion.div>
            )}

            {/* Glowing Search Dock Component */}
            <GlowingSearchDock
              value={input}
              onChange={setInput}
              onSubmit={() => handleSend()}
              placeholder="Ask Nora anything..."
              loading={loading}
              onSpeechResult={(transcript) => {
                setIsSearchExpanded(true)
                setInput(transcript)
              }}
              isInitialState={isInitialState}
              isExpanded={isSearchExpanded}
              onExpandChange={setIsSearchExpanded}
            />
          </div>
        </main>
      )}
    </div>
  )
}

export default PdfPage
