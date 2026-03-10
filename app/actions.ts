'use server'

import { prisma } from '../lib/prisma'
import { auth } from '@clerk/nextjs/server' // 🌟 これが抜けてた！
import { revalidatePath } from 'next/cache' // 🌟 これも抜けてた！

// 🌟 共通：ログイン中のIDを取得
async function getValidatedUserId() {
  const { userId } = await auth()
  if (!userId) throw new Error("ログインが必要です")
  return userId
}

// ---------------- 企業関連 ----------------

export async function addCompany(name: string) {
  const userId = await getValidatedUserId()
  await prisma.company.create({
    data: { name, userId, status: "未エントリー" }
  })
  revalidatePath('/')
}

export async function updateCompany(companyId: string, name: string, status: string, myPageUrl: string | null) {
  const userId = await getValidatedUserId()
  await prisma.company.update({
    where: { id: companyId, userId }, // 🌟 自分のデータだけ更新可能に！
    data: { name, status, myPageUrl }
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