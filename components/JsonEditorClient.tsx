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
    <div className="bg-zinc-900 rounded-[2rem] shadow-none border border-zinc-800 p-4 md:p-8 mb-24 md:mb-0">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-xl md:text-2xl font-bold text-zinc-100 flex items-center gap-2">
          📄 ES設問・回答エディタ
        </h2>
        <div className="flex gap-3">
          <button 
            onClick={handleAdd}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold rounded-lg transition-colors border border-zinc-700"
          >
            ＋ 設問追加
          </button>
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg transition-all shadow-md active:scale-95 disabled:opacity-50"
          >
            {isSaving ? '保存中...' : '💾 保存する'}
          </button>
        </div>
      </div>

      {questions.length === 0 ? (
        <div className="text-center py-20 text-zinc-400 bg-zinc-800/50 rounded-2xl border border-zinc-800">
          <p className="mb-5 text-lg">まだ設問が登録されていません。</p>
          <p>右上の「＋ 設問追加」から登録してください。</p>
        </div>
      ) : (
        <div className="space-y-8">
          {questions.map((q, index) => (
            <div key={q.id} className="bg-black/40 border border-zinc-800 p-5 md:p-6 rounded-2xl relative group">
              <button 
                onClick={() => handleDelete(q.id)}
                className="absolute top-4 right-4 text-zinc-500 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity"
                title="削除"
              >
                ✖
              </button>
              
              <div className="mb-4">
                <label className="block text-sm font-bold text-zinc-400 mb-2">Q{index + 1}. 設問</label>
                <input 
                  type="text"
                  value={q.question}
                  onChange={e => handleUpdate(q.id, 'question', e.target.value)}
                  placeholder="例：学生時代に最も打ち込んだこと"
                  className="w-full bg-zinc-800/80 border border-zinc-700 rounded-xl p-3 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-bold text-zinc-400 mb-2">回答内容</label>
                <textarea 
                  value={q.answer}
                  onChange={e => handleUpdate(q.id, 'answer', e.target.value)}
                  placeholder="回答を入力..."
                  rows={4}
                  className="w-full bg-zinc-800/80 border border-zinc-700 rounded-xl p-4 text-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all leading-relaxed"
                />
                <div className={'text-right mt-1 text-xs font-bold ' + 
                  (q.maxLength && q.answer.length > q.maxLength ? 'text-rose-400' : 'text-zinc-500')
                }>
                  {q.answer.length} 文字 {q.maxLength ? `/ ${q.maxLength}` : ''}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-500 mr-2">文字数上限 (任意):</label>
                <input 
                  type="number"
                  value={q.maxLength || ''}
                  onChange={e => handleUpdate(q.id, 'maxLength', e.target.value ? parseInt(e.target.value) : null)}
                  placeholder="制限なし"
                  className="bg-zinc-800 border border-zinc-700 rounded-md px-2 py-1 text-sm text-zinc-300 w-24 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
