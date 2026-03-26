'use client'

import { useState } from 'react'
import Link from 'next/link'
import { deleteCompany } from '../app/actions' // ← 追加

type Company = {
  id: string
  name: string
  status: string
  myPageUrl: string | null
}

export default function CompanyItem({ company }: { company: Company }) {
  const [isOpen, setIsOpen] = useState(false)

  // 削除ボタンを押したときの処理
  const handleDelete = async () => {
    if (confirm(`「${company.name}」を削除してもよろしいですか？\n※ESや面接のメモもすべて消去されます。`)) {
      await deleteCompany(company.id)
      window.location.reload() // 画面を更新してリストから消す
    }
  }

  return (
    <li className="bg-zinc-900/50 border border-zinc-800 rounded-2xl shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.5)] hover:-translate-y-1 transition-all duration-300 overflow-hidden group">
      <div 
        className="p-4 md:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-500 dark:text-indigo-400 flex flex-shrink-0 items-center justify-center font-bold text-lg group-hover:scale-110 transition-transform">
            {company.name.charAt(0)}
          </div>
          
          <div>
            <h3 className="font-extrabold text-lg md:text-xl text-zinc-100 tracking-tight leading-tight">
              {company.name}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-black text-indigo-300 bg-indigo-900/50 px-2 py-0.5 rounded-md border border-indigo-800/50">
                {company.status}
              </span>
            </div>
          </div>
        </div>
        
        {/* 右側のリンクとボタンエリア（クリックイベントを伝播させないため onClick=stopPropagation） */}
        <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
          {company.myPageUrl ? (
            <a href={company.myPageUrl} target="_blank" rel="noopener noreferrer" className="min-h-[44px] min-w-[44px] px-4 flex items-center justify-center text-sm font-bold text-indigo-400 bg-indigo-900/20 hover:bg-indigo-900/40 rounded-xl transition-colors border border-transparent hover:border-indigo-500/30">
              マイページ ↗
            </a>
          ) : null}
          
          {/* 編集・削除ボタン */}
          <Link href={`/company/${company.id}/edit`} className="min-h-[44px] min-w-[44px] px-4 flex items-center justify-center text-sm font-bold text-zinc-300 bg-zinc-800/50 hover:bg-zinc-700 rounded-xl transition-colors border border-transparent hover:border-zinc-600">
            編集
          </Link>
          <button onClick={handleDelete} className="min-h-[44px] min-w-[44px] px-4 flex items-center justify-center text-sm font-bold text-rose-400 bg-rose-900/20 hover:bg-rose-900/40 rounded-xl transition-colors border border-transparent hover:border-rose-800/50">
            削除
          </button>
          
          <div className={`ml-2 transform text-zinc-500 transition-transform duration-300 flex items-center justify-center w-8 h-8 rounded-full ${isOpen ? 'rotate-180 bg-zinc-800' : 'bg-transparent'}`}>
            ▼
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="px-5 pb-5 pt-2 border-t border-zinc-800/80 bg-zinc-900/30 flex flex-wrap gap-3 animate-in slide-in-from-top-2 duration-200">
          <Link href={`/company/${company.id}/test`} className="flex-1 min-w-[140px] text-center text-sm font-bold bg-zinc-900 hover:bg-indigo-900/20 hover:border-indigo-500/50 hover:text-indigo-300 border border-zinc-800 text-zinc-300 p-4 min-h-[44px] rounded-xl shadow-none transition-all">
            📝 適性検査
          </Link>
          <Link href={`/company/${company.id}/es`} className="flex-1 min-w-[140px] text-center text-sm font-bold bg-zinc-900 hover:bg-emerald-900/20 hover:border-emerald-500/50 hover:text-emerald-300 border border-zinc-800 text-zinc-300 p-4 min-h-[44px] rounded-xl shadow-none transition-all">
            📄 ES内容
          </Link>
          <Link href={`/company/${company.id}/interview`} className="flex-1 min-w-[140px] text-center text-sm font-bold bg-zinc-900 hover:bg-amber-900/20 hover:border-amber-500/50 hover:text-amber-300 border border-zinc-800 text-zinc-300 p-4 min-h-[44px] rounded-xl shadow-none transition-all">
            🗣️ 面接対策
          </Link>
        </div>
      )}
    </li>
  )
}