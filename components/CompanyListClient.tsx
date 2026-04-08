'use client'

import { useState } from 'react'
import CompanyItem from './CompanyItem'
import { CompanyViewData } from '../types'
import { useSortedCompanies } from '../hooks/useSortedCompanies'

export default function CompanyListClient({ initialCompanies }: { initialCompanies: CompanyViewData[] }) {
  const { sortType, setSortType, sortedCompanies } = useSortedCompanies(initialCompanies)



  return (
    <>
      <div className="px-6 md:px-8 py-4 border-b border-zinc-800/80 flex flex-col sm:flex-row justify-between items-center gap-4 text-center sm:text-left">
        <h2 className="text-xl font-bold text-zinc-100">登録済み企業一覧</h2>
        <div className="flex items-center gap-2 relative">
          <span className="text-sm font-bold text-zinc-400 absolute left-3 pointer-events-none">↕️ 並び替え:</span>
          <select 
            value={sortType} 
            onChange={(e) => setSortType(e.target.value as any)}
            className="bg-zinc-800/80 border border-zinc-700 hover:border-zinc-500 transition-colors text-zinc-200 text-sm font-bold rounded-xl focus:ring-4 focus:ring-indigo-900/50 block pl-24 pr-8 py-2.5 outline-none cursor-pointer appearance-none min-w-[200px]"
          >
            <option value="deadline">締め切りが近い順</option>
            <option value="name">企業名 (カ行順)</option>
            <option value="status">進行度 (内定に近い順)</option>
          </select>
          <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 text-xs text-center flex items-center justify-center">▼</div>
        </div>
      </div>

      {sortedCompanies.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center px-4">
          <span className="text-6xl mb-4 opacity-50">📂</span>
          <p className="text-zinc-400 font-medium">まだ登録されている企業がありません。<br/>PCから「新規企業を登録」で始めましょう！</p>
        </div>
      ) : (
        <ul className="p-4 md:p-6 space-y-4 bg-black/20">
          {sortedCompanies.map((company) => (
            <CompanyItem key={company.id} company={company} />
          ))}
        </ul>
      )}
    </>
  )
}
