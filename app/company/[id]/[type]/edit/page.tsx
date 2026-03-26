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
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
            ✍️ {company.name} <span className="text-gray-400 text-lg font-normal">/ ES編集モード</span>
          </h1>
          <Link href={`/company/${id}/${type}`} className="text-gray-500 hover:text-gray-800 transition bg-white px-4 py-2 border border-gray-200 rounded-md shadow-sm text-sm font-medium">
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