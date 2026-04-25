'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { linkMasterEpisodeToCompany, unlinkMasterEpisodeFromCompany, updateCompanyMasterEpisodeMemo } from '../../../actions'
import QuestionSidebar from './QuestionSidebar'

type TacticsEpisode = {
  id: string
  companyId: string
  masterEpisodeId: string
  customMemo: string | null
  order: number
  masterEpisode: {
    id: string
    title: string
    category: string | null
    summaryConclusion: string
    summaryChallenge: string
    summaryAction: string
    summaryResult: string
  }
}

type BankEpisode = {
  id: string
  title: string
  category: string | null
}

type Props = {
  company: { id: string; name: string }
  tacticalEpisodes: TacticsEpisode[]
  allMasterEpisodes: BankEpisode[]
  questions: any[]
}

export default function TacticalBoardClient({ company, tacticalEpisodes, allMasterEpisodes, questions }: Props) {
  const [isFocusMode, setIsFocusMode] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [memos, setMemos] = useState<Record<string, string>>({})
  const [savingMemos, setSavingMemos] = useState<Record<string, boolean>>({})

  // Initialize memos state from props
  useEffect(() => {
    const initialMemos: Record<string, string> = {}
    tacticalEpisodes.forEach(t => {
      initialMemos[t.masterEpisodeId] = t.customMemo || ''
    })
    setMemos(initialMemos)
  }, [tacticalEpisodes])

  const handleLinkToggle = async (masterEpisodeId: string) => {
    const isLinked = tacticalEpisodes.some(t => t.masterEpisodeId === masterEpisodeId)
    if (isLinked) {
      await unlinkMasterEpisodeFromCompany(company.id, masterEpisodeId)
    } else {
      await linkMasterEpisodeToCompany(company.id, masterEpisodeId)
    }
  }

  const handleMemoChange = (masterEpisodeId: string, val: string) => {
    setMemos(prev => ({ ...prev, [masterEpisodeId]: val }))
  }

  const handleMemoBlur = async (masterEpisodeId: string) => {
    const currentVal = memos[masterEpisodeId] || ''
    const originalTactics = tacticalEpisodes.find(t => t.masterEpisodeId === masterEpisodeId)
    if (originalTactics && originalTactics.customMemo !== currentVal) {
      setSavingMemos(prev => ({ ...prev, [masterEpisodeId]: true }))
      await updateCompanyMasterEpisodeMemo(company.id, masterEpisodeId, currentVal)
      setTimeout(() => {
        setSavingMemos(prev => ({ ...prev, [masterEpisodeId]: false }))
      }, 500)
    }
  }

  return (
    <div className={`transition-all duration-500 ease-in-out ${isFocusMode ? 'p-0' : 'p-4 md:p-8'}`}>
      
      {/* Header (Hidden in Focus Mode) */}
      <div className={`mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all duration-300 ${isFocusMode ? 'h-0 opacity-0 overflow-hidden mb-0' : 'opacity-100'}`}>
        <div className="flex items-center gap-3">
          <Link href="/" className="text-zinc-400 hover:text-zinc-200 transition bg-zinc-800 px-3 py-1.5 md:px-4 md:py-2 border border-zinc-700 rounded-lg shadow-sm text-sm font-bold whitespace-nowrap active:scale-95">
            ← 戻る
          </Link>
          <h1 className="text-2xl md:text-3xl font-extrabold text-zinc-100 truncate flex items-center gap-2">
            {company.name} <span className="text-zinc-500 font-bold ml-1 text-lg">/ タクティカル・ボード</span>
          </h1>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 font-bold px-4 py-2 rounded-xl hover:bg-indigo-600/40 transition-colors shadow-sm active:scale-95"
          >
            ＋ エピソードを編成
          </button>
          <button 
            onClick={() => setIsFocusMode(true)}
            className="bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 font-bold px-4 py-2 rounded-xl hover:bg-emerald-600/40 transition-colors shadow-sm flex items-center gap-2 active:scale-95"
          >
            <span>🎯</span> Focus Mode
          </button>
        </div>
      </div>

      {/* Focus Mode Exit Bar */}
      {isFocusMode && (
        <div className="fixed top-0 left-0 w-full h-2 group hover:h-12 transition-all duration-300 z-50 flex items-center justify-center bg-transparent">
          <button 
            onClick={() => setIsFocusMode(false)}
            className="opacity-0 group-hover:opacity-100 bg-zinc-800/90 text-zinc-300 border border-zinc-700 text-xs font-bold px-6 py-2 rounded-full transform -translate-y-4 group-hover:translate-y-0 transition-all duration-300 shadow-xl backdrop-blur-sm"
          >
            Focus Modeを終了
          </button>
        </div>
      )}

      {/* Layout Grid */}
      <div className={`grid grid-cols-1 ${isFocusMode ? 'md:grid-cols-1' : 'md:grid-cols-12'} gap-6`}>
        
        {/* Main Board Area */}
        <div className={`flex flex-col gap-8 transition-all duration-500 ${isFocusMode ? 'w-[90%] max-w-5xl mx-auto pt-10' : 'md:col-span-8 lg:col-span-9'}`}>
          {tacticalEpisodes.length === 0 ? (
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-12 text-center shadow-sm">
              <div className="text-6xl mb-4 opacity-50">🧭</div>
              <h2 className="text-xl font-bold text-zinc-100 mb-2">まだエピソードがセットされていません</h2>
              <p className="text-zinc-400 mb-6 font-medium">右上の「エピソードを編成」から、面接で話す予定のネタを選んでください。</p>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="bg-indigo-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-indigo-700 transition duration-300 shadow-lg active:scale-95"
              >
                エピソードを選ぶ
              </button>
            </div>
          ) : (
            tacticalEpisodes.map((tactics, i) => (
              <div key={tactics.id} className="bg-zinc-900 border border-zinc-800 rounded-[2rem] overflow-hidden shadow-2xl relative group">
                {/* 順序バッジ */}
                <div className="absolute top-0 left-0 bg-indigo-900/50 text-indigo-400 font-black text-xl px-4 py-2 rounded-br-2xl border-b border-r border-indigo-500/20 z-10 shadow-sm backdrop-blur-md">
                  #{i + 1}
                </div>
                
                <div className="p-4 md:p-6 pt-10 md:pt-10">
                  <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-3">
                    <div>
                      <h2 className="text-xl md:text-2xl font-extrabold text-zinc-100 tracking-tight leading-tight mb-1">
                        {tactics.masterEpisode.title}
                      </h2>
                      {tactics.masterEpisode.category && (
                        <span className="inline-block bg-zinc-800 text-zinc-300 px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider border border-zinc-700">
                          {tactics.masterEpisode.category}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 4ステップグリッド フル表示 */}
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 mb-5">
                    {[
                      { title: 'Conclusion', label: '① 結論・強み', content: tactics.masterEpisode.summaryConclusion, color: 'text-emerald-400', bg: 'bg-emerald-900/10', border: 'border-emerald-800/30' },
                      { title: 'Challenge', label: '② 課題・目標', content: tactics.masterEpisode.summaryChallenge, color: 'text-amber-400', bg: 'bg-amber-900/10', border: 'border-amber-800/30' },
                      { title: 'Action', label: '③ 具体行動', content: tactics.masterEpisode.summaryAction, color: 'text-indigo-400', bg: 'bg-indigo-900/10', border: 'border-indigo-800/30' },
                      { title: 'Result', label: '④ 結果・学び', content: tactics.masterEpisode.summaryResult, color: 'text-rose-400', bg: 'bg-rose-900/10', border: 'border-rose-800/30' },
                    ].map(step => (
                      <div key={step.title} className={`${step.bg} border ${step.border} rounded-xl p-3 flex flex-col shadow-inner`}>
                        <h4 className={`text-[10px] font-black uppercase tracking-widest mb-1.5 flex items-center gap-1 ${step.color}`}>
                          {step.label}
                        </h4>
                        <p className="text-zinc-200 text-xs md:text-sm leading-relaxed whitespace-pre-wrap font-medium flex-grow">
                          {step.content || <span className="text-zinc-600 italic">未記入</span>}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Tuning Memo */}
                  <div className="relative">
                    <div className="absolute -top-3 left-4 bg-zinc-900 px-2 flex items-center gap-2">
                      <span className="text-[10px] font-black text-emerald-400 tracking-wider">Tuning for {company.name}</span>
                    </div>
                    <div className="border border-emerald-800/50 rounded-xl bg-black/40 p-1 focus-within:border-emerald-500/50 transition-colors shadow-inner">
                      <textarea
                        className="w-full bg-transparent text-emerald-100 placeholder-zinc-700/50 outline-none p-2 resize-y min-h-[60px] text-xs md:text-sm font-medium leading-relaxed"
                        placeholder={`この企業だからこそ強調したい点、面接官の反応に合わせて変更する言い回しなどをメモします... \n例: 「御社の〇〇事業に通じるため、〇〇の経験を多めに話す」`}
                        value={memos[tactics.masterEpisodeId] ?? ''}
                        onChange={(e) => handleMemoChange(tactics.masterEpisodeId, e.target.value)}
                        onBlur={() => handleMemoBlur(tactics.masterEpisodeId)}
                      />
                    </div>
                    {/* 保存状態インジケータ */}
                    {savingMemos[tactics.masterEpisodeId] && (
                      <span className="absolute bottom-4 right-4 text-xs font-bold text-emerald-500 animate-pulse">Saving...</span>
                    )}
                  </div>

                </div>
              </div>
            ))
          )}
        </div>

        {/* Sidebar */}
        {!isFocusMode && (
          <div className="md:col-span-4 lg:col-span-3 transition-opacity duration-500">
            <QuestionSidebar questions={questions} companyName={company.name} />
          </div>
        )}
      </div>

      {/* Episode Picker Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          
          <div className="relative bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/90 rounded-t-3xl border-b-black/20">
              <h2 className="text-xl font-black text-zinc-100 flex items-center gap-2">
                <span className="text-indigo-400">❖</span> バンクからエピソードを編成
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-500 hover:text-zinc-200 text-2xl font-bold transition w-8 h-8 flex items-center justify-center rounded-full hover:bg-zinc-800">×</button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 space-y-3">
              {allMasterEpisodes.length === 0 ? (
                <div className="text-center py-10 text-zinc-500 font-medium">
                  マスターエピソードがまだありません。<br/>メインダッシュボードから登録してください。
                </div>
              ) : (
                allMasterEpisodes.map(ep => {
                  const isLinked = tacticalEpisodes.some(t => t.masterEpisodeId === ep.id)
                  return (
                    <div 
                      key={ep.id} 
                      onClick={() => handleLinkToggle(ep.id)}
                      className={`cursor-pointer p-4 rounded-2xl border transition-all duration-200 flex items-center justify-between group active:scale-[0.98] ${
                        isLinked 
                        ? 'bg-indigo-900/20 border-indigo-500/50 text-indigo-100' 
                        : 'bg-black/40 border-zinc-800 hover:border-zinc-600 hover:bg-zinc-800/50 text-zinc-300'
                      }`}
                    >
                      <div>
                        <div className="font-bold text-base mb-1 group-hover:text-white transition-colors">{ep.title}</div>
                        {ep.category && <div className="text-xs font-bold opacity-60 uppercase tracking-widest">{ep.category}</div>}
                      </div>
                      <div className={`w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 transition-colors ${
                        isLinked ? 'bg-indigo-500 text-white' : 'bg-zinc-800 text-zinc-500 group-hover:bg-zinc-700'
                      }`}>
                        {isLinked && '✓'}
                        {!isLinked && '+'}
                      </div>
                    </div>
                  )
                })
              )}
            </div>
            
            <div className="p-4 border-t border-zinc-800 bg-black/20 rounded-b-3xl">
              <p className="text-xs text-zinc-500 font-medium text-center">選択したエピソードは自動的にボードへ追加されます。</p>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
