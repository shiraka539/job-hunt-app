'use server'

import { prisma } from '../lib/prisma'

// 新しい設問を追加する
export async function addQuestion(sectionId: string, title: string, maxLength: number | null) {
  await prisma.question.create({
    data: { sectionId, title, maxLength }
  })
}

// 回答のテキストを保存する
export async function updateAnswer(questionId: string, content: string) {
  await prisma.question.update({
    where: { id: questionId },
    data: { content }
  })
}

// 設問を削除する
export async function deleteQuestion(questionId: string) {
  await prisma.question.delete({
    where: { id: questionId }
  })
}

// 企業情報を更新する
export async function updateCompany(companyId: string, name: string, status: string, myPageUrl: string | null) {
  await prisma.company.update({
    where: { id: companyId },
    data: { name, status, myPageUrl }
  })
}

// 企業を削除する（紐づくESや設問も一緒に消えるよ）
export async function deleteCompany(companyId: string) {
  await prisma.company.delete({
    where: { id: companyId }
  })
}

export async function addTemplate(name: string, defaultText: string) {
  await prisma.template.create({
    data: { name, defaultText }
  })
}

export async function deleteTemplate(templateId: string) {
  await prisma.template.delete({
    where: { id: templateId }
  })
}

// テンプレートを更新する
export async function updateTemplate(templateId: string, name: string, defaultText: string) {
  await prisma.template.update({
    where: { id: templateId },
    data: { name, defaultText }
  })
}