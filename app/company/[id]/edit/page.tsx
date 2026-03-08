import { redirect } from 'next/navigation'
import { prisma } from '../../../../lib/prisma'
import { updateCompany } from '../../../../app/actions'
import Link from 'next/link'

type Props = { params: Promise<{ id: string }> }

export default async function EditCompanyPage({ params }: Props) {
  const { id } = await params
  const company = await prisma.company.findUnique({ where: { id } })

  if (!company) return <div>企業が見つかりません</div>

  async function handleUpdate(formData: FormData) {
    'use server'
    const name = formData.get('name') as string
    const status = formData.get('status') as string
    const myPageUrl = formData.get('myPageUrl') as string

    await updateCompany(id, name, status, myPageUrl || null)
    redirect('/')
  }

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow border border-gray-100">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">企業情報を編集</h1>

        <form action={handleUpdate} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">企業名</label>
            <input type="text" name="name" required defaultValue={company.name} className="w-full border border-gray-300 rounded-md p-2 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">選考ステータス</label>
            <select name="status" defaultValue={company.status} className="w-full border border-gray-300 rounded-md p-2 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none">
              <option value="未エントリー">未エントリー</option>
              <option value="ES作成中">ES作成中</option>
              <option value="ES提出済">ES提出済</option>
              <option value="適性検査待ち">適性検査待ち</option>
              <option value="1次面接待ち">1次面接待ち</option>
              <option value="2次面接待ち">2次面接待ち</option>
              <option value="最終面接">最終面接</option>
              <option value="内定">内定</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">マイページURL (任意)</label>
            <input type="url" name="myPageUrl" defaultValue={company.myPageUrl || ''} className="w-full border border-gray-300 rounded-md p-2 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
          </div>

          <div className="flex gap-4 pt-4">
            <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition font-medium">更新する</button>
            <Link href="/" className="px-6 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition">キャンセル</Link>
          </div>
        </form>
      </div>
    </main>
  )
}