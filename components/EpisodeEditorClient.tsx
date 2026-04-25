'use client'

import { useState } from 'react'
import { createMasterEpisode, updateMasterEpisode } from '@/app/actions'
import { useRouter } from 'next/navigation'

type Props = {
  initialEpisode?: {
    id: string
    title: string
    category: string | null
    summaryConclusion: string
    summaryChallenge: string
    summaryAction: string
    summaryResult: string
  }
}

const CATEGORY_OPTIONS = ['ガクチカ', '自己PR', '困難を乗り越えた経験', '志望動機', '長所・短所', 'その他']

export default function EpisodeEditorClient({ initialEpisode }: Props) {
  const router = useRouter()
  const isEditing = !!initialEpisode

  const [title, setTitle] = useState(initialEpisode?.title || '')
  const [category, setCategory] = useState(initialEpisode?.category || 'ガクチカ')
  
  const [sections, setSections] = useState({
    conclusion: initialEpisode?.summaryConclusion || '',
    challenge: initialEpisode?.summaryChallenge || '',
    action: initialEpisode?.summaryAction || '',
    result: initialEpisode?.summaryResult || ''
  })

  const [maxLengths, setMaxLengths] = useState({
    conclusion: 100,
    challenge: 150,
    action: 200,
    result: 100
  })

  const [isSaving, setIsSaving] = useState(false)

  const handleTextChange = (key: keyof typeof sections, val: string) => {
    setSections(prev => ({ ...prev, [key]: val }))
  }

  const handleMaxLengthChange = (key: keyof typeof maxLengths, val: string) => {
    const num = parseInt(val, 10)
    setMaxLengths(prev => ({ ...prev, [key]: isNaN(num) ? 0 : num }))
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return alert('タイトルを入力してください')
    
    setIsSaving(true)
    try {
      if (isEditing) {
        await updateMasterEpisode(
          initialEpisode.id,
          title,
          category,
          sections.conclusion,
          sections.challenge,
          sections.action,
          sections.result
        )
      } else {
        await createMasterEpisode(
          title,
          category,
          sections.conclusion,
          sections.challenge,
          sections.action,
          sections.result
        )
      }
      router.push('/episodes')
      router.refresh()
    } catch (err) {
      alert('保存に失敗しました')
    }
    setIsSaving(false)
  }

  const blocks = [
    { key: 'conclusion', label: '結論（1分要約）', qText: '一言で言うと？' },
    { key: 'challenge', label: '課題・背景', qText: '直面した困難など' },
    { key: 'action', label: '行動（具体的に）', qText: 'どう解決したか' },
    { key: 'result', label: '結果・学び', qText: '得られた成果' },
  ] as const

  return (
    <div className="max-w-4xl mx-auto pb-32">
      {/* 🌟 全体カード（画像の外側のグレー背景） */}
      <div className="bg-[#1c1c1e] rounded-[24px] p-6 md:p-8 shadow-xl border border-zinc-800/50">
        
        {/* ヘッダー・アクション */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <h1 className="text-xl md:text-2xl font-bold text-white flex items-center gap-3">
            <span className="text-zinc-300">📄</span> マスターエピソード・エディタ
          </h1>
          <div className="flex items-center gap-3">
            <button 
              type="button"
              className="bg-[#2c2c2e] hover:bg-[#3c3c3e] text-zinc-300 font-bold px-4 py-2.5 rounded-xl transition-colors text-sm border border-zinc-700 whitespace-nowrap"
            >
              ＋ エピソード追加
            </button>
            <button 
              type="button"
              onClick={handleSave}
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

        {/* --- 基本情報ブロック（タイトル・カテゴリ用） --- */}
        <div className="bg-[#121212] rounded-2xl p-6 mb-6 border border-zinc-800/30">
          <div className="mb-5">
            <label className="block text-sm font-bold text-zinc-400 mb-2">エピソードタイトル <span className="text-rose-500">*</span></label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-[#1f1f1f] text-zinc-200 p-3.5 rounded-xl border border-transparent focus:border-indigo-500/50 focus:outline-none transition-colors"
              placeholder="例：インターンでの営業推進"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-zinc-400 mb-2">カテゴリ</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORY_OPTIONS.map(opt => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setCategory(opt)}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-all border ${
                    category === opt
                      ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/50'
                      : 'bg-[#1f1f1f] text-zinc-400 border-transparent hover:bg-[#2a2a2a]'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 🌟 4ステップ・ブロック（画像の「Q1. 設問」と「回答内容」のセット） */}
        <div className="space-y-6">
          {blocks.map((block, index) => {
            const textValue = sections[block.key]
            const currentLimit = maxLengths[block.key]
            const currentLength = textValue.length
            const isOverLimit = currentLimit > 0 && currentLength > currentLimit

            return (
              <div key={block.key} className="bg-[#121212] rounded-2xl p-6 border border-zinc-800/30">
                
                {/* 設問エリア */}
                <div className="mb-5">
                  <label className="block text-xs font-bold text-zinc-400 mb-2">Q{index + 1}. {block.label}</label>
                  <div className="w-full bg-[#1f1f1f] text-zinc-200 p-3.5 rounded-xl font-medium border border-transparent">
                    {block.qText}
                  </div>
                </div>

                {/* 回答エリア */}
                <div className="mb-4">
                  <label className="block text-xs font-bold text-zinc-400 mb-2">回答内容</label>
                  <textarea
                    value={textValue}
                    onChange={(e) => handleTextChange(block.key, e.target.value)}
                    className={`w-full bg-[#1f1f1f] text-zinc-200 p-4 rounded-xl min-h-[140px] resize-y border focus:outline-none transition-colors leading-relaxed ${
                      isOverLimit ? 'border-rose-900/50 focus:border-rose-500/50' : 'border-transparent focus:border-indigo-500/50'
                    }`}
                    placeholder="回答を入力してください..."
                  />
                </div>

                {/* フッター（文字数・上限設定） */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-zinc-500">文字数上限 (任意):</span>
                    <input 
                      type="number" 
                      value={currentLimit || ''}
                      onChange={(e) => handleMaxLengthChange(block.key, e.target.value)}
                      className="w-16 bg-[#1f1f1f] text-zinc-300 text-xs font-bold p-1.5 rounded-md text-center border border-transparent focus:border-zinc-700 outline-none transition-colors"
                      placeholder="なし"
                    />
                  </div>
                  <div className={`text-xs font-bold ${isOverLimit ? 'text-rose-500' : 'text-zinc-500'}`}>
                    {currentLength} 文字 / {currentLimit > 0 ? currentLimit : '無制限'}
                  </div>
                </div>

              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
