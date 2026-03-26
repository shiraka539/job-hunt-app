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
// 🌟 追加：設問を削除する処理
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
    <div className="space-y-8 pb-32">
      {/* 設問一覧 */}
      {questions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center px-4 bg-zinc-900 rounded-[2rem] border border-zinc-800 shadow-sm transition-all">
          <span className="text-6xl mb-4 opacity-70">📝</span>
          <p className="text-zinc-400 font-black tracking-wide text-lg">まだESの内容が登録されていません。<br/>下のボタンから新しい設問を追加してください。</p>
        </div>
      ) : (
        questions.map((q, index) => {
          const originalText = initialQuestions.find(orig => orig.id === q.id)?.content || ''
          const currentText = q.content || ''
          
          // 差分を計算
          const changes = diffChars(originalText, currentText)
          
          const isOverLimit = q.maxLength ? currentText.length > q.maxLength : false

          return (
            <div key={q.id} className="bg-zinc-900/50 rounded-[2rem] shadow-none border border-zinc-800 p-6 md:p-8 transition-all">
              {/* ヘッダー部分 */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 bg-zinc-900 p-4 rounded-2xl border border-zinc-800/80">
                <h2 className="text-xl md:text-2xl font-extrabold text-zinc-100 tracking-tight">
                  <span className="text-indigo-400 mr-2">Q{index + 1}.</span> {q.title}
                </h2>
                
                <div className="flex items-center gap-3 self-end md:self-auto">
                  {q.maxLength && (
                    <span className="text-xs md:text-sm bg-zinc-800 text-zinc-300 px-3 py-1.5 rounded-lg font-bold">
                      上限 {q.maxLength}文字
                    </span>
                  )}
                  {/* 🌟 差分モードじゃない時だけゴミ箱を表示 */}
                  {!isDiffMode && (
                    <button
                      onClick={() => handleDeleteQuestion(q.id)}
                      className="text-sm text-rose-400 hover:text-rose-300 font-bold px-3 py-1.5 rounded-lg border border-transparent hover:border-rose-900/50 hover:bg-rose-900/20 active:scale-95 transition-all"
                    >
                      🗑️ 削除
                    </button>
                  )}
                </div>
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
                  <div className="bg-zinc-800/50 border-2 border-rose-900/50 rounded-[2rem] p-6 md:p-8 shadow-inner transition-colors">
                    <h3 className="text-sm font-bold text-rose-400 mb-4 flex items-center gap-2">
                      <span className="bg-rose-900/50 p-1.5 rounded-lg">🔴</span> 編集前 (Original)
                    </h3>
                    <p className="text-lg text-zinc-200 whitespace-pre-wrap leading-relaxed">
                      {originalText === currentText ? (
                        <span className="text-zinc-500">変更はありません</span>
                      ) : (
                        changes.map((part, i) => {
                          // 🌟 消された文字だけを赤い蛍光マーカーに！
                          if (part.removed) {
                            return <span key={i} className="bg-rose-900/70 text-rose-100 px-1 rounded mx-0.5">{part.value}</span>
                          } else if (!part.added) {
                            // 追加された文字は表示しない（編集前の元の文章だから）
                            return <span key={i}>{part.value}</span>
                          }
                          return null; // 追加された文字はnullでスキップ
                        })
                      )}
                    </p>
                  </div>

                  {/* 🟢 【編集後 (Edited)】：足した文字を緑の蛍光マーカーに！ */}
                  <div className="bg-zinc-800/50 border-2 border-emerald-900/50 rounded-[2rem] p-6 md:p-8 shadow-inner transition-colors">
                    <h3 className="text-sm font-bold text-emerald-400 mb-4 flex items-center gap-2">
                      <span className="bg-emerald-900/50 p-1.5 rounded-lg">🟢</span> 編集後 (Edited)
                    </h3>
                    <p className="text-lg text-zinc-200 whitespace-pre-wrap leading-relaxed">
                      {originalText === currentText ? (
                        <span className="text-zinc-500">変更はありません</span>
                      ) : (
                        changes.map((part, i) => {
                          // 🌟 追加された文字だけを緑の蛍光マーカーに！
                          if (part.added) {
                            return <span key={i} className="bg-emerald-900/70 text-emerald-100 px-1 rounded font-medium mx-0.5">{part.value}</span>
                          } else if (!part.removed) {
                            // 消された文字は表示しない（編集後の今の文章だから）
                            return <span key={i}>{part.value}</span>
                          }
                          return null; // 消された文字はnullでスキップ
                        })
                      )}
                    </p>
                  </div>
                </div>
              ) : (
                // ✍️ 【編集モード】
                <div className="relative mt-2">
                  <textarea
                    value={currentText}
                    onChange={(e) => handleChange(q.id, e.target.value)}
                    className={`w-full h-80 border rounded-2xl p-5 md:p-6 pb-14 text-zinc-100 bg-zinc-800 text-lg focus:ring-4 focus:outline-none resize-y leading-relaxed transition-all shadow-inner ${
                      isOverLimit ? 'border-rose-500 focus:ring-rose-900/30 bg-rose-900/10' : 'border-zinc-700 focus:ring-indigo-900/30 focus:border-indigo-500'
                    }`}
                    placeholder="回答を入力してください..."
                  />
                  <div className={`absolute bottom-5 right-6 text-sm font-black tracking-wide ${isOverLimit ? 'text-rose-400' : 'text-zinc-500'}`}>
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
        <div className="flex justify-center py-8">
          <button
            onClick={handleAddQuestion}
            className="text-indigo-400 font-extrabold bg-zinc-900/50 w-full py-6 md:py-8 text-lg rounded-[2rem] border-2 border-dashed border-zinc-700 hover:bg-zinc-800 hover:border-zinc-600 active:scale-[0.99] transition-all shadow-sm flex items-center justify-center gap-2"
          >
            ＋ 新しい設問を追加する
          </button>
        </div>
      )}

      {/* 🌟 ダークモード・Bento Grid対応アクションバー */}
      <div className="fixed bottom-0 md:bottom-6 left-0 right-0 bg-transparent flex justify-center z-50 pb-safe md:px-6 pointer-events-none"> 
        <div className="max-w-4xl w-full flex justify-between items-center gap-4 bg-zinc-900/90 md:bg-zinc-900/90 backdrop-blur-xl p-4 md:rounded-3xl border-t md:border border-zinc-800 pointer-events-auto">
          
          {isDiffMode ? (
            // 🔍 差分モード中
            <>
              <button
                onClick={() => setIsDiffMode(false)}
                className="px-5 py-3 md:py-4 text-sm md:text-base font-bold transition-all flex items-center gap-2 bg-zinc-800 text-zinc-300 border border-zinc-700 rounded-2xl hover:bg-zinc-700 active:scale-95"
              >
                ← ✍️ 戻る
              </button>
              
              <div className="flex-1 text-center text-sm font-bold px-4 hidden md:block text-emerald-400">
                差分を確認して、問題なければ確定してください。
              </div>

              <button
                onClick={handleSave}
                disabled={isSaving}
                className={`px-6 py-3 md:py-4 min-w-[200px] text-base md:text-lg font-extrabold transition-all flex items-center justify-center gap-2 rounded-2xl shadow-none hover:shadow-[0_4px_20px_rgba(16,185,129,0.2)] active:scale-95 ${
                  isSaving ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700' : 'bg-emerald-600/90 hover:bg-emerald-500 text-white border border-emerald-500'
                }`}
              >
                {isSaving ? '保存中...' : '✅ 確定して保存'}
              </button>
            </>
          ) : (
            // ✍️ 編集モード中
            <>
              <p className="text-sm font-bold px-4 hidden md:block flex-1 text-center text-zinc-400">
                推敲が終わったら、変更差分を確認しましょう。
              </p>
              
              <button
                onClick={() => setIsDiffMode(true)}
                className="w-full md:w-auto px-8 py-4 min-h-[56px] text-lg md:text-xl font-extrabold transition-all flex items-center justify-center gap-3 rounded-2xl active:scale-95 bg-indigo-600 hover:bg-indigo-500 text-white mx-auto md:ml-auto md:mr-0 shadow-none border border-indigo-500 hover:shadow-[0_8px_30px_rgb(79,70,229,0.2)]"
              >
                <span>💾</span> 確認モードへ進む
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}