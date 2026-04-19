'use server'

import { auth } from '@clerk/nextjs/server'
import { prisma } from '../../lib/prisma'
import { revalidatePath } from 'next/cache'

export async function createInterviewQuestion(data: {
  content: string
  companyName?: string
  masterEpisodeId?: string
  answerMemo?: string
  isFrequent?: boolean
}) {
  const { userId } = await auth()
  if (!userId) throw new Error('Unauthorized')

  const question = await prisma.interviewQuestion.create({
    data: {
      userId,
      content: data.content,
      companyName: data.companyName,
      masterEpisodeId: data.masterEpisodeId || null,
      answerMemo: data.answerMemo,
      isFrequent: data.isFrequent || false,
    }
  })

  revalidatePath('/episodes/questions')
  revalidatePath('/episodes')
  return question
}

export async function updateInterviewQuestion(id: string, data: {
  content?: string
  companyName?: string
  masterEpisodeId?: string | null
  answerMemo?: string
  isFrequent?: boolean
}) {
  const { userId } = await auth()
  if (!userId) throw new Error('Unauthorized')

  const question = await prisma.interviewQuestion.updateMany({
    where: { id, userId },
    data
  })

  revalidatePath('/episodes/questions')
  revalidatePath('/episodes')
  return question
}

export async function deleteInterviewQuestion(id: string) {
  const { userId } = await auth()
  if (!userId) throw new Error('Unauthorized')

  await prisma.interviewQuestion.deleteMany({
    where: { id, userId }
  })

  revalidatePath('/episodes/questions')
  revalidatePath('/episodes')
}
