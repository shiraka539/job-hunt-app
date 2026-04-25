import { auth } from '@clerk/nextjs/server'
import EpisodeEditorClient from '../../../components/EpisodeEditorClient'
import Link from 'next/link'

export default async function NewEpisodePage() {
  const { userId } = await auth()
  if (!userId) return <div className="p-8 text-zinc-400">ログインしてください</div>

  return (
    <main className="min-h-screen p-4 md:p-8 pt-6 md:pt-10 max-w-6xl mx-auto">
      {/* ヘッダー部分 */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between p-3 md:p-4 bg-zinc-900/50 rounded-xl shadow border border-zinc-800 gap-4">
        <div className="flex items-center gap-3">
          <Link href="/episodes" className="text-zinc-400 hover:text-zinc-200 transition bg-zinc-800 px-3 py-1.5 md:px-4 md:py-2 border border-zinc-700 rounded-lg shadow-sm text-[10px] md:text-sm font-medium whitespace-nowrap">
            ← 戻る
          </Link>
          <h1 className="text-xl md:text-2xl font-bold text-zinc-100 truncate">
            マスターエピソード <span className="text-zinc-500 font-normal ml-1">/ 新規登録</span>
          </h1>
        </div>
      </div>

      <EpisodeEditorClient />
    </main>
  )
}
