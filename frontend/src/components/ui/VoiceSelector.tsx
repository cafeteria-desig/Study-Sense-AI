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
    <div className="inline-flex items-center border border-white/20 bg-white/5 backdrop-blur-md p-0.5 sm:p-1 rounded-full text-xs font-mono select-none shrink-0 shadow-md max-w-full">
      <span className="text-[10px] sm:text-[11px] font-offbit text-[#A6A49C] px-1.5 sm:px-2 flex items-center gap-1 uppercase tracking-wider font-bold border-r border-white/15 mr-0.5 sm:mr-1 shrink-0">
        <Volume2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-400 shrink-0" />
        <span className="hidden min-[400px]:inline">Voice:</span>
      </span>

      <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
        <button
          type="button"
          onClick={() => handleSelect('male')}
          className={`px-2 sm:px-3 py-1 rounded-full transition-all flex items-center gap-1 font-offbit text-[11px] sm:text-xs shrink-0 ${
            gender === 'male'
              ? 'bg-[#F4F2EC] text-[#08080a] font-bold shadow-md'
              : 'text-[#A6A49C] hover:text-[#F4F2EC]'
          }`}
          title="Male Voice"
        >
          <User className="w-3 h-3 shrink-0" />
          <span>Male</span>
        </button>

        <button
          type="button"
          onClick={() => handleSelect('female')}
          className={`px-2 sm:px-3 py-1 rounded-full transition-all flex items-center gap-1 font-offbit text-[11px] sm:text-xs shrink-0 ${
            gender === 'female'
              ? 'bg-[#F4F2EC] text-[#08080a] font-bold shadow-md'
              : 'text-[#A6A49C] hover:text-[#F4F2EC]'
          }`}
          title="Female Voice"
        >
          <User className="w-3 h-3 shrink-0" />
          <span>Female</span>
        </button>
      </div>
    </div>
  )
}

export default VoiceSelector
