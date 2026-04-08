export type Urgency = 'overdue' | 'urgent' | 'soon' | 'normal' | null;

export function getDeadlineInfo(deadlineStr: string | null): { label: string; urgency: Urgency } {
  if (!deadlineStr) return { label: '', urgency: null };
  
  const deadline = new Date(deadlineStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  deadline.setHours(0, 0, 0, 0);
  
  const diffMs = deadline.getTime() - today.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  const dateLabel = deadline.toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' });

  if (diffDays < 0) return { label: `${dateLabel}（期限切れ）`, urgency: 'overdue' };
  if (diffDays === 0) return { label: `${dateLabel}（今日！）`, urgency: 'urgent' };
  if (diffDays <= 3) return { label: `${dateLabel}（あと${diffDays}日）`, urgency: 'urgent' };
  if (diffDays <= 7) return { label: `${dateLabel}（あと${diffDays}日）`, urgency: 'soon' };
  
  return { label: `${dateLabel}（あと${diffDays}日）`, urgency: 'normal' };
}
