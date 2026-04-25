'use client'

import React from 'react'

type Question = {
  id: string
  content: string
  companyName: string | null
  isFrequent: boolean
}

type Props = {
  questions: Question[]
  companyName: string
}

export default function QuestionSidebar({ questions, companyName }: Props) {
  const frequentQuestions = questions.filter(q => q.isFrequent)
  const companyQuestions = questions.filter(q => q.companyName === companyName && !q.isFrequent)

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 md:p-6 shadow-xl h-full overflow-y-auto w-full">
      <h2 className="text-xl font-bold flex items-center gap-2 mb-6 text-zinc-100">
        <span className="bg-amber-900/40 text-amber-500 rounded-lg p-2 text-base shadow-sm">🎯</span> 
        想定質問アーカイブ
      </h2>

      {questions.length === 0 ? (
        <div className="text-zinc-500 text-sm bg-black/40 p-5 rounded-2xl border border-zinc-800/80 text-center">
          この企業に関連する過去の質問や頻出質問はまだありません。
        </div>
      ) : (
        <div className="space-y-8">
          {/* 当該企業の過去質問 */}
          {companyQuestions.length > 0 && (
            <div>
              <h3 className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-500"></span> {companyName}の過去質問
              </h3>
              <ul className="space-y-3">
                {companyQuestions.map(q => (
                  <li key={q.id} className="bg-black/50 border border-zinc-800/80 p-4 rounded-2xl hover:border-indigo-500/30 transition-colors">
                    <p className="text-zinc-300 text-sm font-medium leading-relaxed">{q.content}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 頻出質問 */}
          {frequentQuestions.length > 0 && (
            <div>
              <h3 className="text-xs font-black text-rose-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-500"></span> 頻出質問
              </h3>
              <ul className="space-y-3">
                {frequentQuestions.map(q => (
                  <li key={q.id} className="bg-black/50 border border-zinc-800/80 p-4 rounded-2xl hover:border-rose-500/30 transition-colors relative">
                    <span className="absolute top-3 right-3 text-xs bg-rose-900/30 text-rose-300 px-2 py-0.5 rounded-full font-bold border border-rose-800/50">頻出</span>
                    <p className="text-zinc-300 text-sm font-medium leading-relaxed pr-10">{q.content}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
