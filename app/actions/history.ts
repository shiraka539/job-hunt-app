'use server';

import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { Period } from '@prisma/client';
import { revalidatePath } from 'next/cache';

export async function getLifeHistories() {
  const { userId } = await auth();
  if (!userId) {
    throw new Error('Unauthorized');
  }

  const histories = await prisma.lifeHistory.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' }, // とりあえず作成順。UI側でperiodごとにグルーピングする
  });

  return histories;
}

export async function upsertLifeHistory(data: {
  id?: string;
  period: Period;
  title: string;
  content: string;
  insight: string | null;
}) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error('Unauthorized');
  }

  const { id, period, title, content, insight } = data;

  if (id) {
    // 自身のデータか確認
    const existing = await prisma.lifeHistory.findUnique({ where: { id } });
    if (!existing || existing.userId !== userId) {
      throw new Error('History not found or unauthorized');
    }

    await prisma.lifeHistory.update({
      where: { id },
      data: { period, title, content, insight },
    });
  } else {
    await prisma.lifeHistory.create({
      data: { userId, period, title, content, insight },
    });
  }

  revalidatePath('/history');
}

export async function deleteLifeHistory(id: string) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error('Unauthorized');
  }

  const existing = await prisma.lifeHistory.findUnique({ where: { id } });
  if (!existing || existing.userId !== userId) {
    throw new Error('History not found or unauthorized');
  }

  await prisma.lifeHistory.delete({
    where: { id },
  });

  revalidatePath('/history');
}
