'use client'

import { useState } from 'react'
import { updateAnswer, addQuestion, deleteQuestion } from '../app/actions'
import { diffChars } from 'diff'

type Question = {
  id: string
  title: string
  content: string | null
  maxLength: number | null
  reviewContent: string | null
}

type Props = {
  sectionId: string
  initialQuestions: Question[]
  templates: any[]
}

export default function DiffEditorClient({ sectionId, initialQuestions, templates }: Props) {
  const [questions, setQuestions] = useState<Question[]>(initialQuestions)
  const [isDiffMode, setIsDiffMode] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const handleChange = (id: string, newContent: string) => {
    setQuestions(questions.map(q => q.id === id ? { ...q, content: newContent } : q))
  }

  const handleAddQuestion = async () => {
    const title = prompt('新しい設問のタイトルを入力してください\n（例：自己PR、学生時代に力を入れたこと）')
    if (!title) return

    const maxLengthStr = prompt('文字数制限を入力してください\n（制限がない場合は、何も入力せずにOKを押してください）\n（例：400）')
    const maxLength = maxLengthStr ? parseInt(maxLengthStr, 10) : null

    try {
      const newQuestion = await addQuestion(sectionId, title, maxLength)
      if (newQuestion && newQuestion.id) {
        setQuestions([...questions, newQuestion as Question])
      } else {
        window.location.reload()
      }
    } catch (error) {
      alert('設問の追加に失敗しました')
    }
  }

  const handleDeleteQuestion = async (id: string) => {
    if (!confirm('本当にこの設問を削除しますか？\n（入力した回答もすべて消えます！）')) return

    try {
      await deleteQuestion(id) // DBから削除
      setQuestions(questions.filter(q => q.id !== id)) // 画面からも消す
    } catch (error) {
      alert('削除に失敗しました')
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      for (const q of questions) {
        await updateAnswer(q.id, q.content || '')
      }
      alert('保存しました！')
      setIsDiffMode(false)
    } catch (error) {
      alert('保存に失敗しました')
    }
    setIsSaving(false)
  }

  return (
    <div className="pb-32">
      {/* 🌟 全体カード（画像の外側のグレー背景） */}
      <div className="bg-[#1c1c1e] rounded-[24px] p-6 md:p-8 shadow-xl border border-zinc-800/50">
        
        {/* ヘッダー・アクション */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-3">
              <span className="text-zinc-300">📄</span> ES設問・回答エディタ
            </h2>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setIsDiffMode(!isDiffMode)}
                className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors border ${
                  isDiffMode 
                    ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' 
                    : 'bg-zinc-800/50 text-zinc-400 border-zinc-700/50 hover:bg-zinc-800'
                }`}
              >
                {isDiffMode ? '👀 差分モードON' : '差分を確認'}
              </button>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={handleAddQuestion}
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
              const originalText = initialQuestions.find(orig => orig.id === q.id)?.content || ''
              const currentText = q.content || ''
              
              const changes = diffChars(originalText, currentText)
              const currentLength = currentText.length
              const isOverLimit = q.maxLength ? currentLength > q.maxLength : false

              return (
                <div key={q.id} className="bg-[#121212] rounded-2xl p-6 border border-zinc-800/30 relative group">
                  <button 
                    onClick={() => handleDeleteQuestion(q.id)}
                    className="absolute top-4 right-4 text-zinc-600 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="削除"
                  >
                    ✖
                  </button>
                  
                  {/* 設問エリア */}
                  <div className="mb-5">
                    <label className="block text-xs font-bold text-zinc-400 mb-2">Q{index + 1}. 設問</label>
                    <div className="w-full bg-[#1f1f1f] text-zinc-200 p-3.5 rounded-xl font-medium border border-transparent">
                      {q.title}
                    </div>
                  </div>

                  {/* 回答エリア */}
                  <div className="mb-4 relative">
                    <div className="flex justify-between items-end mb-2">
                      <label className="block text-xs font-bold text-zinc-400">回答内容</label>
                      {/* AIレビュー結果の表示（あれば） */}
                      {q.reviewContent && (
                        <div className="bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs px-3 py-1.5 rounded-lg flex items-center gap-2 max-w-md">
                          <span className="text-indigo-400">🤖</span> 
                          <span className="truncate">{q.reviewContent}</span>
                        </div>
                      )}
                    </div>
                    
                    {isDiffMode ? (
                      <div className="w-full bg-[#1f1f1f] text-zinc-200 p-4 rounded-xl min-h-[140px] border border-transparent font-mono whitespace-pre-wrap leading-relaxed break-words">
                        {changes.map((part, i) => (
                          <span key={i} className={
                            part.added ? 'bg-emerald-500/20 text-emerald-300 rounded px-1' :
                            part.removed ? 'bg-rose-500/20 text-rose-300 line-through rounded px-1 opacity-60' : ''
                          }>
                            {part.value}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <textarea
                        value={currentText}
                        onChange={(e) => handleChange(q.id, e.target.value)}
                        placeholder="回答を入力してください..."
                        className={`w-full bg-[#1f1f1f] text-zinc-200 p-4 rounded-xl min-h-[140px] resize-y border focus:outline-none transition-colors leading-relaxed ${
                          isOverLimit ? 'border-rose-900/50 focus:border-rose-500/50' : 'border-transparent focus:border-indigo-500/50'
                        }`}
                      />
                    )}
                  </div>

                  {/* フッター（文字数・上限設定） */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-zinc-500">文字数上限:</span>
                      <div className="w-16 bg-[#1f1f1f] text-zinc-300 text-xs font-bold p-1.5 rounded-md text-center border border-transparent opacity-70 cursor-not-allowed">
                        {q.maxLength || 'なし'}
                      </div>
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