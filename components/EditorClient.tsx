'use client'

import { useState, useTransition, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { addQuestion, updateAnswer, deleteQuestion } from '../app/actions'

type Question = {
  id: string
  title: string
  content: string | null
  maxLength: number | null
}
type Template = {
  id: string
  name: string
  defaultText: string
}


export default function EditorClient({ sectionId, initialQuestions, templates }: { sectionId: string, initialQuestions: Question[], templates: Template[] }) {
  const [questions, setQuestions] = useState<Question[]>(initialQuestions)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  useEffect(() => {
    setQuestions(initialQuestions)
  }, [initialQuestions])
  // 設問の追加
  const handleAdd = () => {
    const title = prompt('設問を入力してください（例：自己PR）')
    if (!title) return
    const maxLengthStr = prompt('文字数の上限があれば入力してください（例：400）。なければそのままOK')
    const maxLength = maxLengthStr ? parseInt(maxLengthStr, 10) : null

    startTransition(async () => {
      await addQuestion(sectionId, title, maxLength)
      router.refresh() // 画面を更新して最新データを取得
    })
  }

  // 設問の削除
  const handleDelete = (id: string) => {
    if (!confirm('この設問を削除してもよろしいですか？')) return
    startTransition(async () => {
      await deleteQuestion(id)
      router.refresh()
    })
  }

  // 回答の保存
  const handleSave = (id: string, content: string) => {
    startTransition(async () => {
      await updateAnswer(id, content)
      alert('保存しました！')
    })
  }

  // 入力中の文字数をリアルタイムで画面に反映
  const handleContentChange = (index: number, newContent: string) => {
    const newQs = [...questions]
    newQs[index].content = newContent
    setQuestions(newQs)
  }

  return (
    <div className="space-y-8 mt-6">
      {questions.map((q, index) => {
        const currentLength = q.content?.length || 0
        const isOverLimit = q.maxLength ? currentLength > q.maxLength : false

        return (
          <div key={q.id} className="bg-zinc-900 p-6 rounded-lg shadow border border-zinc-800 relative group transition-all">
            <div className="flex justify-between items-start mb-4">
              {/* Notion風の見出しデザイン */}
              <h2 className="text-xl font-bold text-zinc-100 border-l-4 border-indigo-500 pl-3">
                {q.title}
              </h2>
              
              <div className="flex items-center gap-3">
                {/* ★ テンプレ挿入プルダウン */}
                {templates && templates.length > 0 && (
                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        const selected = templates.find(t => t.id === e.target.value)
                        if (selected) {
                          const current = q.content || ''
                          
                          // ★ 変更：すでに文字が入力されていて、かつテンプレと違う内容なら確認を出す！
                          if (current && current !== selected.defaultText) {
                            if (!confirm('現在の入力内容を消去して、テンプレートで上書きしますか？\n（※元の文章は消えてしまいます）')) {
                              e.target.value = '' // キャンセルされたらプルダウンを戻して終了
                              return
                            }
                          }
                          
                          // テンプレの内容で上書き（初期化して追加）する
                          handleContentChange(index, selected.defaultText)
                        }
                        e.target.value = '' // 選んだ後はプルダウンをリセット
                      }
                    }}
                    className="text-sm border border-zinc-700 rounded p-1.5 text-zinc-300 bg-zinc-800 hover:bg-zinc-700 cursor-pointer focus:outline-none transition"
                  >
                    <option value="">💡 テンプレ挿入...</option>
                    {templates.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                )}

                {/* 削除ボタン */}
                <button onClick={() => handleDelete(q.id)} className="text-sm text-rose-400 opacity-0 group-hover:opacity-100 transition">
                  削除
                </button>
              </div>
            </div>

            <textarea
              className="w-full h-48 p-4 border border-zinc-700 bg-zinc-800 rounded-md focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-y text-zinc-100"
              placeholder="ここに回答を入力..."
              value={q.content || ''}
              onChange={(e) => handleContentChange(index, e.target.value)}
            />

            <div className="flex justify-between items-center mt-3">
              {/* 文字数カウンター */}
              <div className={`text-sm font-medium ${isOverLimit ? 'text-rose-400' : 'text-zinc-500'}`}>
                {currentLength} {q.maxLength ? `/ ${q.maxLength} 文字` : '文字'}
              </div>
              
              <button 
                onClick={() => handleSave(q.id, q.content || '')}
                disabled={isPending}
                className="bg-indigo-600 text-white px-5 py-2 rounded-md hover:bg-indigo-500 transition disabled:opacity-50 text-sm font-medium shadow-sm"
              >
                {isPending ? '保存中...' : '保存する'}
              </button>
            </div>
          </div>
        )
      })}

      {/* 追加ボタン */}
      <button 
        onClick={handleAdd}
        className="w-full py-4 border-2 border-dashed border-zinc-700 text-zinc-500 rounded-lg hover:border-indigo-500 hover:text-indigo-400 transition font-medium flex items-center justify-center gap-2"
      >
        <span className="text-xl">+</span> 新しい設問を追加する
      </button>
    </div>
  )
}