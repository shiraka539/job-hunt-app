import { auth } from '@clerk/nextjs/server'
import { prisma } from '../../lib/prisma'
import Link from 'next/link'
import EpisodeListClient from '../../components/EpisodeListClient'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'マスターエピソード・バンク | JobHunt',
  description: '面接で使い回せる汎用的なエピソード管理',
}

export default async function EpisodeBankPage() {
  const { userId } = await auth()
  if (!userId) return <div className="p-8 text-zinc-400">ログインしてください</div>

  const episodes = await prisma.masterEpisode.findMany({
    where: { userId },
    orderBy: { updatedAt: 'desc' },
    include: {
      interviewQuestions: {
        select: { id: true }
      }
    }
  })

  return (
    <main className="min-h-screen p-4 md:p-8 pt-6 md:pt-10 max-w-6xl mx-auto">
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
            <span className="text-indigo-500">📚</span> マスターエピソード・バンク
          </h1>
          <p className="text-zinc-500 mt-2 text-sm md:text-base">
            面接で何度も使える「最強の汎用エピソード」をストックしましょう。
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Link href="/episodes/questions" className="text-sm font-bold bg-zinc-800 text-zinc-300 hover:text-white px-4 py-2.5 rounded-xl transition-colors flex items-center gap-2">
            <span>💬</span> 質問アーカイブ
          </Link>
          <Link href="/" className="text-sm font-bold bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white px-4 py-2.5 rounded-xl transition-colors hidden md:block">
            &larr; ダッシュボード
          </Link>
          <Link href="/episodes/new" className="bg-indigo-600 hover:bg-indigo-500 text-white border border-indigo-500 px-5 py-2.5 rounded-xl font-bold transition shadow-sm hover:shadow-indigo-500/20 active:scale-95 flex items-center gap-2">
            <span>➕</span> 新規登録
          </Link>
        </div>
      </div>

      {episodes.length === 0 ? (
        <div className="bg-[#0a0a0a] border border-zinc-800 rounded-[32px] p-12 text-center shadow-lg mt-10">
          <div className="text-5xl mb-6 opacity-40">🗄️</div>
          <h2 className="text-xl font-bold text-zinc-300 mb-3">まだエピソードがありません</h2>
          <p className="text-zinc-500 text-sm mb-8 max-w-md mx-auto leading-relaxed">
            まずは一番自信のあるエピソード（ガクチカ・自己PRなど）を登録して、いつでも面接で語れるように準備しましょう。
          </p>
          <Link href="/episodes/new" className="inline-block bg-indigo-600 text-white font-bold px-8 py-4 rounded-full shadow-lg hover:shadow-indigo-500/20 hover:bg-indigo-500 transition-all hover:-translate-y-1">
            最初のエピソードを作る
          </Link>
        </div>
      ) : (
        <EpisodeListClient initialEpisodes={episodes} />
      )}
    </main>
  )
}
