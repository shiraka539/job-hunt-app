import { auth } from '@clerk/nextjs/server'
import { prisma } from '../lib/prisma'
import Link from 'next/link'
import CompanyListClient from '../components/CompanyListClient'
import { COMPANY_STATUS } from '../constants/status'

export default async function Home() {
  const { userId } = await auth()
  if (!userId) return <div>ログインしてください</div>

  const companies = await prisma.company.findMany({
    where: { userId: userId },
    orderBy: { deadline: 'asc' }
  })

  // =====================
  // 統計計算は削除
  // =====================

  // 締め切りが近い企業（7日以内、期限切れ含む）
  const now = new Date()
  const in7Days = new Date(now)
  in7Days.setDate(in7Days.getDate() + 7)

  const urgentCompanies = companies
    .filter(c => c.deadline !== null)
    .map(c => {
      const deadline = new Date(c.deadline!)
      const diffDays = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      return { ...c, diffDays }
    })
    .filter(c => c.diffDays <= 7)
    .sort((a, b) => a.diffDays - b.diffDays)

  return (
    <main className="p-4 md:p-8 pt-6 md:pt-10 min-h-[calc(100vh-64px)]">
      {/* 挨拶 */}
      <div className="mb-8 pl-2">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 drop-shadow-sm flex items-center gap-3">
          Hi, JobHunter <span className="animate-wave origin-bottom-right">👋</span>
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 mt-2 font-medium">今日の選考状況を確認しましょう。</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 w-full max-w-6xl mx-auto pb-6">

        {/* =======================
            Widget A: クイックアクション（PCのみ表示）
            ======================= */}
        <div className="hidden md:grid md:col-span-4 grid-cols-2 lg:grid-cols-1 gap-5">
          <Link href="/new" className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-[24px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-none hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group min-h-[140px] focus:outline-none focus:ring-4 focus:ring-indigo-300 active:scale-95">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-2xl backdrop-blur-sm">🏢</div>
            <div className="font-bold text-lg tracking-wide group-hover:translate-x-1 transition-transform mt-3 flex items-center justify-between">
              新規企業を登録 <span>&rarr;</span>
            </div>
          </Link>

          <Link href="/templates" className="bg-zinc-900/50 border border-zinc-800 rounded-[24px] p-6 shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.5)] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group min-h-[140px] focus:outline-none focus:ring-4 focus:ring-zinc-700 active:scale-95">
            <div className="w-12 h-12 bg-zinc-800/80 rounded-full flex items-center justify-center text-2xl">💡</div>
            <div className="font-bold text-lg text-zinc-100 tracking-wide group-hover:translate-x-1 transition-transform mt-3 flex items-center justify-between">
              テンプレ管理 <span>&rarr;</span>
            </div>
          </Link>

          <Link href="/history" className="bg-zinc-900/50 border border-zinc-800 rounded-[24px] p-6 shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.5)] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group min-h-[140px] focus:outline-none focus:ring-4 focus:ring-zinc-700 active:scale-95">
            <div className="w-12 h-12 bg-zinc-800/80 rounded-full flex items-center justify-center text-2xl">📖</div>
            <div className="font-bold text-lg text-zinc-100 tracking-wide group-hover:translate-x-1 transition-transform mt-3 flex items-center justify-between">
              自分史管理 <span>&rarr;</span>
            </div>
          </Link>
        </div>

        {/* =======================
            Widget A（モバイル）: クイックアクション
            ======================= */}
        <div className="md:hidden col-span-1 grid grid-cols-2 gap-4">
          <Link href="/templates" className="bg-zinc-900/50 border border-zinc-800 rounded-[24px] p-4 flex flex-col items-center gap-2 hover:border-zinc-700 transition-all active:scale-95">
            <div className="w-10 h-10 bg-zinc-800/80 rounded-full flex items-center justify-center text-xl flex-shrink-0">💡</div>
            <div className="font-bold text-sm text-zinc-100">テンプレ管理</div>
          </Link>
          <Link href="/history" className="bg-zinc-900/50 border border-zinc-800 rounded-[24px] p-4 flex flex-col items-center gap-2 hover:border-zinc-700 transition-all active:scale-95">
            <div className="w-10 h-10 bg-zinc-800/80 rounded-full flex items-center justify-center text-xl flex-shrink-0">📖</div>
            <div className="font-bold text-sm text-zinc-100">自分史管理</div>
          </Link>
        </div>

        {/* =======================
            Widget B: マスターエピソード・バンク
            ======================= */}
        <Link href="/episodes" className="md:col-span-8 bg-gradient-to-br from-indigo-900/20 via-zinc-900 to-black border border-indigo-500/20 rounded-[32px] p-6 md:p-8 shadow-sm flex flex-col justify-between min-h-[200px] md:min-h-[296px] group hover:border-indigo-500/50 hover:shadow-[0_8px_30px_rgb(79,70,229,0.15)] transition-all duration-500 relative overflow-hidden focus:outline-none focus:ring-4 focus:ring-indigo-500/50">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-20 -mt-20 group-hover:bg-indigo-500/20 transition-all duration-700"></div>
          
          <div className="relative z-10">
            <h2 className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></span> Episode Bank
            </h2>
            <h3 className="text-3xl md:text-4xl font-extrabold text-white mt-4 tracking-tight leading-tight drop-shadow-md">
              マスターエピソード的<br className="md:hidden" />バンク
            </h3>
            <p className="text-indigo-200/70 mt-4 max-w-md text-sm md:text-base font-medium leading-relaxed">
              面接で何度も使い回せる「最強のエピソード集」を構築。一瞬で思い出し、自信を持って語れるよう事前にストックを貯めましょう。
            </p>
          </div>
          
          <div className="mt-8 flex items-center gap-3 text-indigo-300 font-bold group-hover:text-indigo-200 transition-colors relative z-10">
            <div className="bg-indigo-600/20 px-5 py-2.5 rounded-full border border-indigo-500/30 flex items-center gap-2 group-hover:bg-indigo-500/40 transition-all backdrop-blur-sm shadow-sm">
              エピソードを管理する <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
            </div>
          </div>
        </Link>

        {/* =======================
            Widget C: 締め切り間近（データがある場合のみ表示）
            ======================= */}
        {urgentCompanies.length > 0 && (
          <div className="md:col-span-12 bg-amber-900/10 border border-amber-800/40 rounded-[24px] p-5 md:p-6">
            <h2 className="text-xs font-black text-amber-500 uppercase tracking-widest mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span> ⏰ 締め切り間近
            </h2>
            <div className="flex flex-wrap gap-3">
              {urgentCompanies.map(c => {
                const deadline = new Date(c.deadline!)
                const dateLabel = deadline.toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' })
                const isOverdue = c.diffDays < 0
                const isUrgent = c.diffDays >= 0 && c.diffDays <= 3

                return (
                  <div
                    key={c.id}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-bold transition-all ${
                      isOverdue
                        ? 'bg-rose-900/30 border-rose-800/50 text-rose-300'
                        : isUrgent
                        ? 'bg-amber-900/30 border-amber-700/50 text-amber-300'
                        : 'bg-zinc-800/40 border-zinc-700/50 text-zinc-300'
                    }`}
                  >
                    <span className="text-base">{isOverdue ? '🚨' : isUrgent ? '⚠️' : '📅'}</span>
                    <div>
                      <div className="text-zinc-100">{c.name}</div>
                      <div className={`text-xs font-normal mt-0.5 ${isOverdue ? 'text-rose-400' : isUrgent ? 'text-amber-400' : 'text-zinc-500'}`}>
                        {isOverdue ? `${dateLabel}（期限切れ）` : c.diffDays === 0 ? `${dateLabel}（今日！）` : `${dateLabel}（あと${c.diffDays}日）`}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* =======================
            Widget D: 企業一覧
            ======================= */}
        <div className="md:col-span-12 mt-4 bg-zinc-900 border border-zinc-800 rounded-[32px] shadow-sm overflow-hidden mb-8">
          <CompanyListClient 
            initialCompanies={companies.map(c => ({
              id: c.id,
              name: c.name,
              status: c.status,
              myPageUrl: c.myPageUrl,
              applicationId: c.applicationId,
              deadline: c.deadline ? c.deadline.toISOString() : null,
            }))} 
          />
        </div>

      </div>
    </main>
  )
}