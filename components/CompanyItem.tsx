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
    <li className="border-b last:border-0 flex flex-col hover:bg-gray-50/50 transition duration-150">
      <div className="py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="w-6 h-6 flex items-center justify-center rounded hover:bg-gray-200 transition text-gray-600"
          >
            <span className={`transform transition-transform text-sm ${isOpen ? 'rotate-90' : ''}`}>▶</span>
          </button>
          
          <span className="font-semibold text-lg text-gray-800">{company.name}</span>
          <span className="text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 px-2 py-1 rounded">
            {company.status}
          </span>
        </div>
        
        {/* 右側のリンクとボタンエリア */}
        <div className="flex items-center gap-4">
          {company.myPageUrl ? (
            <a href={company.myPageUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:text-blue-800 underline transition">
              マイページへ ↗
            </a>
          ) : (
            <span className="text-sm text-gray-400">URL未登録</span>
          )}
          
          {/* 編集・削除ボタン */}
          <div className="flex items-center gap-2 border-l border-gray-200 pl-4 ml-2">
            <Link href={`/company/${company.id}/edit`} className="text-sm text-gray-500 hover:text-blue-600 transition">
              編集
            </Link>
            <button onClick={handleDelete} className="text-sm text-gray-500 hover:text-red-600 transition">
              削除
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="pl-10 pb-4 flex flex-wrap gap-3">
          <Link href={`/company/${company.id}/test`} className="text-sm bg-white hover:bg-blue-50 border border-gray-200 text-gray-700 py-1.5 px-3 rounded shadow-sm transition">
            📝 適性検査内容
          </Link>
          <Link href={`/company/${company.id}/es`} className="text-sm bg-white hover:bg-blue-50 border border-gray-200 text-gray-700 py-1.5 px-3 rounded shadow-sm transition">
            📄 ESの内容
          </Link>
          <Link href={`/company/${company.id}/interview`} className="text-sm bg-white hover:bg-blue-50 border border-gray-200 text-gray-700 py-1.5 px-3 rounded shadow-sm transition">
            🗣️ 面接対策
          </Link>
        </div>
      )}
    </li>
  )
}