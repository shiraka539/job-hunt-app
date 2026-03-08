import { redirect } from 'next/navigation'
import { prisma } from '../../../../lib/prisma'
import { updateTemplate } from '../../../../app/actions'
import Link from 'next/link'

type Props = { params: Promise<{ id: string }> }

export default async function EditTemplatePage({ params }: Props) {
  const { id } = await params
  const template = await prisma.template.findUnique({ where: { id } })

  if (!template) return <div>テンプレートが見つかりません</div>

  async function handleUpdate(formData: FormData) {
    'use server'
    const name = formData.get('name') as string
    const defaultText = formData.get('defaultText') as string

    await updateTemplate(id, name, defaultText)
    redirect('/templates')
  }

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow border border-gray-100">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">テンプレートを編集</h1>

        <form action={handleUpdate} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">タイトル</label>
            <input type="text" name="name" required defaultValue={template.name} className="w-full border border-gray-300 rounded-md p-2 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">本文</label>
            <textarea name="defaultText" required defaultValue={template.defaultText} className="w-full h-48 border border-gray-300 rounded-md p-2 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none resize-y" />
          </div>

          <div className="flex gap-4 pt-4">
            <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition font-medium">更新する</button>
            <Link href="/templates" className="px-6 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition">キャンセル</Link>
          </div>
        </form>
      </div>
    </main>
  )
}