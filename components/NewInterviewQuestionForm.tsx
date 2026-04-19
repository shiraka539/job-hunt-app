'use client'

import { useState } from 'react'
import { createInterviewQuestion } from '../app/actions/interview-questions'

export default function NewInterviewQuestionForm({ episodes }: { episodes: any[] }) {
  const [isOpen, setIsOpen] = useState(false)
  const [content, setContent] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [masterEpisodeId, setMasterEpisodeId] = useState('')
  const [answerMemo, setAnswerMemo] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="w-full py-5 rounded-[24px] bg-zinc-900 border border-zinc-800/50 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all font-bold flex flex-col items-center justify-center gap-2 group shadow-sm hover:shadow-md"
      >
        <span className="text-3xl opacity-80 group-hover:scale-110 transition-transform">🔥</span>
        <span>今の面接の「Vibe」を忘れないうちに記録</span>
      </button>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return
    setIsSubmitting(true)
    
    try {
      await createInterviewQuestion({
        content,
        companyName,
        masterEpisodeId: masterEpisodeId || undefined,
        answerMemo
      })
      setContent('')
      setCompanyName('')
      setMasterEpisodeId('')
      setAnswerMemo('')
      setIsOpen(false)
    } catch (error) {
      console.error(error)
      alert('エラーが発生しました')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-[#0a0a0a] border border-zinc-800 rounded-[28px] p-6 sm:p-8 shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-red-500"></div>
      
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-extrabold text-white text-xl flex items-center gap-2">
          📝 質問を即記録
        </h3>
        <button type="button" onClick={() => setIsOpen(false)} className="text-zinc-500 hover:bg-zinc-900 px-3 py-1.5 rounded-lg text-sm font-bold transition-colors">
          キャンセル
        </button>
      </div>

      <div className="space-y-5">
        <div>
          <label className="block text-xs font-bold text-zinc-500 mb-2">何を聞かれた？ <span className="text-red-500">*</span></label>
          <textarea 
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="例：チームで意見が対立した時、あなたはどうしましたか？"
            className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-4 text-white placeholder:text-zinc-700 min-h-[100px] focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 transition-all resize-none shadow-inner"
            required
            autoFocus
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-bold text-zinc-500 mb-2">どの企業で？ (任意)</label>
            <input 
              type="text"
              value={companyName}
              onChange={e => setCompanyName(e.target.value)}
              placeholder="株式会社〇〇"
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3.5 text-white placeholder:text-zinc-700 focus:outline-none focus:border-zinc-600 transition-colors shadow-inner"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-zinc-500 mb-2">どう答えた？（エピソード紐付け）</label>
            <select
              value={masterEpisodeId}
              onChange={e => setMasterEpisodeId(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3.5 text-white focus:outline-none focus:border-zinc-600 transition-colors shadow-inner appearance-none cursor-pointer"
            >
              <option value="">紐付けない</option>
              {episodes.map(ep => (
                <option key={ep.id} value={ep.id}>📚 {ep.title}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-zinc-500 mb-2">手応え・反省メモ (任意)</label>
          <textarea 
            value={answerMemo}
            onChange={e => setAnswerMemo(e.target.value)}
            placeholder="「〇〇」と答えたら面接官が大きく頷いていた。このアピールは刺さるかも。"
            className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-4 text-white placeholder:text-zinc-700 min-h-[100px] focus:outline-none focus:border-zinc-600 transition-all resize-none shadow-inner"
          />
        </div>

        <div className="pt-2">
          <button 
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-white text-black font-extrabold py-4 rounded-2xl hover:bg-zinc-200 transition-colors disabled:opacity-50 text-lg flex items-center justify-center gap-2"
          >
            {isSubmitting ? '保存中...' : '記録する'}
          </button>
        </div>
      </div>
    </form>
  )
}
