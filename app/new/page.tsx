import { redirect } from 'next/navigation'
import { prisma } from '../../lib/prisma'
import { auth } from '@clerk/nextjs/server'

export default function NewCompanyPage() {
  async function createCompany(formData: FormData) {
    'use server'

    const { userId } = await auth()
    if (!userId) throw new Error("ログインが必要です")

    const name = formData.get('name') as string
    const status = formData.get('status') as string
    const myPageUrl = formData.get('myPageUrl') as string
    const deadline = formData.get('deadline') as string

    await prisma.company.create({
      data: {
        name,
        status,
        myPageUrl: myPageUrl || null,
        deadline: deadline ? new Date(deadline) : null,
        userId,
      }
    })

    redirect('/')
  }

  return (
    <main className="p-4 md:p-8 pt-6 md:pt-10 min-h-[calc(100vh-68px)]">
      <div className="max-w-2xl mx-auto bg-zinc-900/50 p-8 md:p-10 rounded-[2rem] shadow-sm border border-zinc-800 transition-colors">
        <div className="flex items-center gap-4 mb-8">
          <a href="/" className="md:hidden w-10 h-10 flex items-center justify-center bg-zinc-800 rounded-full text-zinc-400 hover:text-zinc-200 transition">
            ←
          </a>
          <h1 className="text-2xl md:text-3xl font-extrabold text-zinc-100 tracking-tight">
            新しい企業を登録
          </h1>
        </div>

        <form action={createCompany} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-zinc-300 mb-2">企業名 <span className="text-rose-500">*</span></label>
            <input
              type="text"
              name="name"
              required
              className="w-full border border-zinc-700 bg-zinc-800/50 rounded-xl p-4 min-h-[52px] text-zinc-100 focus:ring-4 focus:ring-indigo-900/50 focus:border-indigo-500 outline-none transition-all placeholder:text-zinc-600"
              placeholder="例：株式会社〇〇"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-zinc-300 mb-2">選考ステータス</label>
            <select name="status" className="w-full border border-zinc-700 bg-zinc-800/50 rounded-xl p-4 min-h-[52px] text-zinc-100 focus:ring-4 focus:ring-indigo-900/50 focus:border-indigo-500 outline-none transition-all appearance-none cursor-pointer">
              <option value="未エントリー">未エントリー</option>
              <option value="ES作成中">ES作成中</option>
              <option value="ES提出済">ES提出済</option>
              <option value="適性検査待ち">適性検査待ち</option>
              <option value="1次面接待ち">1次面接待ち</option>
              <option value="最終面接">最終面接</option>
              <option value="内定">内定</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-zinc-300 mb-2">
              締め切り日 <span className="text-zinc-500 font-normal text-xs">(任意)</span>
            </label>
            <input
              type="date"
              name="deadline"
              className="w-full border border-zinc-700 bg-zinc-800/50 rounded-xl p-4 min-h-[52px] text-zinc-100 focus:ring-4 focus:ring-indigo-900/50 focus:border-indigo-500 outline-none transition-all [color-scheme:dark]"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-zinc-300 mb-2">マイページURL <span className="text-zinc-500 font-normal text-xs">(任意)</span></label>
            <input
              type="url"
              name="myPageUrl"
              className="w-full border border-zinc-700 bg-zinc-800/50 rounded-xl p-4 min-h-[52px] text-zinc-100 focus:ring-4 focus:ring-indigo-900/50 focus:border-indigo-500 outline-none transition-all placeholder:text-zinc-600"
              placeholder="https://..."
            />
          </div>

          <div className="flex flex-col-reverse md:flex-row gap-4 pt-6 mt-4 border-t border-zinc-800/80">
            <a href="/" className="px-6 py-4 min-h-[52px] text-center font-bold text-zinc-400 bg-zinc-800 hover:bg-zinc-700 rounded-xl transition-colors md:w-1/3">
              キャンセル
            </a>
            <button type="submit" className="bg-indigo-600 text-white px-6 py-4 min-h-[52px] rounded-xl hover:bg-indigo-500 transition font-bold shadow-md hover:shadow-lg active:scale-95 md:w-2/3 border border-indigo-500">
              登録してダッシュボードへ
            </button>
          </div>
        </form>
      </div>
    </main>
  )
}