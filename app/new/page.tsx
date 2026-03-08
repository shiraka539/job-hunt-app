import { redirect } from 'next/navigation'
import { prisma } from '../../lib/prisma'
import { auth } from '@clerk/nextjs/server'

export default function NewCompanyPage() {
  // サーバーアクション：フォーム送信時に裏側で動く処理
  async function createCompany(formData: FormData) {
    'use server'

    // 🌟 2. ログインしているユーザーのIDを取得する！
    const { userId } = await auth()
    if (!userId) {
      throw new Error("ログインが必要です")
    }

    const name = formData.get('name') as string
    const status = formData.get('status') as string
    const myPageUrl = formData.get('myPageUrl') as string

    // 🌟 3. データベースに保存するデータに `userId` を追加！
    await prisma.company.create({
      data: {
        name,
        status,
        myPageUrl,
        userId, // ← ここが欠けていたのがエラーの原因だぜ！
      }
    })

    redirect('/')
  }

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow border border-gray-100">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">新しい企業を登録</h1>

        {/* フォームの action にさっき作った関数をセットするだけ */}
        <form action={createCompany} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">企業名</label>
            <input 
              type="text" 
              name="name" 
              required className="w-full border border-gray-300 rounded-md p-2 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
               
              placeholder="例：株式会社〇〇" 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">選考ステータス</label>
            <select name="status" className="w-full border border-gray-300 rounded-md p-2 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none">
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
            <label className="block text-sm font-medium text-gray-700 mb-1">マイページURL (任意)</label>
            <input 
              type="url" 
              name="myPageUrl" 
              className="w-full border border-gray-300 rounded-md p-2 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none" 
              placeholder="https://..." 
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition font-medium">
              登録する
            </button>
            <a href="/" className="px-6 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition">
              キャンセル
            </a>
          </div>
        </form>
      </div>
    </main>
  )
}