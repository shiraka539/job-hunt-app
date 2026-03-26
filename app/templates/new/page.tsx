import { redirect } from 'next/navigation'
import { prisma } from '../../../lib/prisma'
import Link from 'next/link'
import { auth } from '@clerk/nextjs/server'

export default function NewTemplatePage() {
  async function handleCreate(formData: FormData) {
    'use server'
    const { userId } = await auth()
    if (!userId) {
      throw new Error("ログインが必要です")
    }
    
    const name = formData.get('name') as string
    const defaultText = formData.get('defaultText') as string

    await prisma.template.create({
      data: { name, defaultText, userId },
    })
    redirect('/templates')
  }

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-2xl mx-auto bg-zinc-900/50 p-8 rounded-lg shadow-none border border-zinc-800">
        <h1 className="text-2xl font-bold text-zinc-100 mb-6">新しいテンプレートを登録</h1>

        <form action={handleCreate} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">タイトル</label>
            <input type="text" name="name" required placeholder="例：ガクチカ（アルバイト経験）" className="w-full border border-zinc-700 bg-zinc-800 rounded-md p-2 text-zinc-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none placeholder:text-zinc-600" />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">本文</label>
            <textarea name="defaultText" required placeholder="例：私は居酒屋のアルバイトで、新人教育のマニュアルを自主的に作成し..." className="w-full h-48 border border-zinc-700 bg-zinc-800 rounded-md p-2 text-zinc-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-y placeholder:text-zinc-600" />
          </div>

          <div className="flex gap-4 pt-4">
            <button type="submit" className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-500 transition font-medium border border-indigo-500">登録する</button>
            <Link href="/templates" className="px-6 py-2 text-zinc-400 border border-zinc-700 rounded-md hover:bg-zinc-800 transition">キャンセル</Link>
          </div>
        </form>
      </div>
    </main>
  )
}