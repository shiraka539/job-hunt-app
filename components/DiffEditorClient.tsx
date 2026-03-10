'use client'

import { useState } from 'react'
import { updateAnswer, addQuestion } from '../app/actions'
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
    <div className="space-y-8 pb-32">
      {/* 設問一覧 */}
      {questions.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-lg border border-gray-200 shadow-sm">
          <p className="text-gray-500 mb-6 text-lg">まだ設問がありません。下のボタンから追加してください。</p>
        </div>
      ) : (
        questions.map((q, index) => {
          const originalText = initialQuestions.find(orig => orig.id === q.id)?.content || ''
          const currentText = q.content || ''
          
          // 差分を計算
          const changes = diffChars(originalText, currentText)
          
          const isOverLimit = q.maxLength ? currentText.length > q.maxLength : false

          return (
            <div key={q.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-end mb-4 bg-gray-50 p-3 rounded border border-gray-100">
                <h2 className="text-xl font-bold text-gray-800">
                  Q{index + 1}. {q.title}
                </h2>
                {q.maxLength && (
                  <span className="text-sm bg-gray-200 text-gray-700 px-2 py-1 rounded font-bold">
                    上限 {q.maxLength}文字
                  </span>
                )}
              </div>

              {/* 添削内容は編集モードの時だけ上部に表示（参考用） */}
              {!isDiffMode && q.reviewContent && (
                <div className="mb-5 bg-emerald-50 border border-emerald-100 rounded-lg p-4">
                  <h3 className="text-sm font-bold text-emerald-800 mb-2 flex items-center gap-2">
                    💡 添削・フィードバック（参考用）
                  </h3>
                  <p className="text-emerald-900 whitespace-pre-wrap leading-relaxed text-sm">
                    {q.reviewContent}
                  </p>
                </div>
              )}

              {isDiffMode ? (
                // 🔍 【差分確認モード】上下分離UI！
                <div className="space-y-6">
                  
                  {/* 🔴 【編集前 (Original)】：消した文字を赤い蛍光マーカーに！ */}
                  <div className="bg-white border-2 border-red-100 rounded-lg p-6 shadow-inner">
                    <h3 className="text-sm font-bold text-red-700 mb-3 flex items-center gap-2">
                      <span className="bg-red-100 p-1 rounded">🔴</span> 編集前 (Original)
                    </h3>
                    <p className="text-lg text-gray-800 whitespace-pre-wrap leading-relaxed">
                      {originalText === currentText ? (
                        <span className="text-gray-400">変更はありません</span>
                      ) : (
                        changes.map((part, i) => {
                          // 🌟 消された文字だけを赤い蛍光マーカーに！
                          if (part.removed) {
                            return <span key={i} className="bg-red-200 text-red-900 px-1 rounded mx-0.5">{part.value}</span>
                          } else if (!part.added) {
                            // 追加された文字は表示しない（編集前の元の文章だから）
                            return <span key={i} className="text-gray-800">{part.value}</span>
                          }
                          return null; // 追加された文字はnullでスキップ
                        })
                      )}
                    </p>
                  </div>

                  {/* 🟢 【編集後 (Edited)】：足した文字を緑の蛍光マーカーに！ */}
                  <div className="bg-white border-2 border-green-100 rounded-lg p-6 shadow-inner">
                    <h3 className="text-sm font-bold text-green-700 mb-3 flex items-center gap-2">
                      <span className="bg-green-100 p-1 rounded">🟢</span> 編集後 (Edited)
                    </h3>
                    <p className="text-lg text-gray-800 whitespace-pre-wrap leading-relaxed">
                      {originalText === currentText ? (
                        <span className="text-gray-400">変更はありません</span>
                      ) : (
                        changes.map((part, i) => {
                          // 🌟 追加された文字だけを緑の蛍光マーカーに！
                          if (part.added) {
                            return <span key={i} className="bg-green-200 text-green-900 px-1 rounded font-medium mx-0.5">{part.value}</span>
                          } else if (!part.removed) {
                            // 消された文字は表示しない（編集後の今の文章だから）
                            return <span key={i} className="text-gray-800">{part.value}</span>
                          }
                          return null; // 消された文字はnullでスキップ
                        })
                      )}
                    </p>
                  </div>
                </div>
              ) : (
                // ✍️ 【編集モード】
                <div className="relative">
                  <textarea
                    value={currentText}
                    onChange={(e) => handleChange(q.id, e.target.value)}
                    className={`w-full h-64 border rounded-md p-5 pb-12 text-gray-900 text-lg focus:ring-2 focus:outline-none resize-y leading-relaxed ${
                      isOverLimit ? 'border-red-400 focus:ring-red-500 bg-red-50/20' : 'border-gray-300 focus:ring-blue-500'
                    }`}
                    placeholder="回答を入力してください..."
                  />
                  <div className={`absolute bottom-4 right-5 text-base font-bold ${isOverLimit ? 'text-red-500' : 'text-gray-400'}`}>
                    {currentText.length} {q.maxLength ? `/ ${q.maxLength} 文字` : '文字'}
                  </div>
                </div>
              )}
            </div>
          )
        })
      )}

      {/* 設問追加ボタン */}
      {!isDiffMode && (
        <div className="flex justify-center py-4">
          <button
            onClick={handleAddQuestion}
            className="text-blue-700 font-bold bg-blue-50 w-full py-5 text-lg rounded-xl border-2 border-dashed border-blue-300 hover:bg-blue-100 hover:border-blue-400 transition-all shadow-sm flex items-center justify-center gap-2"
          >
            ＋ 新しい設問を追加する
          </button>
        </div>
      )}

