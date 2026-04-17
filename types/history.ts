import { Period } from '@/constants/period';

export interface LifeHistoryItem {
  id: string;
  userId: string;
  period: Period;
  title: string;
  content: string;
  insight: string | null;
  createdAt: Date;
  updatedAt: Date;
}
