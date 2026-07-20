import { useState, useEffect } from 'react'
import { AppShell } from '@/components/AppShell'
import { supabase } from '@/services/supabaseClient'
import { useAuth } from '@/contexts/AuthContext'
import {
  MessageCircle, FileText, CircleHelp, Layers,
  CalendarCheck, FileSearch, Trash2, ExternalLink, Loader2, Search
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { toast, Toaster } from 'sonner'

type Tab = 'all' | 'notes' | 'quizzes' | 'flashcard_decks' | 'study_plans' | 'pdf_summaries' | 'tutor_sessions'

interface HistoryItem {
  id: string
  type: Tab
  title: string
  created_at: string
  meta?: string
  link: string
}

export function HistoryPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<Tab>('all')
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [items, setItems] = useState<HistoryItem[]>([])

  useEffect(() => {
    async function loadHistory() {
      if (!user) return
      setLoading(true)
      try {
        const fetchers = [
          // 1. Notes
          supabase.from('notes').select('id, title, created_at').eq('user_id', user.id).then(({ data }) => 
            (data || []).map(x => ({ id: x.id, type: 'notes' as Tab, title: x.title, created_at: x.created_at, link: '/notes', meta: 'Saved study notes' }))
          ),
          // 2. Quizzes
          supabase.from('quizzes').select('id, title, score, created_at').eq('user_id', user.id).then(({ data }) => 
            (data || []).map(x => ({
              id: x.id,
              type: 'quizzes' as Tab,
              title: x.title,
              created_at: x.created_at,
              link: '/quiz',
              meta: x.score !== null ? `Completed: ${x.score}%` : 'Not attempted yet'
            }))
          ),
          // 3. Flashcards
          supabase.from('flashcard_decks').select('id, title, created_at').eq('user_id', user.id).then(({ data }) => 
            (data || []).map(x => ({ id: x.id, type: 'flashcard_decks' as Tab, title: x.title, created_at: x.created_at, link: '/flashcards', meta: 'Flashcard deck' }))
          ),
          // 4. Study plans
          supabase.from('study_plans').select('id, title, exam_date, created_at').eq('user_id', user.id).then(({ data }) => 
            (data || []).map(x => ({
              id: x.id,
              type: 'study_plans' as Tab,
              title: x.title,
              created_at: x.created_at,
              link: '/planner',
              meta: `Exam: ${new Date(x.exam_date).toLocaleDateString()}`
            }))
          ),
          // 5. PDFs
          supabase.from('pdf_summaries').select('id, file_name, created_at').eq('user_id', user.id).then(({ data }) => 
            (data || []).map(x => ({ id: x.id, type: 'pdf_summaries' as Tab, title: x.file_name, created_at: x.created_at, link: '/pdf', meta: 'Document summary' }))
          ),
          // 6. Tutor Sessions
          supabase.from('tutor_sessions').select('id, title, created_at').eq('user_id', user.id).then(({ data }) => 
            (data || []).map(x => ({ id: x.id, type: 'tutor_sessions' as Tab, title: x.title, created_at: x.created_at, link: `/tutor?session=${x.id}`, meta: 'AI Chat history' }))
          )
        ]

        const results = await Promise.all(fetchers)
        const combined = results.flat().sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        setItems(combined)
      } catch (err) {
        console.error('Error loading history:', err)
        toast.error('Failed to load history items')
      } finally {
        setLoading(false)
      }
    }

    loadHistory()
  }, [user])

  const handleDelete = async (item: HistoryItem) => {
    const tableMap: Record<Tab, string> = {
      all: '',
      notes: 'notes',
      quizzes: 'quizzes',
      flashcard_decks: 'flashcard_decks',
      study_plans: 'study_plans',
      pdf_summaries: 'pdf_summaries',
      tutor_sessions: 'tutor_sessions'
    }

    const tableName = tableMap[item.type]
    if (!tableName) return

    try {
      const { error } = await supabase.from(tableName).delete().eq('id', item.id)
      if (error) throw error
      
      // Also delete from activity log if it matches ref_id
      await supabase.from('activity_log').delete().eq('ref_id', item.id)

      setItems(prev => prev.filter(x => x.id !== item.id))
      toast.success('Item deleted successfully')
    } catch (err: any) {
      console.error('Error deleting item:', err)
      toast.error('Failed to delete item')
    }
  }

  const getIcon = (type: Tab) => {
    switch (type) {
      case 'notes': return FileText
      case 'quizzes': return CircleHelp
      case 'flashcard_decks': return Layers
      case 'study_plans': return CalendarCheck
      case 'pdf_summaries': return FileSearch
      case 'tutor_sessions': return MessageCircle
      default: return FileText
    }
  }

  const getLabel = (type: Tab) => {
    switch (type) {
      case 'notes': return 'Notes'
      case 'quizzes': return 'Quiz'
      case 'flashcard_decks': return 'Flashcards'
      case 'study_plans': return 'Plan'
      case 'pdf_summaries': return 'PDF'
      case 'tutor_sessions': return 'Tutor'
      default: return 'Item'
    }
  }

  const filtered = items.filter(x => {
    const matchesTab = activeTab === 'all' || x.type === activeTab
    const matchesSearch = x.title.toLowerCase().includes(search.toLowerCase()) || (x.meta || '').toLowerCase().includes(search.toLowerCase())
    return matchesTab && matchesSearch
  })

  return (
    <AppShell>
      <Toaster position="bottom-right" theme="dark" />
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-6 md:py-10">
        {/* Header */}
        <div className="mb-10">
          <span className="inline-flex items-center gap-3 text-sm font-mono text-muted-foreground mb-4">
            <span className="w-8 h-px bg-foreground/30" />
            History
          </span>
          <h1 className="text-4xl font-display tracking-tight">Saved Materials</h1>
          <p className="text-muted-foreground font-mono text-sm mt-2">Manage and review all your AI study items.</p>
        </div>

        {/* Filters/Search Row */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center mb-8 pb-6 border-b border-foreground/10">
          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search saved items..."
              className="w-full h-10 bg-input pl-9 pr-4 text-xs font-mono border border-border focus:border-foreground focus:outline-none transition-colors"
            />
          </div>

          {/* Tab buttons */}
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-1">
            {(['all', 'notes', 'quizzes', 'flashcard_decks', 'study_plans', 'pdf_summaries', 'tutor_sessions'] as Tab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 text-xs font-mono border transition-all shrink-0 capitalize ${
                  activeTab === tab
                    ? 'bg-foreground text-background border-foreground'
                    : 'border-foreground/10 text-muted-foreground hover:text-foreground hover:border-foreground/30'
                }`}
              >
                {tab === 'all' ? 'All' : tab.replace('_', ' ').replace('decks', '').replace('summaries', '')}
              </button>
            ))}
          </div>
        </div>

        {/* Content list */}
        {loading ? (
          <div className="py-20 text-center flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            <span className="text-sm font-mono text-muted-foreground">Loading items...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center border border-dashed border-foreground/10">
            <p className="text-sm font-mono text-muted-foreground">No items found matching the criteria.</p>
          </div>
        ) : (
          <div className="border border-foreground/10">
            <div className="divide-y divide-foreground/10">
              {filtered.map((item, i) => {
                const Icon = getIcon(item.type)
                return (
                  <div key={item.id} className="flex items-center justify-between p-4 md:p-5 hover:bg-foreground/2 transition-colors">
                    <div className="flex items-center gap-3 md:gap-4 min-w-0">
                      <span className="font-mono text-xs text-muted-foreground">0{i + 1}</span>
                      <div className="p-2 border border-foreground/10 bg-foreground/3 shrink-0">
                        <Icon className="w-4 h-4 text-foreground" strokeWidth={1.5} />
                      </div>
                      <div className="min-w-0">
                        <span className="inline-block text-[10px] font-mono uppercase bg-foreground/5 px-2 py-0.5 text-muted-foreground mb-1">
                          {getLabel(item.type)}
                        </span>
                        <h3 className="font-sans font-medium text-sm text-foreground truncate">{item.title}</h3>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs font-mono text-muted-foreground/60">{item.meta}</span>
                          <span className="text-muted-foreground/30">•</span>
                          <span className="text-xs font-mono text-muted-foreground/60">
                            {new Date(item.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4 shrink-0">
                      <Link
                        to={item.link}
                        className="p-2 text-muted-foreground hover:text-foreground border border-foreground/10 hover:border-foreground/30 hover:bg-foreground/5 transition-all"
                        title="View item"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                      <button
                        onClick={() => handleDelete(item)}
                        className="p-2 text-muted-foreground hover:text-destructive border border-foreground/10 hover:border-destructive/30 hover:bg-destructive/5 transition-all"
                        title="Delete item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  )
}
