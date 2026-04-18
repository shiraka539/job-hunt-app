'use client'

import { useState } from 'react'
import { createMasterEpisode, updateMasterEpisode } from '../app/actions'
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
  
  const [summaryConclusion, setConclusion] = useState(initialEpisode?.summaryConclusion || '')
  const [summaryChallenge, setChallenge] = useState(initialEpisode?.summaryChallenge || '')
  const [summaryAction, setAction] = useState(initialEpisode?.summaryAction || '')
  const [summaryResult, setResult] = useState(initialEpisode?.summaryResult || '')

  const [isSaving, setIsSaving] = useState(false)

  // リアルタイムタイマー計算用
  const totalLength = summaryConclusion.length + summaryChallenge.length + summaryAction.length + summaryResult.length
  const estSeconds = totalLength === 0 ? 0 : Math.max(10, Math.round((totalLength / 300) * 60))

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
          summaryConclusion,
          summaryChallenge,
          summaryAction,
          summaryResult
        )
      } else {
        await createMasterEpisode(
          title,
          category,
          summaryConclusion,
          summaryChallenge,
          summaryAction,
          summaryResult
        )
      }
      router.push('/episodes')
      router.refresh()
    } catch (err) {
      alert('保存に失敗しました')
    }
    setIsSaving(false)
  }

  return (
    <form onSubmit={handleSave} className="space-y-10 pb-32 max-w-4xl mx-auto">
      {/* 基本情報 */}
      <div className="bg-zinc-900 rounded-[24px] border border-zinc-800 p-6 md:p-8">
        <h2 className="text-xl font-bold text-zinc-100 mb-6 flex items-center gap-3">
          <span className="bg-indigo-900/50 text-indigo-400 px-3 py-1 rounded-md text-sm">Step 1</span>
          エピソードの基本情報
        </h2>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-zinc-400 mb-2">エピソードタイトル <span className="text-rose-500">*</span></label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-[#0a0a0a] border border-zinc-800 rounded-xl p-4 text-zinc-100 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-bold text-lg"
              placeholder="例：大学時代のインターンでの営業推進"
              required
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
                      ? 'bg-indigo-600/20 text-indigo-400 border-indigo-500/50 shadow-sm'
                      : 'bg-[#0a0a0a] text-zinc-500 border-zinc-800 hover:border-zinc-600'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 構造化要約 */}
      <div className="bg-zinc-900 rounded-[24px] border border-zinc-800 p-6 md:p-8 relative overflow-hidden">
        {/* 背景の光彩 */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl -mr-40 -mt-20 pointer-events-none"></div>

        <div className="flex items-start justify-between mb-8 relative z-10">
          <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-3">
            <span className="bg-indigo-900/50 text-indigo-400 px-3 py-1 rounded-md text-sm">Step 2</span>
            面接用の構成（4パッセージ）
          </h2>
          
          <div className="bg-[#0a0a0a] border border-zinc-800 px-4 py-2 rounded-xl flex items-center gap-3 text-sm">
            <span className="text-zinc-500 font-bold">合計文字数: <span className="text-zinc-300">{totalLength}文字</span></span>
            <span className="text-zinc-700">|</span>
            <span className="text-zinc-500 font-bold">話す時間目安: <span className={estSeconds > 60 ? 'text-rose-400' : 'text-indigo-400'}>約{estSeconds}秒</span></span>
          </div>
        </div>

        <div className="space-y-6 relative z-10">
          {/* 結論 */}
          <div className="bg-[#0a0a0a] border border-amber-900/30 rounded-xl p-5 focus-within:border-amber-500/50 focus-within:ring-1 focus-within:ring-amber-500/50 transition-all">
            <label className="text-sm font-black text-amber-500 uppercase tracking-widest mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span> Conclusion / 結論・結果
            </label>
            <p className="text-xs text-zinc-500 mb-3">面接官の興味を惹くため、一番の成果や一言で表す特徴を最初に伝えます。</p>
            <textarea
              value={summaryConclusion}
              onChange={(e) => setConclusion(e.target.value)}
              className="w-full h-24 bg-transparent text-amber-100/90 focus:outline-none resize-none leading-relaxed"
              placeholder="例：インターン先の営業組織にて、新規開拓フローを見直し、月の成約数を150%向上させました。"
            />
          </div>

          {/* 課題 */}
          <div className="bg-[#0a0a0a] border border-rose-900/30 rounded-xl p-5 focus-within:border-rose-500/50 focus-within:ring-1 focus-within:ring-rose-500/50 transition-all">
            <label className="text-sm font-black text-rose-500 uppercase tracking-widest mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500"></span> Challenge / 直面した課題
            </label>
            <p className="text-xs text-zinc-500 mb-3">その成果を出す前に、どんな困難や目標とのギャップがあったかを説明します。</p>
            <textarea
              value={summaryChallenge}
              onChange={(e) => setChallenge(e.target.value)}
              className="w-full h-24 bg-transparent text-rose-100/90 focus:outline-none resize-none leading-relaxed"
              placeholder="例：メンバーの士気は高いものの、各々が属人的な営業をしており、全体の成約率が伸び悩んでいました。"
            />
          </div>

          {/* 行動 */}
          <div className="bg-[#0a0a0a] border border-sky-900/30 rounded-xl p-5 focus-within:border-sky-500/50 focus-within:ring-1 focus-within:ring-sky-500/50 transition-all">
            <label className="text-sm font-black text-sky-500 uppercase tracking-widest mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-sky-500"></span> Action / 取った行動
            </label>
            <p className="text-xs text-zinc-500 mb-3">課題に対して、あなたが具体的にどう考え、何を実行したかを伝えます。</p>
            <textarea
              value={summaryAction}
              onChange={(e) => setAction(e.target.value)}
              className="w-full h-32 bg-transparent text-sky-100/90 focus:outline-none resize-none leading-relaxed"
              placeholder="例：トップ営業マンの商談に同席してトークスクリプトを言語化し、誰でも使えるマニュアルを作成しました。また、週1回のロールプレイング会を企画・実行しました。"
            />
          </div>

          {/* 結果詳細・学び */}
          <div className="bg-[#0a0a0a] border border-emerald-900/30 rounded-xl p-5 focus-within:border-emerald-500/50 focus-within:ring-1 focus-within:ring-emerald-500/50 transition-all">
            <label className="text-sm font-black text-emerald-500 uppercase tracking-widest mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Result & Learning / 結果詳細と学び
            </label>
            <p className="text-xs text-zinc-500 mb-3">最終的にどう定着したか、またはこの経験から得られた業務へのスタンス等を締めます。</p>
            <textarea
              value={summaryResult}
              onChange={(e) => setResult(e.target.value)}
              className="w-full h-24 bg-transparent text-emerald-100/90 focus:outline-none resize-none leading-relaxed"
              placeholder="例：結果的に部署全体の成約率が底上げされ、ノウハウを共有しチームで勝つことの重要性を学びました。"
            />
          </div>

        </div>
      </div>

      {/* アクションバー */}
      <div className="fixed bottom-0 left-0 right-0 bg-zinc-900/90 backdrop-blur-xl p-5 border-t border-zinc-800 flex justify-center z-50">
        <div className="max-w-4xl w-full flex justify-between items-center gap-4">
          <button type="button" onClick={() => router.back()} className="text-zinc-400 hover:text-zinc-100 font-bold px-4 py-2">
            キャンセル
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className={`min-w-[200px] px-8 py-4 rounded-full text-lg font-extrabold transition-all shadow-lg flex items-center justify-center gap-2 ${
              isSaving 
                ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' 
                : 'bg-indigo-600 hover:bg-indigo-500 text-white hover:shadow-[0_0_20px_rgba(79,70,229,0.4)] hover:-translate-y-1'
            }`}
          >
            {isSaving ? '保存中...' : (isEditing ? '更新を保存する' : '新しく登録する')}
          </button>
        </div>
      </div>
    </form>
  )
}
