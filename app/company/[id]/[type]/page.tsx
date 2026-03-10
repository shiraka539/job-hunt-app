import { prisma } from '../../../../lib/prisma'
import Link from 'next/link'
import { auth } from '@clerk/nextjs/server'

type Props = {
  params: Promise<{ id: string; type: string }>
}

export default async function CompanyTypeViewPage({ params }: Props) {
  const { id, type } = await params
  const { userId } = await auth()

  if (!userId) return <div>ログインしてください</div>

  // 1. 自分のデータか確認
  const company = await prisma.company.findFirst({
    where: { id: id, userId: userId }
  })
  if (!company) return <div>企業が見つからないか、アクセス権限がありません</div>

  // 2. セクションと設問（Question）を取得
  const section = await prisma.section.findFirst({
    where: { companyId: id, type: type },
    include: { 
      questions: { orderBy: { createdAt: 'asc' } } // 作成順に並べる
    }
  })

  const typeNames: Record<string, string> = {
    test: '適性検査',
    es: 'エントリーシート',
    interview: '面接対策'
  }
  const pageTitle = typeNames[type] || type

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        
        {/* =========================================
            ヘッダー部分
           ========================================= */}
        <div className="mb-8 flex items-center justify-between p-4 bg-white rounded-xl shadow border border-gray-100">
          
          <div className="flex items-center gap-4">
            <Link href="/" className="text-gray-600 hover:text-gray-900 transition bg-gray-100 px-4 py-2 border border-gray-200 rounded-lg shadow-sm text-sm font-medium">
              ← 就活ダッシュボードへ戻る
            </Link>
            <h1 className="text-2xl font-bold text-gray-800">
              {company.name} <span className="text-gray-400 font-normal ml-2">/ {pageTitle}</span>
            </h1>
          </div>

{/* 🌟 絶対に色が消えない＆潰れないアクションボタンリンク */}
          <div className="flex gap-4">
            <Link 
              href={`/company/${id}/${type}/edit`} 
              // 🌟 whitespace-nowrap と flex-shrink-0 を追加して潰れ防止！
              className="px-6 py-3 rounded-lg hover:opacity-90 transition-all shadow-md text-base font-bold flex items-center gap-2 whitespace-nowrap flex-shrink-0"
              style={{ backgroundColor: '#2563eb', color: '#ffffff' }} // 強制ブルー！
            >
              ✍️ 編集モードへ
            </Link>
            <Link 
              href={`/company/${id}/${type}/review`} 
              className="px-6 py-3 rounded-lg hover:opacity-90 transition-all shadow-md text-base font-bold flex items-center gap-2 whitespace-nowrap flex-shrink-0"
              style={{ backgroundColor: '#059669', color: '#ffffff' }} // 強制エメラルドグリーン！
            >
              👩‍🏫 添削モードへ
            </Link>
          </div>
          
        </div>


        {/* =========================================
            閲覧エリア
           ========================================= */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-100 p-8">
          {!section || section.questions.length === 0 ? (
            <div className="text-center py-20 text-gray-500 bg-gray-50 rounded-lg border border-gray-100">
              <p className="mb-5 text-xl">まだESの内容が登録されていません。</p>
              <p className="text-lg">右上の「✍️ 編集モードへ」から、設問を登録して書き始めましょう！</p>
            </div>
          ) : (
            <div className="space-y-12">
              {section.questions.map((q, index) => (
                <div key={q.id} className="border-b-2 border-gray-100 pb-10 last:border-0 last:pb-0">
                  <div className="flex justify-between items-center mb-5 bg-gray-50 p-4 rounded-lg border border-gray-100">
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                      <span className="bg-blue-50 text-blue-600 px-3 py-1.5 rounded-md text-base font-bold">Q{index + 1}</span>
                      {q.title}
                    </h2>
                    {q.maxLength && (
                      <span className="text-base bg-gray-200 text-gray-800 px-3 py-1 rounded-md font-bold">上限 {q.maxLength}文字</span>
                    )}
                  </div>
                  
                  {/* Your Answer */}
                  <div className="mb-8">
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Your Answer</h3>
                    {q.content ? (
                      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-inner">
                        <p className="text-gray-800 text-lg whitespace-pre-wrap leading-relaxed">{q.content}</p>
                        <div className="mt-3 text-right text-sm text-gray-400 font-bold">
                          計 {q.content.length} 文字
                        </div>
                      </div>
                    ) : (
                      <p className="text-lg text-gray-400 italic bg-gray-50 p-6 rounded-lg border border-gray-100">未記入</p>
                    )}
                  </div>

                  {/* 💡 添削・フィードバック */}
                  {q.reviewContent && (
                    <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-6 shadow-md">
                      <h3 className="text-lg font-bold text-emerald-800 mb-3 flex items-center gap-2">
                        💡 添削・フィードバック
                      </h3>
                      <p className="text-emerald-900 whitespace-pre-wrap leading-relaxed text-base font-medium">
                        {q.reviewContent}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </main>
  )
}