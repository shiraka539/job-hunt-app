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
    <li className="border-b last:border-0 flex flex-col hover:bg-gray-50/50 transition duration-150">
      <div className="py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="w-6 h-6 flex items-center justify-center rounded hover:bg-gray-200 transition text-gray-600"
          >
            <span className={`transform transition-transform text-sm ${isOpen ? 'rotate-90' : ''}`}>▶</span>
          </button>
          
          <span className="font-semibold text-lg text-gray-800">{template.name}</span>
        </div>
        
        {/* 編集・削除ボタン */}
        <div className="flex items-center gap-2 border-l border-gray-200 pl-4 ml-2">
          <Link href={`/templates/${template.id}/edit`} className="text-sm text-gray-500 hover:text-blue-600 transition">
            編集
          </Link>
          <button onClick={handleDelete} className="text-sm text-gray-500 hover:text-red-600 transition">
            削除
          </button>
        </div>
      </div>

      {/* アコーディオンの中身（本文） */}
      {isOpen && (
        <div className="pl-10 pb-4">
          <div className="bg-gray-50 p-4 rounded text-gray-700 whitespace-pre-wrap text-sm border border-gray-200 shadow-inner">
            {template.defaultText}
          </div>
        </div>
      )}
    </li>
  )
}