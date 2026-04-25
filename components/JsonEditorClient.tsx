'use client'

import { useState } from 'react'
import { updateCompanyQuestions } from '../app/actions'
import { useRouter } from 'next/navigation'
import { CompanyQuestion } from '../types'

export default function JsonEditorClient({ companyId, initialQuestions }: { companyId: string, initialQuestions: CompanyQuestion[] }) {
  const [questions, setQuestions] = useState<CompanyQuestion[]>(
    Array.isArray(initialQuestions) ? initialQuestions : []
  )
  const [isSaving, setIsSaving] = useState(false)
  const router = useRouter()

  const handleAdd = () => {
    setQuestions([...questions, { id: crypto.randomUUID(), question: '', answer: '', maxLength: null }])
  }

  const handleUpdate = (id: string, field: keyof CompanyQuestion, value: any) => {
    setQuestions(questions.map(q => q.id === id ? { ...q, [field]: value } : q))
  }

  const handleDelete = (id: string) => {
    if (confirm('この設問を削除してもよろしいですか？')) {
      setQuestions(questions.filter(q => q.id !== id))
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await updateCompanyQuestions(companyId, questions)
      alert('保存しました！')
      router.refresh()
    } catch (e) {
      alert('保存に失敗しました')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="pb-32">
      {/* 🌟 全体カード（画像の外側のグレー背景） */}
      <div className="bg-[#1c1c1e] rounded-[24px] p-6 md:p-8 shadow-xl border border-zinc-800/50">
        
        {/* ヘッダー・アクション */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-3">
            <span className="text-zinc-300">📄</span> ES設問・回答エディタ
          </h2>
          <div className="flex items-center gap-3">
            <button 
              onClick={handleAdd}
              className="bg-[#2c2c2e] hover:bg-[#3c3c3e] text-zinc-300 font-bold px-4 py-2.5 rounded-xl transition-colors text-sm border border-zinc-700 whitespace-nowrap"
            >
              ＋ 設問追加
            </button>
            <button 
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

        {questions.length === 0 ? (
          <div className="text-center py-20 text-zinc-400 bg-[#121212] rounded-2xl border border-zinc-800/30">
            <p className="mb-5 text-lg font-bold">まだ設問が登録されていません。</p>
            <p className="text-sm">右上の「＋ 設問追加」から登録してください。</p>
          </div>
        ) : (
          <div className="space-y-6">
            {questions.map((q, index) => {
              const currentLength = q.answer.length
              const isOverLimit = q.maxLength && currentLength > q.maxLength

              return (
                <div key={q.id} className="bg-[#121212] rounded-2xl p-6 border border-zinc-800/30 relative group">
                  <button 
                    onClick={() => handleDelete(q.id)}
                    className="absolute top-4 right-4 text-zinc-600 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="削除"
                  >
                    ✖
                  </button>
                  
                  {/* 設問エリア */}
                  <div className="mb-5">
                    <label className="block text-xs font-bold text-zinc-400 mb-2">Q{index + 1}. 設問</label>
                    <input 
                      type="text"
                      value={q.question}
                      onChange={e => handleUpdate(q.id, 'question', e.target.value)}
                      placeholder="例：応募コースを希望する理由を教えてください。"
                      className="w-full bg-[#1f1f1f] text-zinc-200 p-3.5 rounded-xl font-medium border border-transparent focus:border-indigo-500/50 focus:outline-none transition-colors"
                    />
                  </div>

                  {/* 回答エリア */}
                  <div className="mb-4">
                    <label className="block text-xs font-bold text-zinc-400 mb-2">回答内容</label>
                    <textarea 
                      value={q.answer}
                      onChange={e => handleUpdate(q.id, 'answer', e.target.value)}
                      placeholder="回答を入力してください..."
                      className={`w-full bg-[#1f1f1f] text-zinc-200 p-4 rounded-xl min-h-[140px] resize-y border focus:outline-none transition-colors leading-relaxed ${
                        isOverLimit ? 'border-rose-900/50 focus:border-rose-500/50' : 'border-transparent focus:border-indigo-500/50'
                      }`}
                    />
                  </div>

                  {/* フッター（文字数・上限設定） */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-zinc-500">文字数上限 (任意):</span>
                      <input 
                        type="number"
                        value={q.maxLength || ''}
                        onChange={e => handleUpdate(q.id, 'maxLength', e.target.value ? parseInt(e.target.value) : null)}
                        className="w-16 bg-[#1f1f1f] text-zinc-300 text-xs font-bold p-1.5 rounded-md text-center border border-transparent focus:border-zinc-700 outline-none transition-colors"
                        placeholder="なし"
                      />
                    </div>
                    <div className={`text-xs font-bold ${isOverLimit ? 'text-rose-500' : 'text-zinc-500'}`}>
                      {currentLength} 文字 / {q.maxLength ? q.maxLength : '無制限'}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
