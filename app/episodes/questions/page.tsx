import { auth } from '@clerk/nextjs/server'
import { prisma } from '../../../lib/prisma'
import Link from 'next/link'
import InterviewQuestionListClient from '../../../components/InterviewQuestionListClient'
import NewInterviewQuestionForm from '../../../components/NewInterviewQuestionForm'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '質問アーカイブ | JobHunt',
  description: '面接で聞かれた質問とその時の手応えを記録',
}

export default async function InterviewQuestionsPage() {
  const { userId } = await auth()
  if (!userId) return <div className="p-8 text-zinc-400">ログインしてください</div>

  const [questions, episodes] = await Promise.all([
    prisma.interviewQuestion.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        masterEpisode: {
          select: { id: true, title: true }
        }
      }
    }),
    prisma.masterEpisode.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      select: { id: true, title: true }
    })
  ])

  return (
    <main className="min-h-screen p-4 md:p-8 pt-6 md:pt-10 max-w-4xl mx-auto">
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
            <span className="text-orange-500">💬</span> 質問アーカイブ
          </h1>
          <p className="text-zinc-500 mt-2 text-sm md:text-base">
            面接で聞かれた質問を記録し、今後の対策に活かしましょう。
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Link href="/episodes" className="text-sm font-bold bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white px-4 py-2.5 rounded-xl transition-colors">
            &larr; マスターバンクへ戻る
          </Link>
        </div>
      </div>

      <div className="mb-12">
        <NewInterviewQuestionForm episodes={episodes} />
      </div>

      <div>
        <h2 className="text-xl font-extrabold text-white mb-6 border-b border-zinc-800 pb-4">
          過去の質問一覧 ({questions.length}件)
        </h2>
        <InterviewQuestionListClient initialQuestions={questions} />
      </div>
    </main>
  )
}
