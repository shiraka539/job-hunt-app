import { auth } from '@clerk/nextjs/server'
import { prisma } from '../../../../lib/prisma'
import Link from 'next/link'
import EpisodeEditorClient from '../../../../components/EpisodeEditorClient'

type Props = {
  params: Promise<{ id: string }>
}

export default async function EditEpisodePage({ params }: Props) {
  const { id } = await params
  const { userId } = await auth()
  if (!userId) return <div className="p-8 text-zinc-400">ログインしてください</div>

  const episode = await prisma.masterEpisode.findUnique({
    where: { id, userId }
  })

  if (!episode) return <div className="p-8 text-zinc-400">エピソードが見つかりません。</div>

  return (
    <main className="min-h-screen p-4 md:p-8 pt-6 md:pt-10 max-w-6xl mx-auto">
      <div className="mb-8">
        <Link href="/episodes" className="text-sm font-bold text-zinc-500 hover:text-zinc-300 transition-colors mb-4 inline-block">
          &larr; エピソード一覧に戻る
        </Link>
        <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
          <span className="text-indigo-500">✏️</span> エピソード編集
        </h1>
        <p className="text-zinc-400 mt-2 text-sm">
          ブラッシュアップして、より完成度の高いマスターエピソードに育てましょう。
        </p>
      </div>

      <EpisodeEditorClient initialEpisode={{
        id: episode.id,
        title: episode.title,
        category: episode.category,
        summaryConclusion: episode.summaryConclusion,
        summaryChallenge: episode.summaryChallenge,
        summaryAction: episode.summaryAction,
        summaryResult: episode.summaryResult,
      }} />
    </main>
  )
}
