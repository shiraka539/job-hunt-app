import { auth } from '@clerk/nextjs/server'
import { prisma } from '../lib/prisma'
import Link from 'next/link'
import CompanyItem from '../components/CompanyItem'

export default async function Home() {
  // 🌟 今ログインしている人のIDを取得
  const { userId } = await auth()
  
  // もしログインしてなかったら（念のため）
  if (!userId) return <div>ログインしてください</div>

  // 🌟 自分のデータだけを取得するように where を追加！
  const companies = await prisma.company.findMany({
    where: { userId: userId }, 
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