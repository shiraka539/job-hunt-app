import { prisma } from '../lib/prisma'
import Link from 'next/link'
import CompanyItem from '../components/CompanyItem'

export default async function Home() {
  // 作成日順（新しい順）で企業を取得するように少し改良したよ
  const companies = await prisma.company.findMany({
    orderBy: { createdAt: 'desc' }
  })

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">就活ダッシュボード</h1>

<div className="flex gap-4 mb-6">
          <Link 
            href="/new" 
            className="bg-blue-600 text-white px-5 py-2.5 rounded-md hover:bg-blue-700 transition shadow-sm font-medium flex items-center"
          >
            + 新しい企業を登録
          </Link>
          <Link 
            href="/templates" 
            className="bg-white text-gray-700 border border-gray-300 px-5 py-2.5 rounded-md hover:bg-gray-50 transition shadow-sm font-medium flex items-center gap-2"
          >
            💡 テンプレート一覧
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow border border-gray-100 p-6">
          {companies.length === 0 ? (
            <p className="text-gray-500 text-center py-8">まだ登録されている企業がありません。</p>
          ) : (
            <ul>
              {/* mapの中身を CompanyItem に置き換え！ */}
              {companies.map((company) => (
                <CompanyItem key={company.id} company={company} />
              ))}
            </ul>
          )}
        </div>
      </div>
    </main>
  )
}