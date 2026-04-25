import { prisma } from '../../../../../lib/prisma'
import Link from 'next/link'
import { auth } from '@clerk/nextjs/server'
import DiffEditorClient from '../../../../../components/DiffEditorClient'

type Props = {
  params: Promise<{ id: string; type: string }>
}

export default async function EditCompanyTypePage({ params }: Props) {
  const { id, type } = await params
  const { userId } = await auth()

  if (!userId) return <div>ログインしてください</div>

  // 🌟 パフォーマンス改善：直列処理(ウォーターフォール)をなくし、3つの無関係なクエリを同時に並列取得します。
  const [company, initialSection, templates] = await Promise.all([
    prisma.company.findFirst({
      where: { id: id, userId: userId }
    }),
    prisma.section.findFirst({
      where: { companyId: id, type: type },
      include: { questions: { orderBy: { createdAt: 'asc' } } }
    }),
    prisma.template.findMany({
      where: { userId: userId },
      orderBy: { createdAt: 'desc' }
    })
  ])

  if (!company) return <div>権限がありません</div>

  let section = initialSection

  // セクションがなければ新規作成
  if (!section) {
    section = await prisma.section.create({
      data: { companyId: id, type: type },
      include: { questions: true }
    })
  }

  // もし適性検査(test)で、かつ設問が空っぽなら「Webテスト形式」という設問を自動作成
  if (type === 'test' && section.questions.length === 0) {
    const testQuestion = await prisma.question.create({
      data: { sectionId: section.id, title: 'Webテスト形式', content: '' }
    })
    section.questions = [testQuestion]
  }

  return (
    <main className="p-4 md:p-8 pt-6 md:pt-10 min-h-[calc(100vh-68px)]">
      <div className="max-w-4xl mx-auto">
        {/* ヘッダー部分 */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between p-3 md:p-4 bg-zinc-900/50 rounded-xl shadow border border-zinc-800 gap-4">
          <div className="flex items-center gap-3">
            <Link href={`/company/${id}/${type}`} className="text-zinc-400 hover:text-zinc-200 transition bg-zinc-800 px-3 py-1.5 md:px-4 md:py-2 border border-zinc-700 rounded-lg shadow-sm text-[10px] md:text-sm font-medium whitespace-nowrap">
              ← 戻る
            </Link>
            <h1 className="text-xl md:text-2xl font-bold text-zinc-100 truncate">
              {company.name} <span className="text-zinc-500 font-normal ml-1">/ ES編集モード</span>
            </h1>
          </div>
        </div>

        {/* 🌟 ここでブラウザ用の神コンポーネントを呼び出す！ */}
        <DiffEditorClient 
          sectionId={section.id} 
          initialQuestions={section.questions} 
          templates={templates} 
        />
      </div>
    </main>
  )
}