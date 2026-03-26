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

  // 1 & 2. 自分の会社のデータとセクション（設問含む）を同時に並列取得！これで直列の「通信待ち」がなくなります。
  const [company, section] = await Promise.all([
    prisma.company.findFirst({
      where: { id: id, userId: userId }
    }),
    prisma.section.findFirst({
      where: { companyId: id, type: type },
      include: { 
        questions: { orderBy: { createdAt: 'asc' } } // 作成順に並べる
      }
    })
  ])

  if (!company) return <div>企業が見つからないか、アクセス権限がありません</div>

  const typeNames: Record<string, string> = {
    test: '適性検査',
    es: 'エントリーシート',
    interview: '面接対策'
  }
  const pageTitle = typeNames[type] || type

  return (
    <main className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        
        {/* =========================================
            ヘッダー部分
           ========================================= */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between p-3 md:p-4 bg-zinc-900/50 rounded-xl shadow border border-zinc-800 gap-4">
          
          <div className="flex items-center gap-3">
            <Link href="/" className="text-zinc-400 hover:text-zinc-200 transition bg-zinc-800 px-3 py-1.5 md:px-4 md:py-2 border border-zinc-700 rounded-lg shadow-sm text-[10px] md:text-sm font-medium whitespace-nowrap">
              ← 戻る
            </Link>
            <h1 className="text-xl md:text-2xl font-bold text-zinc-100 truncate">
              {company.name} <span className="text-zinc-500 font-normal ml-1">/ {pageTitle}</span>
            </h1>
          </div>

{/* 🌟 絶対に色が消えない＆潰れないアクションボタンリンク */}
          <div className="flex gap-2 md:gap-4 overflow-x-auto pb-1 md:pb-0 scrollbar-hide">
            <Link 
              href={`/company/${id}/${type}/edit`} 
              className="px-4 py-2 md:px-6 md:py-3 rounded-lg hover:opacity-90 transition-all shadow-md text-sm md:text-base font-bold flex items-center gap-1.5 md:gap-2 whitespace-nowrap flex-shrink-0 bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 hover:bg-indigo-600/40"
            >
              ✍️ 編集モードへ
            </Link>
            <Link 
              href={`/company/${id}/${type}/review`} 
              className="px-4 py-2 md:px-6 md:py-3 rounded-lg hover:opacity-90 transition-all shadow-md text-sm md:text-base font-bold flex items-center gap-1.5 md:gap-2 whitespace-nowrap flex-shrink-0 bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-600/40"
            >
              👩‍🏫 添削モードへ
            </Link>
          </div>
          
        </div>


        {/* =========================================
            閲覧エリア
           ========================================= */}
        <div className="bg-zinc-900 rounded-[2rem] shadow-none border border-zinc-800 p-4 md:p-8 mb-24 md:mb-0">
          {!section || section.questions.length === 0 ? (
            <div className="text-center py-20 text-zinc-400 bg-zinc-800/50 rounded-2xl border border-zinc-800">
              <p className="mb-5 text-lg md:text-xl">まだESの内容が登録されていません。</p>
              <p className="text-base md:text-lg">右上の「✍️ 編集モードへ」から、設問を登録して書き始めましょう！</p>
            </div>
          ) : (
            <div className="space-y-12">
              {section.questions.map((q, index) => (
                <div key={q.id} className="border-b-2 border-zinc-800 pb-10 last:border-0 last:pb-0">
                  <div className="flex justify-between items-center mb-5 bg-zinc-800/50 p-4 rounded-lg border border-zinc-800">
                    <h2 className="text-2xl font-bold text-zinc-100 flex items-center gap-3">
                      <span className="bg-indigo-900/50 text-indigo-400 px-3 py-1.5 rounded-md text-base font-bold">Q{index + 1}</span>
                      {q.title}
                    </h2>
                    {q.maxLength && (
                      <span className="text-base bg-zinc-800 border border-zinc-700 text-zinc-300 px-3 py-1 rounded-md font-bold">上限 {q.maxLength}文字</span>
                    )}
                  </div>
                  
                  {/* Your Answer */}
                  <div className="mb-8">
                    <h3 className="text-xs md:text-sm font-bold text-zinc-500 uppercase tracking-wider mb-2 md:mb-3">Your Answer</h3>
                    {q.content ? (
                      <div className="bg-black/50 border border-zinc-800 rounded-2xl p-5 md:p-8 shadow-inner">
                        <p className="text-zinc-200 text-base md:text-lg whitespace-pre-wrap leading-loose tracking-wide">{q.content}</p>
                        <div className="mt-4 text-right text-xs md:text-sm text-zinc-500 font-bold">
                          計 {q.content.length} 文字
                        </div>
                      </div>
                    ) : (
                      <p className="text-lg text-zinc-500 italic bg-black/40 p-6 rounded-lg border border-zinc-800">未記入</p>
                    )}
                  </div>

                  {/* 💡 添削・フィードバック */}
                  {q.reviewContent && (
                    <div className="bg-emerald-900/20 border border-emerald-800 rounded-lg p-6 shadow-md">
                      <h3 className="text-lg font-bold text-emerald-400 mb-3 flex items-center gap-2">
                        💡 添削・フィードバック
                      </h3>
                      <p className="text-emerald-300 whitespace-pre-wrap leading-relaxed text-base font-medium">
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