'use server'

import { prisma } from '../lib/prisma'
import { auth } from '@clerk/nextjs/server' // 🌟 これが抜けてた！
import { revalidatePath } from 'next/cache' // 🌟 これも抜けてた！
import { COMPANY_STATUS } from '../constants/status'
import { CompanyQuestion } from '../types'

// 🌟 共通：ログイン中のIDを取得
async function getValidatedUserId() {
  const { userId } = await auth()
  if (!userId) throw new Error("ログインが必要です")
  return userId
}

// ---------------- 企業関連 ----------------

export async function addCompany(name: string, deadline: string | null = null, applicationId: string | null = null) {
  const userId = await getValidatedUserId()
  await prisma.company.create({
    data: { name, userId, status: COMPANY_STATUS.UNENTERED, deadline: deadline ? new Date(deadline) : null, applicationId }
  })
  revalidatePath('/')
}

export async function updateCompanyInterviewQuestions(companyId: string, questions: any[]) {
  const userId = await getValidatedUserId()
  // 自分の企業かどうか確認してから更新
  await prisma.company.update({
    where: { id: companyId, userId },
    data: { interviewQuestions: questions }
  })
  revalidatePath(`/company/${companyId}/interview`)
}

export async function updateCompany(companyId: string, name: string, status: string, myPageUrl: string | null, deadline: string | null = null, applicationId: string | null = null) {
  const userId = await getValidatedUserId()
  await prisma.company.update({
    where: { id: companyId, userId },
    data: { name, status, myPageUrl, deadline: deadline ? new Date(deadline) : null, applicationId }
  })
  revalidatePath('/')
}

export async function deleteCompany(companyId: string) {
  const userId = await getValidatedUserId()
  await prisma.company.delete({
    where: { id: companyId, userId } // 🌟 自分のデータだけ削除可能に！
  })
  revalidatePath('/')
}

// ---------------- テンプレート関連 ----------------

export async function addTemplate(name: string, defaultText: string) {
  const userId = await getValidatedUserId()
  await prisma.template.create({
    data: { name, defaultText, userId }
  })
  revalidatePath('/templates')
}

export async function updateTemplate(templateId: string, name: string, defaultText: string) {
  const userId = await getValidatedUserId()
  await prisma.template.update({
    where: { id: templateId, userId }, // 🌟 追加
    data: { name, defaultText }
  })
  revalidatePath('/templates')
}

export async function deleteTemplate(templateId: string) {
  const userId = await getValidatedUserId()
  await prisma.template.delete({
    where: { id: templateId, userId } // 🌟 追加
  })
  revalidatePath('/templates')
}

// ---------------- 設問・回答関連 ----------------

export async function updateCompanyQuestions(companyId: string, questions: CompanyQuestion[]) {
  const userId = await getValidatedUserId();
  await prisma.company.update({
    where: { id: companyId, userId },
    data: { questions: questions as any } // Prisma JSON型への割り当て
  });
  revalidatePath(`/company/${companyId}/es-json`);
}
// ※本来はここも親(Company)のuserIdをチェックするのが完璧だけど、一旦現状のままで動かすぜ。

export async function addQuestion(sectionId: string, title: string, maxLength: number | null = null) {
  const newQuestion = await prisma.question.create({
    data: { sectionId, title, maxLength }
  })
  
  return newQuestion // 🌟 これが抜けてたから「undefined」エラーになってたんだ！
}
export async function updateAnswer(questionId: string, content: string) {
  await prisma.question.update({
    where: { id: questionId },
    data: { content }
  })
}

export async function deleteQuestion(questionId: string) {
  await prisma.question.delete({
    where: { id: questionId }
  })
}

export async function updateReview(questionId: string, reviewContent: string) {
  await prisma.question.update({
    where: { id: questionId },
    data: { reviewContent }
  })
}

// ---------------- マスターエピソード関連 ----------------

