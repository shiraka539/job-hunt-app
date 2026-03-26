import { auth } from '@clerk/nextjs/server' // 🌟 これを追加
import { prisma } from '../../lib/prisma'
import Link from 'next/link'
import TemplateItem from '../../components/TemplateItem'

export default async function TemplatesPage() {
  const { userId } = await auth() // 🌟 ログインユーザーのIDを取得

  if (!userId) {
    return <div>ログインしてください</div>
  }

  // 🌟 自分のテンプレートだけを取得するように where を追加！
  const templates = await prisma.template.findMany({
    where: { userId: userId }, 
    orderBy: { createdAt: 'desc' }
  })

  return (
    <main className="p-4 md:p-8 pt-6 md:pt-10 min-h-[calc(100vh-68px)]">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 flex items-center gap-4">
          <Link href="/" className="w-10 h-10 flex items-center justify-center bg-zinc-800 rounded-full text-zinc-400 hover:text-zinc-200 transition">
            ←
          </Link>
          <h1 className="text-2xl md:text-3xl font-extrabold text-zinc-100 tracking-tight">
            テンプレート一覧
          </h1>
        </div>

        {/* 追加ページへのリンクボタン */}
        <Link 
          href="/templates/new" 
          className="inline-flex bg-indigo-600 text-white px-6 py-4 min-h-[52px] rounded-[24px] hover:bg-indigo-500 transition-all mb-8 shadow-md hover:shadow-lg active:scale-95 font-bold items-center border border-indigo-500"
        >
          <span className="text-xl mr-2">➕</span> 新しいテンプレートを登録
        </Link>

        {/* テンプレ一覧表示エリア */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-[32px] overflow-hidden shadow-sm">
          {templates.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center px-4">
              <span className="text-6xl mb-4 opacity-50">📂</span>
              <p className="text-zinc-400 font-medium">まだテンプレートが登録されいません。<br/>上のボタンから登録しましょう！</p>
            </div>
          ) : (
            <ul className="p-4 md:p-6 space-y-4 bg-black/20">
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