import { prisma } from '../../../../lib/prisma'
import { auth } from '@clerk/nextjs/server'
import TacticalBoardClient from './TacticalBoardClient'

type Props = {
  params: Promise<{ id: string }>
}

export default async function InterviewBoardPage({ params }: Props) {
  const { id } = await params
  const { userId } = await auth()

  if (!userId) return <div>ログインしてください</div>

  // 1. 企業情報＆紐づいているマスターエピソードを取得
  const company = await prisma.company.findFirst({
    where: { id: id, userId: userId },
    include: {
      tacticalEpisodes: {
        orderBy: { order: 'asc' },
        include: {
          masterEpisode: true
        }
      }
    }
  })

  if (!company) return <div>企業が見つからないか、アクセス権限がありません</div>

  // 2. ピッカー用に自分の全・マスターエピソードのリストを取得（軽い情報だけ）
  const allMasterEpisodes = await prisma.masterEpisode.findMany({
    where: { userId: userId },
    select: { id: true, title: true, category: true },
    orderBy: { updatedAt: 'desc' }
  })

  // 3. 質問アーカイブから、この企業に関係する質問、または頻出質問を取得
  const relevantQuestions = await prisma.interviewQuestion.findMany({
    where: {
      userId: userId,
      OR: [
        { companyName: company.name }, // 今回は社名の完全一致で抽出
        { isFrequent: true }
      ]
    },
    orderBy: [
      { isFrequent: 'desc' }, // 頻出を上に
      { createdAt: 'desc' }
    ]
  })

  return (
    <main className="min-h-screen bg-black w-full overflow-x-hidden text-zinc-100">
      <TacticalBoardClient
        company={company}
        tacticalEpisodes={company.tacticalEpisodes}
        allMasterEpisodes={allMasterEpisodes}
        questions={relevantQuestions}
      />
    </main>
  )
}
