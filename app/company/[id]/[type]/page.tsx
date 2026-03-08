import { prisma } from '../../../../lib/prisma'
import Link from 'next/link'
import EditorClient from '../../../../components/EditorClient'
import TestSelectionClient from '../../../../components/TestSelectionClient'

type Props = {
  params: Promise<{ id: string; type: string }>
}

export default async function CompanyTypePage({ params }: Props) {
  const { id, type } = await params

  const company = await prisma.company.findUnique({ where: { id: id } })
  if (!company) return <div>企業が見つかりません</div>

  let section = await prisma.section.findFirst({
    where: { companyId: id, type: type },
    include: { questions: true }
  })

  if (!section) {
    section = await prisma.section.create({
      data: { companyId: id, type: type },
      include: { questions: true }
    })
  }

  let testQuestion = null
  if (type === 'test') {
    testQuestion = section.questions.find(q => q.title === 'Webテスト形式')
    if (!testQuestion) {
      testQuestion = await prisma.question.create({
        data: { sectionId: section.id, title: 'Webテスト形式', content: '' }
      })
    }
  }

  // ★ 登録されているテンプレートをすべて取得
  const templates = await prisma.template.findMany({
    orderBy: { createdAt: 'desc' }
  })

  const typeNames: Record<string, string> = {
    test: '適性検査内容',
    es: 'ESの内容',
    interview: '面接対策'
  }
  const pageTitle = typeNames[type] || type

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex items-center gap-4">
          <Link href="/" className="text-gray-500 hover:text-gray-800 transition bg-white px-3 py-1.5 border border-gray-200 rounded shadow-sm text-sm">
            ← 戻る
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">
            {company.name} <span className="text-gray-400 font-normal ml-2">/ {pageTitle}</span>
          </h1>
        </div>

        {/* typeが'test'ならチェックボックス画面、それ以外ならいつものエディター画面にtemplatesも渡す */}
        {type === 'test' && testQuestion ? (
          <TestSelectionClient questionId={testQuestion.id} initialContent={testQuestion.content} />
        ) : (
          <EditorClient sectionId={section.id} initialQuestions={section.questions} templates={templates} />
        )}
      </div>
    </main>
  )
}