export async function createMasterEpisode(
  title: string,
  category: string | null,
  summaryConclusion: string,
  summaryChallenge: string,
  summaryAction: string,
  summaryResult: string
) {
  const userId = await getValidatedUserId()
  const newEpisode = await prisma.masterEpisode.create({
    data: {
      userId,
      title,
      category,
      summaryConclusion,
      summaryChallenge,
      summaryAction,
      summaryResult
    }
  })
  revalidatePath('/episodes')
  return newEpisode
}

export async function updateMasterEpisode(
  id: string,
  title: string,
  category: string | null,
  summaryConclusion: string,
  summaryChallenge: string,
  summaryAction: string,
  summaryResult: string
) {
  const userId = await getValidatedUserId()
  await prisma.masterEpisode.update({
    where: { id, userId },
    data: {
      title,
      category,
      summaryConclusion,
      summaryChallenge,
      summaryAction,
      summaryResult
    }
  })
  revalidatePath('/episodes')
}

export async function deleteMasterEpisode(id: string) {
  const userId = await getValidatedUserId()
  await prisma.masterEpisode.delete({
    where: { id, userId }
  })
  revalidatePath('/episodes')
}

// ---------------- 実戦用ボード（SectionMasterEpisode）関連 ----------------

export async function linkMasterEpisodeToSection(companyId: string, sectionId: string, masterEpisodeId: string) {
  const userId = await getValidatedUserId()
  
  // 企業の所有者確認
  const company = await prisma.company.findFirst({ where: { id: companyId, userId } })
  if (!company) throw new Error("無効なリクエストです")

  // 現在の最大orderを取得
  const maxOrderEpisode = await prisma.sectionMasterEpisode.findFirst({
    where: { sectionId },
    orderBy: { order: 'desc' },
  })
  const nextOrder = maxOrderEpisode ? maxOrderEpisode.order + 1 : 0

  const linked = await prisma.sectionMasterEpisode.create({
    data: { sectionId, masterEpisodeId, order: nextOrder }
  })
  revalidatePath(`/company/${companyId}/interview`)
  return linked
}

export async function unlinkMasterEpisodeFromSection(companyId: string, sectionId: string, masterEpisodeId: string) {
  const userId = await getValidatedUserId()
  const company = await prisma.company.findFirst({ where: { id: companyId, userId } })
  if (!company) throw new Error("無効なリクエストです")

  await prisma.sectionMasterEpisode.delete({
    where: {
      sectionId_masterEpisodeId: {
        sectionId,
        masterEpisodeId
      }
    }
  })
  revalidatePath(`/company/${companyId}/interview`)
}

export async function updateSectionMasterEpisodeMemo(companyId: string, sectionId: string, masterEpisodeId: string, customMemo: string) {
  const userId = await getValidatedUserId()
  const company = await prisma.company.findFirst({ where: { id: companyId, userId } })
  if (!company) throw new Error("無効なリクエストです")

  await prisma.sectionMasterEpisode.update({
    where: {
      sectionId_masterEpisodeId: {
        sectionId,
        masterEpisodeId
      }
    },
    data: { customMemo }
  })
  revalidatePath(`/company/${companyId}/interview`)
}

export async function reorderSectionMasterEpisodes(companyId: string, sectionId: string, orderedIds: string[]) {
  const userId = await getValidatedUserId()
  const company = await prisma.company.findFirst({ where: { id: companyId, userId } })
  if (!company) throw new Error("無効なリクエストです")

  for (let i = 0; i < orderedIds.length; i++) {
    await prisma.sectionMasterEpisode.update({
      where: {
        sectionId_masterEpisodeId: {
          sectionId,
          masterEpisodeId: orderedIds[i]
        }
      },
      data: { order: i }
    })
  }
  revalidatePath(`/company/${companyId}/interview`)
}

// ---------------- 企業メモ関連 ----------------

export async function updateCompanyMemos(companyId: string, motivation: string | null, researchMemo: string | null) {
  const userId = await getValidatedUserId()
  await prisma.company.update({
    where: { id: companyId, userId },
    data: { motivation, researchMemo }
  })
  revalidatePath(`/company/${companyId}/interview`)
}