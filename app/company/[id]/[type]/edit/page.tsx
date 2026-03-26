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
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h1 className="text-2xl md:text-3xl font-extrabold text-zinc-100 flex items-center gap-3 tracking-tight">
            <span className="text-3xl">✍️</span> 
            {company.name} 
            <span className="text-zinc-500 text-lg md:text-xl font-medium tracking-normal ml-2">/ ES編集モード</span>
          </h1>
          <Link href={`/company/${id}/${type}`} className="inline-flex max-w-fit items-center text-zinc-300 hover:text-indigo-400 transition-all bg-zinc-900/50 px-5 py-3 border border-zinc-800 rounded-xl shadow-sm hover:shadow-md active:scale-95 text-sm font-bold">
            × 編集をやめて戻る
          </Link>
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