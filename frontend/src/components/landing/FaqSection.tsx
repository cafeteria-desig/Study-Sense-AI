import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Eyebrow } from '@/components/ui/Eyebrow'

const faqs = [
  {
    question: 'What file formats does Nora AI support?',
    answer: 'Nora supports PDF documents, DOCX, TXT, PPTX presentations, and direct topic prompts. OCR image scanning and web URL imports are supported as well.',
  },
  {
    question: 'Is my study data private and secure?',
    answer: 'Yes. All uploaded documents are encrypted at rest and in transit. Your study materials are strictly private and never used to train global AI models.',
  },
  {
    question: 'Can I cancel my Pro subscription anytime?',
    answer: 'Yes, absolutely. You can cancel your subscription with one click from your profile settings. Your Pro features remain active until the end of your billing cycle.',
  },
  {
    question: 'Which languages does Nora support?',
    answer: 'Nora supports multilingual study synthesis across English, Spanish, French, German, Portuguese, and Mandarin with native voice pronunciation.',
  },
]

export function FaqSection() {
  const [openIdx, setOpenIdx] = useState<number | null>(null)

  const toggle = (idx: number) => {
    setOpenIdx(openIdx === idx ? null : idx)
  }

  return (
    <section id="faq" className="relative z-10 py-24 lg:py-36 border-t border-white/[0.09]">
      <div className="max-w-[900px] mx-auto px-6 lg:px-10 space-y-16">
        {/* Header */}
        <div className="space-y-4">
          <Eyebrow>FREQUENTLY ASKED QUESTIONS</Eyebrow>

          <h2 className="font-serif-italic text-4xl sm:text-6xl text-[#F4F2EC] leading-tight">
            Questions & Answers.
          </h2>
        </div>

        {/* Accordion */}
        <div className="divide-y divide-white/[0.09] border-y border-white/[0.09]">
          {faqs.map((faq, idx) => {
            const isOpen = openIdx === idx
            return (
              <div key={idx} className="cursor-pointer" onClick={() => toggle(idx)}>
                <div className="flex items-center justify-between gap-4 py-6">
                  <span className="font-medium text-base sm:text-lg text-[#F4F2EC]">
                    {faq.question}
                  </span>
                  <div
                    className={`w-7 h-7 rounded-full bg-white/[0.06] border border-white/[0.12] flex items-center justify-center text-[#F4F2EC] shrink-0 transition-transform duration-300 ${
                      isOpen ? 'rotate-45 text-[#8CFFB4]' : ''
                    }`}
                  >
                    <Plus className="w-4 h-4" />
                  </div>
                </div>

                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    isOpen ? 'max-h-60 pb-6' : 'max-h-0'
                  }`}
                >
                  <p className="text-sm sm:text-base text-[#A6A49C] leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default FaqSection
