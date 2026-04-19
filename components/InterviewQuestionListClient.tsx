'use client'

import { useState } from 'react'
import { deleteInterviewQuestion, updateInterviewQuestion } from '../app/actions/interview-questions'
import Link from 'next/link'

export default function InterviewQuestionListClient({ initialQuestions }: { initialQuestions: any[] }) {
  const [questions, setQuestions] = useState(initialQuestions)

  const handleDelete = async (id: string) => {
    if (!confirm('このメモを削除しますか？')) return
    
    // Optimistic update
    setQuestions(questions.filter(q => q.id !== id))
    
    try {
      await deleteInterviewQuestion(id)
    } catch (error) {
      alert('削除に失敗しました')
      // revert if possible, skipping for simplicity
    }
  }

  const toggleFrequent = async (id: string, currentStatus: boolean) => {
    // Optimistic update
    setQuestions(questions.map(q => q.id === id ? { ...q, isFrequent: !currentStatus } : q))
    try {
      await updateInterviewQuestion(id, { isFrequent: !currentStatus })
    } catch (error) {
      alert('更新に失敗しました')
    }
  }

  if (questions.length === 0) {
    return (
      <div className="bg-[#0a0a0a] border border-zinc-800 rounded-[32px] p-12 text-center shadow-lg mt-8">
        <div className="text-5xl mb-6 opacity-40">💬</div>
        <h2 className="text-xl font-bold text-zinc-300 mb-3">まだ質問が記録されていません</h2>
        <p className="text-zinc-500 text-sm max-w-md mx-auto leading-relaxed">
          面接で聞かれた質問を記録して、次の面接対策に役立てましょう！
        </p>
      </div>
    )
  }

  return (
    <div className="mt-8 space-y-4">
      {questions.map((q) => (
        <div key={q.id} className="bg-[#0a0a0a] border border-zinc-800 rounded-[24px] p-6 sm:p-8 relative group transition-all hover:border-zinc-700 shadow-sm">
          <div className="flex justify-between items-start gap-4 mb-5">
            <h3 className="text-lg sm:text-xl font-extrabold text-white leading-relaxed">
              Q. {q.content}
            </h3>
            <div className="flex items-center gap-2 shrink-0">
              <button 
                onClick={() => toggleFrequent(q.id, q.isFrequent)}
                className={`text-2xl transition-transform active:scale-90 ${q.isFrequent ? 'opacity-100' : 'opacity-20 hover:opacity-50 grayscale'}`}
                title={q.isFrequent ? 'よく聞かれる質問から外す' : 'よく聞かれる質問に入れる'}
              >
                🔥
              </button>
              <button 
                onClick={() => handleDelete(q.id)}
                className="text-zinc-600 hover:text-red-500 transition-colors p-1"
                title="削除"
              >
                🗑️
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs font-bold text-zinc-500 mb-5">
            {q.companyName && (
              <span className="bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-lg text-zinc-300">
                🏢 {q.companyName}
              </span>
            )}
            <span className="px-1">📅 {new Date(q.createdAt).toLocaleDateString()}</span>
          </div>

          <div className="space-y-3">
            {q.masterEpisode && (
              <div className="bg-indigo-900/10 border border-indigo-500/20 rounded-xl p-4">
                <div className="text-xs font-bold text-indigo-400/80 mb-1">使用したエピソード</div>
                <Link href={`/episodes/${q.masterEpisode.id}`} className="text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1.5 transition-colors">
                  📚 {q.masterEpisode.title} <span className="text-xs">&rarr;</span>
                </Link>
              </div>
            )}

            {q.answerMemo && (
              <div className="bg-zinc-900/50 rounded-xl p-4 text-sm text-zinc-300 border border-zinc-800/50 leading-relaxed">
                <div className="text-xs font-bold text-zinc-500 mb-2">📝 手応え・メモ</div>
                <p className="whitespace-pre-wrap">{q.answerMemo}</p>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
