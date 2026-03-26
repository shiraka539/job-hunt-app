'use client'

import { useState } from 'react'
import { updateReview } from '../app/actions'

type Question = {
  id: string
  title: string
  content: string | null
  reviewContent: string | null
}

type Props = {
  questions: Question[]
  companyId: string
  type: string
}

export default function ReviewEditorClient({ questions: initialQuestions, companyId, type }: Props) {
  const [questions, setQuestions] = useState<Question[]>(initialQuestions)
  const [isSaving, setIsSaving] = useState(false)

  const handleChange = (id: string, newReview: string) => {
    setQuestions(questions.map(q => q.id === id ? { ...q, reviewContent: newReview } : q))
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      for (const q of questions) {
        await updateReview(q.id, q.reviewContent || '')
      }
      alert('添削内容を保存しました！')
      window.location.href = `/company/${companyId}/${type}` // 閲覧画面に戻る
    } catch (error) {
      alert('保存に失敗しました')
    }
    setIsSaving(false)
  }

  return (
    <div className="space-y-10 pb-32">
      {questions.map((q, index) => (
        <div key={q.id} className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
          <h2 className="text-xl font-bold text-zinc-100 mb-4 bg-zinc-800/50 p-3 rounded border border-zinc-800 flex items-center gap-3">
            <span className="bg-emerald-900/50 text-emerald-400 px-3 py-1 rounded-md text-base">Q{index + 1}</span>
            {q.title}
          </h2>

          {/* 自分の回答（読み取り専用で表示） */}
          <div className="mb-6">
            <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-2">✍️ 自分の回答</h3>
            {q.content ? (
              <div className="bg-black/50 border border-zinc-800 rounded-lg p-5 text-zinc-300 text-lg whitespace-pre-wrap leading-relaxed">
                {q.content}
              </div>
            ) : (
              <div className="bg-black/50 border border-zinc-800 rounded-lg p-5 text-zinc-500 italic">
                まだ回答が入力されていません。
              </div>
            )}
          </div>

          {/* 添削入力エリア */}
          <div>
            <h3 className="text-sm font-bold text-emerald-400 mb-2 flex items-center gap-2">
              💡 添削・フィードバックを入力
            </h3>
            <textarea
              value={q.reviewContent || ''}
              onChange={(e) => handleChange(q.id, e.target.value)}
              className="w-full h-48 border border-emerald-800 rounded-lg p-5 text-emerald-100 text-lg focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 focus:outline-none resize-y leading-relaxed bg-emerald-900/10 placeholder:text-emerald-800"
              placeholder="先輩やAIからもらったアドバイス、修正すべきポイントなどをここにメモしておきましょう..."
            />
          </div>
        </div>
      ))}

      {/* アクションバー */}
      <div className="fixed bottom-0 left-0 right-0 bg-zinc-900/90 backdrop-blur-xl p-5 border-t border-zinc-800 flex justify-center z-50">
        <div className="max-w-4xl w-full flex justify-end items-center">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className={`px-10 py-4 min-w-[280px] rounded-xl text-xl font-extrabold transition-all flex items-center justify-center gap-3 border ${
              isSaving ? 'bg-zinc-800 text-zinc-500 border-zinc-700 cursor-not-allowed' : 'bg-emerald-600/90 hover:bg-emerald-500 text-white border-emerald-500 hover:scale-105'
            }`}
          >
            {isSaving ? '保存中...' : '💾 添削を保存して戻る'}
          </button>
        </div>
      </div>
    </div>
  )
}