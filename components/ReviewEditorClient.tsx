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
        <div key={q.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 bg-gray-50 p-3 rounded border border-gray-100 flex items-center gap-3">
            <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-md text-base">Q{index + 1}</span>
            {q.title}
          </h2>

          {/* 自分の回答（読み取り専用で表示） */}
          <div className="mb-6">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">✍️ 自分の回答</h3>
            {q.content ? (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-5 text-gray-700 text-lg whitespace-pre-wrap leading-relaxed">
                {q.content}
              </div>
            ) : (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-5 text-gray-400 italic">
                まだ回答が入力されていません。
              </div>
            )}
          </div>

          {/* 添削入力エリア */}
          <div>
            <h3 className="text-sm font-bold text-emerald-600 mb-2 flex items-center gap-2">
              💡 添削・フィードバックを入力
            </h3>
            <textarea
              value={q.reviewContent || ''}
              onChange={(e) => handleChange(q.id, e.target.value)}
              className="w-full h-48 border border-emerald-200 rounded-lg p-5 text-emerald-900 text-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none resize-y leading-relaxed bg-emerald-50/30"
              placeholder="先輩やAIからもらったアドバイス、修正すべきポイントなどをここにメモしておきましょう..."
            />
          </div>
        </div>
      ))}

      {/* アクションバー */}
      <div className="fixed bottom-0 left-0 right-0 bg-white p-5 border-t-2 border-gray-200 flex justify-center z-50 shadow-2xl">
        <div className="max-w-4xl w-full flex justify-end items-center">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-10 py-4 min-w-[280px] rounded-xl text-xl font-extrabold transition-all flex items-center justify-center gap-3 shadow-lg hover:opacity-90 hover:scale-105"
            style={{ backgroundColor: isSaving ? '#9ca3af' : '#059669', color: '#ffffff', borderRadius: '12px' }}
          >
            {isSaving ? '保存中...' : '💾 添削を保存して戻る'}
          </button>
        </div>
      </div>
    </div>
  )
}