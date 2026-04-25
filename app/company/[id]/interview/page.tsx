import { prisma } from '@/lib/prisma'
import { auth } from '@clerk/nextjs/server'
import Link from 'next/link'
import InterviewJsonEditorClient from '@/components/InterviewJsonEditorClient'
import { InterviewQuestionJson } from '@/types'

type Props = {
  params: Promise<{ id: string }>
}

export default async function InterviewBoardPage({ params }: Props) {
  const { id } = await params
  const { userId } = await auth()

  if (!userId) return <div className="p-8">ログインしてください</div>

  const company = await prisma.company.findUnique({
    where: { id: id }
  })

  if (!company || company.userId !== userId) return <div className="p-8">企業が見つからないか、アクセス権限がありません</div>

  // JSONデータのロード
  const initialQuestions = (company.interviewQuestions as unknown as InterviewQuestionJson[]) || []

  return (
    <main className="min-h-screen bg-black p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        
        {/* ヘッダー部分 */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between p-3 md:p-4 bg-zinc-900/50 rounded-xl shadow border border-zinc-800 gap-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-zinc-400 hover:text-zinc-200 transition bg-zinc-800 px-3 py-1.5 md:px-4 md:py-2 border border-zinc-700 rounded-lg shadow-sm text-[10px] md:text-sm font-medium whitespace-nowrap">
              ← 戻る
            </Link>
            <h1 className="text-xl md:text-2xl font-bold text-zinc-100 truncate">
              {company.name} <span className="text-zinc-500 font-normal ml-1">/ 面接対策ボード</span>
            </h1>
          </div>
        </div>

        {/* 閲覧・編集エリア */}
        <InterviewJsonEditorClient companyId={id} initialQuestions={initialQuestions} />

      </div>
    </main>
  )
}
