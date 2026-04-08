import { prisma } from '../../../../lib/prisma'
import Link from 'next/link'
import { auth } from '@clerk/nextjs/server'
import JsonEditorClient from '../../../../components/JsonEditorClient'
import { CompanyQuestion } from '../../../../types'

type Props = {
  params: Promise<{ id: string }>
}

export default async function EsJsonPage({ params }: Props) {
  const { id } = await params
  const { userId } = await auth()

  if (!userId) return <div className="p-8">ログインしてください</div>

  const company = await prisma.company.findFirst({
    where: { id: id, userId: userId }
  })

  if (!company) return <div className="p-8">企業が見つからないか、アクセス権限がありません</div>

  // 🌟 自動データ補完・マイグレーション機能（Lazy Migration）
  let loadQuestions = company.questions as CompanyQuestion[] | null;

  // もしJSONにデータがなく、古いテーブル（Section/Question）にデータがある場合、それを引っ張ってくる
  if (!loadQuestions || loadQuestions.length === 0) {
    const oldSection = await prisma.section.findFirst({
      where: { companyId: id, type: 'es' },
      include: { questions: { orderBy: { createdAt: 'asc' } } }
    });

    if (oldSection && oldSection.questions && oldSection.questions.length > 0) {
      loadQuestions = oldSection.questions.map(q => ({
        id: q.id,
        question: q.title,
        answer: q.content || "",
        maxLength: q.maxLength || null
      }));
    }
  }

  const initialQuestions = loadQuestions || [];

  return (
    <main className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        
        {/* ヘッダー部分 */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between p-3 md:p-4 bg-zinc-900/50 rounded-xl shadow border border-zinc-800 gap-4">
          
          <div className="flex items-center gap-3">
            <Link href="/" className="text-zinc-400 hover:text-zinc-200 transition bg-zinc-800 px-3 py-1.5 md:px-4 md:py-2 border border-zinc-700 rounded-lg shadow-sm text-[10px] md:text-sm font-medium whitespace-nowrap">
              ← 戻る
            </Link>
            <h1 className="text-xl md:text-2xl font-bold text-zinc-100 truncate">
              {company.name} <span className="text-zinc-500 font-normal ml-1">/ ES設問エディタ (新方式)</span>
            </h1>
          </div>
        </div>

        {/* 閲覧・編集エリア */}
        <JsonEditorClient companyId={id} initialQuestions={initialQuestions} />

      </div>
    </main>
  )
}
