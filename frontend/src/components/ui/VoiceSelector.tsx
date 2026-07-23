import { useState, useEffect } from 'react'
import { User, Volume2 } from 'lucide-react'

export type VoiceGender = 'male' | 'female'

export function VoiceSelector() {
  const [gender, setGender] = useState<VoiceGender>('male')

  useEffect(() => {
    const stored = localStorage.getItem('studysense_voice_gender') as VoiceGender
    if (stored === 'female' || stored === 'male') {
      setGender(stored)
    }
  }, [])

  const handleSelect = (selected: VoiceGender) => {
    setGender(selected)
    localStorage.setItem('studysense_voice_gender', selected)
    window.dispatchEvent(new CustomEvent('studysense_voice_change', { detail: selected }))
  }

  return (
    <div className="inline-flex items-center border border-white/20 bg-white/5 backdrop-blur-md p-1 rounded-full text-xs font-mono select-none overflow-hidden shadow-md">
      <span className="text-[10px] sm:text-[11px] font-offbit text-[#A6A49C] px-2.5 flex items-center gap-1.5 uppercase tracking-wider font-bold border-r border-white/15 mr-1">
        <Volume2 className="w-3.5 h-3.5 text-amber-400" />
        <span className="hidden sm:inline">Voice:</span>
      </span>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => handleSelect('male')}
          className={`px-3 py-1 rounded-full transition-all flex items-center gap-1.5 font-offbit text-xs ${
            gender === 'male'
              ? 'bg-[#F4F2EC] text-[#08080a] font-bold shadow-md'
              : 'text-[#A6A49C] hover:text-[#F4F2EC]'
          }`}
          title="Human Male Voice (Adam)"
        >
          <User className="w-3 h-3" />
          Male
        </button>

        <button
          type="button"
          onClick={() => handleSelect('female')}
          className={`px-3 py-1 rounded-full transition-all flex items-center gap-1.5 font-offbit text-xs ${
            gender === 'female'
              ? 'bg-[#F4F2EC] text-[#08080a] font-bold shadow-md'
              : 'text-[#A6A49C] hover:text-[#F4F2EC]'
          }`}
          title="Human Female Voice (Bella)"
        >
          <User className="w-3 h-3" />
          Female
        </button>
      </div>
    </div>
  )
}

export default VoiceSelector
