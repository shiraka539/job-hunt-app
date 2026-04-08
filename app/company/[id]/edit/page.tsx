import { redirect } from 'next/navigation'
import { prisma } from '../../../../lib/prisma'
import { updateCompany } from '../../../../app/actions'
import { auth } from '@clerk/nextjs/server'
import Link from 'next/link'
import { COMPANY_STATUS } from '../../../../constants/status'

type Props = { params: Promise<{ id: string }> }

export default async function EditCompanyPage({ params }: Props) {
  const { id } = await params
  const { userId } = await auth()
  if (!userId) return <div>ログインしてください</div>

  const company = await prisma.company.findUnique({ where: { id, userId } })
  if (!company) return <div>企業が見つかりません</div>

  // deadline を YYYY-MM-DD 文字列に変換（input[type=date] の value 形式）
  const deadlineValue = company.deadline
    ? new Date(company.deadline).toISOString().split('T')[0]
    : ''

  async function handleUpdate(formData: FormData) {
    'use server'
    const name = formData.get('name') as string
    const status = formData.get('status') as string
    const myPageUrl = formData.get('myPageUrl') as string
    const deadline = formData.get('deadline') as string
    const applicationId = formData.get('applicationId') as string

    await updateCompany(id, name, status, myPageUrl || null, deadline || null, applicationId || null)
    redirect('/')
  }

  return (
    <main className="p-4 md:p-8 pt-6 md:pt-10 min-h-[calc(100vh-68px)]">
      <div className="max-w-2xl mx-auto bg-zinc-900/50 p-8 md:p-10 rounded-[2rem] shadow-sm border border-zinc-800 transition-colors">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/" className="md:hidden w-10 h-10 flex items-center justify-center bg-zinc-800 rounded-full text-zinc-400 hover:text-zinc-200 transition">
            ←
          </Link>
          <h1 className="text-2xl md:text-3xl font-extrabold text-zinc-100 tracking-tight">
            企業情報を編集
          </h1>
        </div>

        <form action={handleUpdate} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-zinc-300 mb-2">企業名 <span className="text-rose-500">*</span></label>
            <input
              type="text"
              name="name"
              required
              defaultValue={company.name}
              className="w-full border border-zinc-700 bg-zinc-800/50 rounded-xl p-4 min-h-[52px] text-zinc-100 focus:ring-4 focus:ring-indigo-900/50 focus:border-indigo-500 outline-none transition-all placeholder:text-zinc-600"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-zinc-300 mb-2">選考ステータス</label>
            <select
              name="status"
              defaultValue={company.status}
              className="w-full border border-zinc-700 bg-zinc-800/50 rounded-xl p-4 min-h-[52px] text-zinc-100 focus:ring-4 focus:ring-indigo-900/50 focus:border-indigo-500 outline-none transition-all appearance-none cursor-pointer"
            >
              {Object.values(COMPANY_STATUS).map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-zinc-300 mb-2">
              締め切り日 <span className="text-zinc-500 font-normal text-xs">(任意)</span>
            </label>
            <input
              type="date"
              name="deadline"
              defaultValue={deadlineValue}
              className="w-full border border-zinc-700 bg-zinc-800/50 rounded-xl p-4 min-h-[52px] text-zinc-100 focus:ring-4 focus:ring-indigo-900/50 focus:border-indigo-500 outline-none transition-all [color-scheme:dark]"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-zinc-300 mb-2">マイページURL <span className="text-zinc-500 font-normal text-xs">(任意)</span></label>
            <input
              type="url"
              name="myPageUrl"
              defaultValue={company.myPageUrl || ''}
              className="w-full border border-zinc-700 bg-zinc-800/50 rounded-xl p-4 min-h-[52px] text-zinc-100 focus:ring-4 focus:ring-indigo-900/50 focus:border-indigo-500 outline-none transition-all placeholder:text-zinc-600"
              placeholder="https://..."
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-zinc-300 mb-2">企業発行ID/管理番号 <span className="text-zinc-500 font-normal text-xs">(任意)</span></label>
            <input
              type="text"
              name="applicationId"
              defaultValue={company.applicationId || ''}
              className="w-full border border-zinc-700 bg-zinc-800/50 rounded-xl p-4 min-h-[52px] text-zinc-100 focus:ring-4 focus:ring-indigo-900/50 focus:border-indigo-500 outline-none transition-all placeholder:text-zinc-600"
              placeholder="例：ID-12345"
            />
          </div>

          <div className="flex flex-col-reverse md:flex-row gap-4 pt-6 mt-4 border-t border-zinc-800/80">
            <Link href="/" className="px-6 py-4 min-h-[52px] text-center font-bold text-zinc-400 bg-zinc-800 hover:bg-zinc-700 rounded-xl transition-colors md:w-1/3">
              キャンセル
            </Link>
            <button
              type="submit"
              className="bg-indigo-600 text-white px-6 py-4 min-h-[52px] rounded-xl hover:bg-indigo-500 transition font-bold shadow-md hover:shadow-lg active:scale-95 md:w-2/3 border border-indigo-500"
            >
              更新して戻る
            </button>
          </div>
        </form>
      </div>
    </main>
  )
}