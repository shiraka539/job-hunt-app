import { auth } from '@clerk/nextjs/server'
import EpisodeEditorClient from '../../../components/EpisodeEditorClient'
import Link from 'next/link'

export default async function NewEpisodePage() {
  const { userId } = await auth()
  if (!userId) return <div className="p-8 text-zinc-400">ログインしてください</div>

  return (
    <main className="min-h-screen p-4 md:p-8 pt-6 md:pt-10 max-w-6xl mx-auto">
      <div className="mb-8">
        <Link href="/episodes" className="text-sm font-bold text-zinc-500 hover:text-zinc-300 transition-colors mb-4 inline-block">
          &larr; エピソード一覧に戻る
        </Link>
        <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
          <span className="text-indigo-500">✨</span> 新規エピソード登録
        </h1>
        <p className="text-zinc-400 mt-2 text-sm">
          面接で「これを話せば間違いない」と思えるマスターエピソードを作成しましょう。
        </p>
      </div>

      <EpisodeEditorClient />
    </main>
  )
}
