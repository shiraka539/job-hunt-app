import { prisma } from '../../../../../lib/prisma'
import Link from 'next/link'
import { auth } from '@clerk/nextjs/server'
import ReviewEditorClient from '../../../../../components/ReviewEditorClient'

type Props = {
  params: Promise<{ id: string; type: string }>
}

export default async function ReviewCompanyTypePage({ params }: Props) {
  const { id, type } = await params
  const { userId } = await auth()

  if (!userId) return <div>ログインしてください</div>

  const company = await prisma.company.findFirst({
    where: { id: id, userId: userId }
  })
  if (!company) return <div>権限がありません</div>

  const section = await prisma.section.findFirst({
    where: { companyId: id, type: type },
    include: { questions: { orderBy: { createdAt: 'asc' } } }
  })

  // 設問が1つもない場合は、編集モードへ誘導する
  if (!section || section.questions.length === 0) {
    return (
      <main className="min-h-screen p-8">
        <div className="max-w-4xl mx-auto text-center py-20 bg-zinc-900 rounded-xl shadow-sm border border-zinc-800">
          <p className="text-xl text-zinc-500 mb-6">まだ設問がありません。</p>
          <Link 
            href={`/company/${id}/${type}/edit`}
            className="bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 px-6 py-3 rounded-lg font-bold shadow-md hover:bg-indigo-600/40 transition"
          >
            ✍️ 先に編集モードで設問を追加する
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex items-center justify-between bg-zinc-900/50 p-4 rounded-xl shadow-sm border border-zinc-800">
          <h1 className="text-2xl font-bold text-zinc-100 flex items-center gap-3">
            👩‍🏫 {company.name} <span className="text-zinc-500 text-lg font-normal">/ 添削・フィードバック</span>
          </h1>
          <Link 
            href={`/company/${id}/${type}`} 
            className="text-zinc-400 hover:text-zinc-200 transition bg-zinc-800 px-4 py-2 border border-zinc-700 rounded-lg shadow-sm text-sm font-medium"
          >
            × 保存せずに戻る
          </Link>
        </div>

        {/* 🌟 添削用の神コンポーネントを呼び出す！ */}
        <ReviewEditorClient 
          questions={section.questions} 
          companyId={id} 
          type={type} 
        />
      </div>
    </main>
  )
}