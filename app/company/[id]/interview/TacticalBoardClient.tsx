'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  linkMasterEpisodeToSection, 
  unlinkMasterEpisodeFromSection, 
  updateSectionMasterEpisodeMemo,
  updateCompanyMemos
} from '@/app/actions'

type SectionMasterEpisode = {
  id: string
  sectionId: string
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

type SectionType = {
  id: string
  type: string
  tacticalEpisodes: SectionMasterEpisode[]
}

type BankEpisode = {
  id: string
  title: string
  category: string | null
}

type Props = {
  company: { 
    id: string
    name: string
    motivation: string | null
    researchMemo: string | null
  }
  sections: SectionType[]
  allMasterEpisodes: BankEpisode[]
  questions: any[]
}

export default function TacticalBoardClient({ company, sections, allMasterEpisodes, questions }: Props) {
  const [isFocusMode, setIsFocusMode] = useState(false)
  const [activeSectionIdForModal, setActiveSectionIdForModal] = useState<string | null>(null)
  
  // Memos for episodes: key is `${sectionId}_${masterEpisodeId}`
  const [episodeMemos, setEpisodeMemos] = useState<Record<string, string>>({})
  
  // Company Memos
  const [motivation, setMotivation] = useState(company.motivation || '')
  const [researchMemo, setResearchMemo] = useState(company.researchMemo || '')
  const [isSaving, setIsSaving] = useState(false)

  // Initialize episode memos state from props
  useEffect(() => {
    const initialMemos: Record<string, string> = {}
    sections.forEach(sec => {
      sec.tacticalEpisodes.forEach(t => {
        initialMemos[`${sec.id}_${t.masterEpisodeId}`] = t.customMemo || ''
      })
    })
    setEpisodeMemos(initialMemos)
  }, [sections])

  const handleLinkToggle = async (sectionId: string, masterEpisodeId: string) => {
    const section = sections.find(s => s.id === sectionId)
    const isLinked = section?.tacticalEpisodes.some(t => t.masterEpisodeId === masterEpisodeId)
    
    if (isLinked) {
      await unlinkMasterEpisodeFromSection(company.id, sectionId, masterEpisodeId)
    } else {
      await linkMasterEpisodeToSection(company.id, sectionId, masterEpisodeId)
    }
  }

  const handleEpisodeMemoChange = (sectionId: string, masterEpisodeId: string, val: string) => {
    setEpisodeMemos(prev => ({ ...prev, [`${sectionId}_${masterEpisodeId}`]: val }))
  }

  const handleGlobalSave = async () => {
    setIsSaving(true)
    try {
      // Save company memos
      if (motivation !== (company.motivation || '') || researchMemo !== (company.researchMemo || '')) {
        await updateCompanyMemos(company.id, motivation, researchMemo)
      }

      // Save all episode memos
      for (const sec of sections) {
        for (const t of sec.tacticalEpisodes) {
          const key = `${sec.id}_${t.masterEpisodeId}`
          const currentVal = episodeMemos[key]
          if (currentVal !== undefined && currentVal !== t.customMemo) {
            await updateSectionMasterEpisodeMemo(company.id, sec.id, t.masterEpisodeId, currentVal)
          }
        }
      }
      
      alert('すべてのメモを保存しました！')
    } catch (error) {
      alert('保存に失敗しました')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className={`transition-all duration-300 ${isFocusMode ? 'p-0 w-[95%] max-w-6xl mx-auto' : ''} pb-32`}>
      
      {/* 🌟 全体カード（画像の外側のグレー背景） */}
      <div className={`bg-[#1c1c1e] ${isFocusMode ? 'rounded-none min-h-screen border-x border-zinc-800/50' : 'rounded-[24px] shadow-xl border border-zinc-800/50'} p-6 md:p-8 transition-all`}>
        
        {/* ヘッダー・アクション */}
        <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 transition-all duration-300 ${isFocusMode ? 'h-0 opacity-0 overflow-hidden mb-0' : 'opacity-100'}`}>
          <div className="flex items-center gap-4">
            <Link href="/" className="text-zinc-400 hover:text-zinc-200 transition bg-zinc-800 px-3 py-1.5 md:px-4 md:py-2 border border-zinc-700 rounded-lg shadow-sm text-xs md:text-sm font-bold whitespace-nowrap">
              ← 戻る
            </Link>
            <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-3">
              <span className="text-zinc-300">🎯</span> タクティカル・ボード
            </h2>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsFocusMode(true)}
              className="bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 font-bold px-4 py-2.5 rounded-xl hover:bg-emerald-600/40 transition-colors text-sm flex items-center gap-2 whitespace-nowrap"
            >
              <span>🔍</span> Focus Mode
            </button>
            <button 
              onClick={handleGlobalSave}
              disabled={isSaving}
              className={`font-bold px-6 py-2.5 rounded-xl transition-all text-sm shadow-lg flex items-center gap-2 whitespace-nowrap ${
                isSaving 
                  ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700' 
                  : 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white hover:shadow-indigo-500/25 border border-indigo-500'
              }`}
            >
              <span>💾</span> {isSaving ? '保存中...' : '保存する'}
            </button>
          </div>
        </div>

        {/* Focus Mode Exit Bar */}
        {isFocusMode && (
          <div className="sticky top-0 z-50 flex justify-end p-4 -mt-4 -mr-4 mb-4">
            <button 
              onClick={() => setIsFocusMode(false)}
              className="bg-zinc-800/90 text-zinc-300 hover:text-white border border-zinc-700 text-sm font-bold px-6 py-2 rounded-xl transition-all duration-300 shadow-xl backdrop-blur-sm flex items-center gap-2"
            >
              Focus Modeを終了
            </button>
          </div>
        )}

        {/* 企業軸・メモ */}
        <div className="mb-10">
          <h3 className="text-lg font-bold text-zinc-300 mb-4 flex items-center gap-2">
            <span className="text-zinc-500">🏢</span> 企業軸・メモ
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[#121212] rounded-2xl p-6 border border-zinc-800/30">
              <label className="block text-xs font-bold text-zinc-400 mb-2">Motivation (志望動機)</label>
              <textarea
                className="w-full bg-[#1f1f1f] text-zinc-200 p-4 rounded-xl min-h-[120px] resize-y border border-transparent focus:border-indigo-500/50 focus:outline-none transition-colors leading-relaxed"
                placeholder="なぜこの企業に入りたいのか、軸となる志望動機をメモ..."
                value={motivation}
                onChange={(e) => setMotivation(e.target.value)}
              />
              <div className="text-right mt-2 text-xs font-bold text-zinc-500">{motivation.length} 文字</div>
            </div>
            <div className="bg-[#121212] rounded-2xl p-6 border border-zinc-800/30">
              <label className="block text-xs font-bold text-zinc-400 mb-2">Research (企業研究メモ)</label>
              <textarea
                className="w-full bg-[#1f1f1f] text-zinc-200 p-4 rounded-xl min-h-[120px] resize-y border border-transparent focus:border-indigo-500/50 focus:outline-none transition-colors leading-relaxed"
                placeholder="面接で使えそうな逆質問、企業の特徴やニュースなどをメモ..."
                value={researchMemo}
                onChange={(e) => setResearchMemo(e.target.value)}
              />
              <div className="text-right mt-2 text-xs font-bold text-zinc-500">{researchMemo.length} 文字</div>
            </div>
          </div>
        </div>

        <hr className="border-zinc-800/50 mb-10" />

        {/* 選考フェーズ（Section）軸のリスト */}
        {sections.length === 0 ? (
          <div className="text-center py-20 text-zinc-400 bg-[#121212] rounded-2xl border border-zinc-800/30">
            <p className="mb-5 text-lg font-bold">選考フェーズがありません</p>
            <p className="text-sm">ES管理画面から選考フェーズ（ES、一次面接など）を追加してください。</p>
          </div>
        ) : (
          <div className="space-y-12">
            {sections.map((section) => (
              <div key={section.id}>
                {/* Section Header */}
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                    <span className="text-indigo-500">❖</span> {section.type}
                  </h3>
                  <button 
                    onClick={() => setActiveSectionIdForModal(section.id)}
                    className="bg-[#2c2c2e] hover:bg-[#3c3c3e] text-zinc-300 font-bold px-4 py-2.5 rounded-xl transition-colors text-sm border border-zinc-700 whitespace-nowrap flex items-center gap-2"
                  >
                    <span>＋</span> エピソード編成
                  </button>
                </div>

                {/* Section Episodes */}
                {section.tacticalEpisodes.length === 0 ? (
                  <div className="text-center py-10 text-zinc-500 bg-[#121212] rounded-2xl border border-zinc-800/30 border-dashed">
                    <p className="text-sm font-bold">エピソードが編成されていません。「＋エピソード編成」から追加してください。</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {section.tacticalEpisodes.map((tactics, i) => {
                      const memoKey = `${section.id}_${tactics.masterEpisodeId}`
                      const currentMemo = episodeMemos[memoKey] ?? ''
                      const ep = tactics.masterEpisode

                      return (
                        <div key={tactics.id} className="bg-[#121212] rounded-2xl p-6 border border-zinc-800/30 relative group">
                          {/* 順序バッジ */}
                          <div className="absolute top-0 left-0 bg-[#2c2c2e] text-zinc-400 font-black text-sm px-3 py-1.5 rounded-br-xl border-b border-r border-zinc-700/50 z-10 shadow-sm">
                            #{i + 1}
                          </div>
                          
                          <div className="pt-4 mb-6">
                            <h4 className="text-xl font-bold text-white mb-2 ml-1">
                              {ep.title}
                            </h4>
                            {ep.category && (
                              <span className="inline-block bg-[#1f1f1f] text-zinc-400 px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider border border-zinc-800/80 ml-1">
                                {ep.category}
                              </span>
                            )}
                          </div>

                          {/* 4項目展開（完全表示） */}
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                            {[
                              { label: 'Q. 結論（一言で言うと？）', content: ep.summaryConclusion },
                              { label: 'Q. 課題（直面した困難は？）', content: ep.summaryChallenge },
                              { label: 'Q. 行動（どう解決した？）', content: ep.summaryAction },
                              { label: 'Q. 結果（得られた成果は？）', content: ep.summaryResult },
                            ].map((step, idx) => (
                              <div key={idx} className="mb-2">
                                <label className="block text-xs font-bold text-zinc-400 mb-2">{step.label}</label>
                                <div className="w-full bg-[#1f1f1f] text-zinc-300 p-4 rounded-xl min-h-[140px] border border-transparent leading-relaxed text-sm whitespace-pre-wrap flex flex-col justify-between">
                                  <span>{step.content || <span className="text-zinc-600 italic">未記入</span>}</span>
                                  <div className="text-right mt-3 text-[10px] font-bold text-zinc-500">{step.content.length} 文字</div>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* 企業別メモ (Tuning Memo) */}
                          <div className="mt-6 border-t border-zinc-800/50 pt-6">
                            <label className="block text-xs font-bold text-emerald-400 mb-2 flex items-center gap-2">
                              <span>📝</span> Tuning for {section.type}（微調整用メモ）
                            </label>
                            <textarea
                              className="w-full bg-[#1f1f1f] text-emerald-100/90 p-4 rounded-xl min-h-[100px] resize-y border border-transparent focus:border-emerald-500/50 focus:outline-none transition-colors leading-relaxed text-sm placeholder-emerald-900/50"
                              placeholder={`このフェーズだからこそ強調したい点、面接官の反応に合わせて変更する言い回しなどをメモします...\n例: 「一次面接なので、専門用語は控えめに伝える」`}
                              value={currentMemo}
                              onChange={(e) => handleEpisodeMemoChange(section.id, tactics.masterEpisodeId, e.target.value)}
                            />
                            <div className="text-right mt-2 text-xs font-bold text-emerald-600/50">{currentMemo.length} 文字</div>
                          </div>

                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Episode Picker Modal */}
      {activeSectionIdForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setActiveSectionIdForModal(null)}></div>
          
          <div className="relative bg-[#1c1c1e] border border-zinc-800 rounded-3xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-[#1c1c1e] rounded-t-3xl border-b-black/20">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <span className="text-indigo-500">❖</span> バンクからエピソードを編成
                </h2>
                <p className="text-xs text-zinc-400 font-bold mt-2 ml-8">対象フェーズ: {sections.find(s => s.id === activeSectionIdForModal)?.type}</p>
              </div>
              <button onClick={() => setActiveSectionIdForModal(null)} className="text-zinc-500 hover:text-zinc-200 text-2xl font-bold transition w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#2c2c2e]">×</button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 space-y-3 bg-[#121212]">
              {allMasterEpisodes.length === 0 ? (
                <div className="text-center py-10 text-zinc-500 font-bold">
                  マスターエピソードがまだありません。<br/>ダッシュボードから登録してください。
                </div>
              ) : (
                allMasterEpisodes.map(ep => {
                  const section = sections.find(s => s.id === activeSectionIdForModal)
                  const isLinked = section?.tacticalEpisodes.some(t => t.masterEpisodeId === ep.id)
                  return (
                    <div 
                      key={ep.id} 
                      onClick={() => handleLinkToggle(activeSectionIdForModal, ep.id)}
                      className={`cursor-pointer p-4 rounded-xl border transition-all duration-200 flex items-center justify-between group active:scale-[0.98] ${
                        isLinked 
                        ? 'bg-[#2c2c2e] border-zinc-600 text-white' 
                        : 'bg-[#1f1f1f] border-zinc-800/50 hover:border-zinc-700 text-zinc-300'
                      }`}
                    >
                      <div>
                        <div className="font-bold text-base mb-1 group-hover:text-white transition-colors">{ep.title}</div>
                        {ep.category && <div className="text-xs font-bold opacity-60 uppercase tracking-widest">{ep.category}</div>}
                      </div>
                      <div className={`w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 transition-colors ${
                        isLinked ? 'bg-indigo-500 text-white' : 'bg-[#2c2c2e] text-zinc-500 group-hover:bg-[#3c3c3e]'
                      }`}>
                        {isLinked && '✓'}
                        {!isLinked && '+'}
                      </div>
                    </div>
                  )
                })
              )}
            </div>
            
            <div className="p-4 border-t border-zinc-800 bg-[#1c1c1e] rounded-b-3xl">
              <p className="text-xs text-zinc-500 font-bold text-center">選択したエピソードは自動的にボードへ追加されます。</p>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
