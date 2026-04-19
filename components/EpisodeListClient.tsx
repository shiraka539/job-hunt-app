'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { deleteMasterEpisode } from '../app/actions'

type MasterEpisode = {
  id: string
  title: string
  category: string | null
  summaryConclusion: string
  summaryChallenge: string
  summaryAction: string
  summaryResult: string
  updatedAt: Date
  interviewQuestions?: { id: string }[]
}

type Props = {
  initialEpisodes: MasterEpisode[]
}

const CATEGORY_COLORS: Record<string, string> = {
  'ガクチカ': 'bg-sky-500/20 text-sky-400 border-sky-500/30',
  '自己PR': 'bg-rose-500/20 text-rose-400 border-rose-500/30',
  '困難を乗り越えた経験': 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  '志望動機': 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
}

const DEFAULT_CATEGORY_COLOR = 'bg-zinc-800 text-zinc-300 border-zinc-700'

// 300文字で1分（約60秒）としてパッと見の目安時間を計算する
function getEstimatedSeconds(textLength: number): number {
  if (textLength === 0) return 0
  const seconds = Math.round((textLength / 300) * 60)
  return Math.max(10, seconds) // 最低10秒とする
}

function EpisodeCard({ ep, totalLength, estSeconds, categoryStyle, handleDelete, isDeleting }: any) {
  const [isOpen, setIsOpen] = useState(false)

  const toggleOpen = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button, a')) return

    setIsOpen(!isOpen)
    
    if (!isOpen) {
      setTimeout(() => {
        const cardElem = (e.target as HTMLElement).closest('[data-episode-card]')
        if (cardElem) {
          cardElem.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
        }
      }, 300)
    }
  }

  return (
    <div 
      data-episode-card
      onClick={toggleOpen}
      className={`
        bg-[#0a0a0a] border cursor-pointer
        transition-all duration-300 flex flex-col group relative
        ${isOpen ? 'border-indigo-500/50 shadow-[0_0_20px_rgba(79,70,229,0.15)] -translate-y-1' : 'border-zinc-800 hover:border-zinc-700 hover:-translate-y-0.5'}
        rounded-[24px] overflow-hidden shadow-sm
      `}
    >
      <div className="p-6 flex flex-col flex-1 relative">
        <div className="absolute top-6 right-6 text-zinc-500 bg-zinc-900/80 rounded-full w-8 h-8 flex items-center justify-center border border-zinc-800/80 group-hover:bg-zinc-800 transition-colors z-10">
          <svg className={`w-4 h-4 transition-transform duration-300 ${isOpen ? 'rotate-180 text-white' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
        </div>

        <div className="flex items-start justify-between mb-4 pr-10">
          <div className={`px-2.5 py-1 rounded-md text-[11px] font-black tracking-wider uppercase border ${categoryStyle}`}>
            {ep.category || '未分類'}
          </div>
          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Link href={`/episodes/${ep.id}/edit`} className="text-zinc-500 hover:text-indigo-400 p-1 relative z-10">✏️</Link>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(ep.id, ep.title);
              }} 
              disabled={isDeleting === ep.id}
              className="text-zinc-500 hover:text-rose-500 p-1 disabled:opacity-50 relative z-10"
            >
              🗑️
            </button>
          </div>
        </div>

        <h2 className="text-xl font-bold text-zinc-100 mb-2 leading-snug line-clamp-2 pr-8">
          {ep.title}
        </h2>

        <div className="mt-4 flex-1">
          <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> Conclusion
          </h3>
          <p className="text-zinc-300 text-sm leading-relaxed line-clamp-3 mb-2">
            {ep.summaryConclusion || '（結論が入力されていません）'}
          </p>
        </div>

        <div className={`grid transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${isOpen ? 'grid-rows-[1fr] opacity-100 mt-4' : 'grid-rows-[0fr] opacity-0 mt-0'}`}>
          <div className="overflow-hidden">
            <div className="space-y-5 pb-5 border-b border-zinc-800/50 mb-4">
              <div>
                <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span> Challenge
                </h3>
                <p className="text-zinc-400 text-sm leading-relaxed whitespace-pre-wrap">{ep.summaryChallenge}</p>
              </div>
              <div>
                <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span> Action
                </h3>
                <p className="text-zinc-400 text-sm leading-relaxed whitespace-pre-wrap">{ep.summaryAction}</p>
              </div>
              <div>
                <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Result
                </h3>
                <p className="text-zinc-400 text-sm leading-relaxed whitespace-pre-wrap">{ep.summaryResult}</p>
              </div>
            </div>
          </div>
        </div>

        {ep.interviewQuestions && ep.interviewQuestions.length > 0 && (
          <div className={`border-t border-zinc-800/50 mt-auto pb-3 ${isOpen ? 'pt-0' : 'pt-3'}`}>
            <Link href="/episodes/questions" className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs font-bold text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors relative z-10">
              💬 <span className="text-orange-500 font-black">{ep.interviewQuestions.length}</span> 件の質問で回答済
            </Link>
          </div>
        )}

        <div className={`${ep.interviewQuestions && ep.interviewQuestions.length > 0 ? '' : 'pt-4 border-t border-zinc-800/50 mt-auto'} flex items-center justify-between`}>
          <div className="text-xs text-zinc-500 font-medium">
            {new Date(ep.updatedAt).toLocaleDateString()} 更新
          </div>
          <div className="flex items-center gap-2 group/timer cursor-help" title={`総文字数: 約${totalLength}文字`}>
            <div className="flex gap-0.5">
              {[15, 30, 45, 60, 75, 90].map(sec => (
                <div 
                  key={sec} 
                  className={`w-1.5 h-3 rounded-full ${estSeconds >= sec ? 'bg-indigo-500 shadow-[0_0_5px_rgba(79,70,229,0.5)]' : 'bg-zinc-800'}`}
                />
              ))}
            </div>
            <span className={`text-xs font-black ${estSeconds > 60 ? 'text-rose-400' : 'text-indigo-400'} min-w-[36px] text-right`}>
              約{estSeconds}秒
            </span>
          </div>
        </div>

      </div>
    </div>
  )
}

export default function EpisodeListClient({ initialEpisodes }: Props) {
  const [episodes, setEpisodes] = useState(initialEpisodes)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)

  // 全カテゴリを抽出
  const categories = useMemo(() => {
    const cats = new Set<string>()
    initialEpisodes.forEach(ep => {
      if (ep.category) cats.add(ep.category)
    })
    return Array.from(cats)
  }, [initialEpisodes])

  const filteredEpisodes = useMemo(() => {
    if (!selectedCategory) return episodes
    return episodes.filter(ep => ep.category === selectedCategory)
  }, [episodes, selectedCategory])

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`「${title}」を削除しますか？\n（関連する企業の設問には影響しません）`)) return
    
    setIsDeleting(id)
    try {
      await deleteMasterEpisode(id)
      setEpisodes(prev => prev.filter(ep => ep.id !== id))
    } catch (e) {
      alert('削除に失敗しました')
    }
    setIsDeleting(null)
  }

  return (
    <div>
      {/* フィルタボタン */}
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all ${
              selectedCategory === null 
                ? 'bg-white text-black shadow-md' 
                : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:bg-zinc-800'
            }`}
          >
            すべて
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all ${
                selectedCategory === cat 
                  ? 'bg-indigo-600 text-white shadow-[0_0_15px_rgba(79,70,229,0.4)] border border-indigo-500' 
                  : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:bg-zinc-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* エピソードカードのグリッド表示 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEpisodes.map(ep => {
          const totalLength = (ep.summaryConclusion + ep.summaryChallenge + ep.summaryAction + ep.summaryResult).length
          const estSeconds = getEstimatedSeconds(totalLength)
          const categoryStyle = ep.category && CATEGORY_COLORS[ep.category] ? CATEGORY_COLORS[ep.category] : DEFAULT_CATEGORY_COLOR

          return (
            <EpisodeCard
              key={ep.id}
              ep={ep}
              totalLength={totalLength}
              estSeconds={estSeconds}
              categoryStyle={categoryStyle}
              handleDelete={handleDelete}
              isDeleting={isDeleting}
            />
          )
        })}

        {filteredEpisodes.length === 0 && selectedCategory && (
          <div className="col-span-full py-12 text-center text-zinc-500">
            このカテゴリのエピソードは見つかりませんでした。
          </div>
        )}
      </div>
    </div>
  )
}
