'use client'

import { useState } from 'react'
import Link from 'next/link'
import { deleteTemplate } from '../app/actions'

type Template = {
  id: string
  name: string
  defaultText: string
}

export default function TemplateItem({ template }: { template: Template }) {
  const [isOpen, setIsOpen] = useState(false)

  const handleDelete = async () => {
    if (confirm(`「${template.name}」を削除してもよろしいですか？`)) {
      await deleteTemplate(template.id)
      window.location.reload()
    }
  }

  return (
    <li className="bg-zinc-900/50 border border-zinc-800 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 overflow-hidden group">
      <div 
        className="p-4 md:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-500 dark:text-indigo-400 flex flex-shrink-0 items-center justify-center font-bold text-lg group-hover:scale-110 transition-transform">
            💡
          </div>
          
          <span className="font-extrabold text-lg md:text-xl text-zinc-100 tracking-tight leading-tight">
            {template.name}
          </span>
        </div>
        
        {/* 編集・削除ボタン */}
        <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
          <Link href={`/templates/${template.id}/edit`} className="min-h-[44px] min-w-[44px] px-4 flex items-center justify-center text-sm font-bold text-zinc-300 bg-zinc-800/50 hover:bg-zinc-700 rounded-xl transition-colors border border-transparent hover:border-zinc-600">
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

      {/* アコーディオンの中身（本文） */}
      {isOpen && (
        <div className="px-5 pb-5 pt-2 border-t border-zinc-800/80 bg-zinc-900/30 animate-in slide-in-from-top-2 duration-200">
          <div className="bg-black/40 p-4 rounded-xl text-zinc-300 whitespace-pre-wrap text-sm border border-zinc-900 shadow-inner">
            {template.defaultText}
          </div>
        </div>
      )}
    </li>
  )
}