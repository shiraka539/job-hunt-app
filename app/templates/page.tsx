import { prisma } from '../../lib/prisma'
import Link from 'next/link'
import TemplateItem from '../../components/TemplateItem'

export default async function TemplatesPage() {
  const templates = await prisma.template.findMany({
    orderBy: { createdAt: 'desc' }
  })

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 flex items-center gap-4">
          <Link href="/" className="text-gray-500 hover:text-gray-800 transition bg-white px-3 py-1.5 border border-gray-200 rounded shadow-sm text-sm">
            ← ダッシュボードへ戻る
          </Link>
          <h1 className="text-3xl font-bold text-gray-800">
            テンプレート一覧
          </h1>
        </div>

        {/* 追加ページへのリンクボタン */}
        <Link 
          href="/templates/new" 
          className="inline-block bg-blue-600 text-white px-5 py-2.5 rounded-md hover:bg-blue-700 transition mb-6 shadow-sm font-medium"
        >
          + 新しいテンプレートを登録
        </Link>

        {/* テンプレ一覧表示エリア */}
        <div className="bg-white rounded-lg shadow border border-gray-100 p-6">
          {templates.length === 0 ? (
            <p className="text-gray-500 text-center py-8">まだテンプレートが登録されていません。</p>
          ) : (
            <ul>
              {templates.map((template) => (
                <TemplateItem key={template.id} template={template} />
              ))}
            </ul>
          )}
        </div>
      </div>
    </main>
  )
}