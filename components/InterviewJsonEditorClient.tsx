'use client'

import { useState } from 'react'
import { updateCompanyInterviewQuestions } from '@/app/actions'
import { useRouter } from 'next/navigation'
import { InterviewQuestionJson } from '@/types'

export default function InterviewJsonEditorClient({ companyId, initialQuestions }: { companyId: string, initialQuestions: InterviewQuestionJson[] }) {
  const [questions, setQuestions] = useState<InterviewQuestionJson[]>(
    Array.isArray(initialQuestions) ? initialQuestions : []
  )
  const [isSaving, setIsSaving] = useState(false)
  const router = useRouter()

  const handleAdd = () => {
    setQuestions([...questions, { 
      id: crypto.randomUUID(), 
      title: '', 
      conclusion: '', 
      challenge: '', 
      action: '', 
      result: '',
      conclusionMaxLength: null,
      challengeMaxLength: null,
      actionMaxLength: null,
      resultMaxLength: null
    }])
  }

  const handleUpdate = (id: string, field: keyof InterviewQuestionJson, value: any) => {
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
      await updateCompanyInterviewQuestions(companyId, questions)
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
            <span className="text-zinc-300">📄</span> 面接対策ボード
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
              const blocks = [
                { key: 'conclusion', label: '① 結論・強み', val: q.conclusion, max: q.conclusionMaxLength },
                { key: 'challenge', label: '② 課題・目標', val: q.challenge, max: q.challengeMaxLength },
                { key: 'action', label: '③ 具体行動', val: q.action, max: q.actionMaxLength },
                { key: 'result', label: '④ 結果・学び', val: q.result, max: q.resultMaxLength }
              ] as const;

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
                  <div className="mb-6">
                    <label className="block text-xs font-bold text-zinc-400 mb-2">Q{index + 1}. 設問 / テーマ</label>
                    <input 
                      type="text"
                      value={q.title}
                      onChange={e => handleUpdate(q.id, 'title', e.target.value)}
                      placeholder="例：自己PRを1分でお願いします"
                      className="w-full bg-[#1f1f1f] text-zinc-200 p-3.5 rounded-xl font-medium border border-transparent focus:border-indigo-500/50 focus:outline-none transition-colors"
                    />
                  </div>

                  {/* 4項目エリア */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-2">
                    {blocks.map(block => {
                      const isOverLimit = block.max && block.val.length > block.max;
                      return (
                        <div key={block.key} className="flex flex-col gap-2">
                          <label className="block text-xs font-bold text-zinc-400">{block.label}</label>
                          <textarea 
                            value={block.val}
                            onChange={e => handleUpdate(q.id, block.key, e.target.value)}
                            placeholder="回答を入力してください..."
                            className={`w-full bg-[#1f1f1f] text-zinc-200 p-4 rounded-xl min-h-[120px] resize-y border focus:outline-none transition-colors leading-relaxed ${
                              isOverLimit ? 'border-rose-900/50 focus:border-rose-500/50' : 'border-transparent focus:border-indigo-500/50'
                            }`}
                          />
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1 mt-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-zinc-500">上限:</span>
                              <input 
                                type="number"
                                value={block.max || ''}
                                onChange={e => handleUpdate(q.id, `${block.key}MaxLength` as keyof InterviewQuestionJson, e.target.value ? parseInt(e.target.value) : null)}
                                className="w-16 bg-[#1f1f1f] text-zinc-300 text-[10px] font-bold p-1 rounded-md text-center border border-transparent focus:border-zinc-700 outline-none transition-colors"
                                placeholder="なし"
                              />
                            </div>
                            <div className={`text-[10px] font-bold ${isOverLimit ? 'text-rose-500' : 'text-zinc-500'}`}>
                              {block.val.length} 文字 / {block.max ? block.max : '無制限'}
                            </div>
                          </div>
                        </div>
                      )
                    })}
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