{/* 🌟 強化されたド派手なアクションバー（ゆとりを持たせたエレガント版） */}
      <div className="fixed bottom-0 left-0 right-0 bg-white p-5 border-t-2 border-gray-200 flex justify-center z-50 shadow-2xl">
        <div className="max-w-4xl w-full flex justify-between items-center gap-6">
          
          {isDiffMode ? (
            // 🔍 差分モード中
            <>
              <button
                onClick={() => setIsDiffMode(false)}
                className="px-5 py-3 text-base font-bold transition-all flex items-center gap-2" // 🌟 少しだけ小さくした
                style={{ backgroundColor: '#f3f4f6', color: '#374151', border: '1px solid #d1d5db', borderRadius: '12px' }}
              >
                ← ✍️ 編集に戻る
              </button>
              
              <div className="flex-1 text-center text-base font-bold p-3 hidden md:block mx-4" style={{ backgroundColor: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0', borderRadius: '12px' }}>
                差分を確認して、問題なければ確定してください。
              </div>

              <button
                onClick={handleSave}
                disabled={isSaving}
                // 🌟 text-xl -> text-lg に変更。min-w も少し控えめに。
                className="px-8 py-3.5 min-w-[240px] text-lg font-extrabold transition-all flex items-center justify-center gap-2 shadow-lg hover:opacity-90 hover:scale-105"
                style={{ backgroundColor: isSaving ? '#9ca3af' : '#16a34a', color: '#ffffff', borderRadius: '12px' }}
              >
                {isSaving ? '保存中...' : '✅ 確定して保存'}
              </button>
            </>
          ) : (
            // ✍️ 編集モード中
            <>
              <p className="text-base font-bold p-3 hidden md:block flex-1 text-center mr-8" style={{ backgroundColor: '#f8fafc', color: '#475569', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
                推敲が終わったら、変更差分を確認しましょう。
              </p>
              
              <button
                onClick={() => setIsDiffMode(true)}
                // 🌟 text-xl -> text-lg に変更。min-w を 260px にしてゆとりを作った！
                className="px-8 py-3.5 min-w-[260px] flex-shrink-0 whitespace-nowrap ml-auto text-lg font-bold transition-all flex items-center justify-center gap-2 shadow-lg hover:opacity-90 hover:scale-105"
                style={{ backgroundColor: '#2563eb', color: '#ffffff', borderRadius: '12px' }}
              >
                💾 保存内容を確認
              </button>
            </>
          )}

        </div>
      </div>
    </div>
  )
}