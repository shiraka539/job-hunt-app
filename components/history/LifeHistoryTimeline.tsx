'use client';

import { useState, useTransition } from 'react';
import { Period, PERIOD_LABEL, PERIOD_ORDER } from '@/constants/period';
import { upsertLifeHistory, deleteLifeHistory } from '@/app/actions/history';
import { LifeHistoryItem } from '@/types/history';

export default function LifeHistoryTimeline({
  histories,
}: {
  histories: LifeHistoryItem[];
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // 時代ごとにグルーピング
  const groupedHistories = PERIOD_ORDER.reduce((acc, period) => {
    acc[period] = histories.filter((h) => h.period === period);
    return acc;
  }, {} as Record<Period, LifeHistoryItem[]>);

  const [formData, setFormData] = useState({
    period: PERIOD_ORDER[0] as Period,
    title: '',
    content: '',
    insight: '',
  });

  const resetForm = () => {
    setFormData({
      period: PERIOD_ORDER[0],
      title: '',
      content: '',
      insight: '',
    });
    setEditingId(null);
  };

  const startEdit = (history: LifeHistoryItem) => {
    setFormData({
      period: history.period,
      title: history.title,
      content: history.content,
      insight: history.insight || '',
    });
    setEditingId(history.id);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      await upsertLifeHistory({
        id: editingId || undefined,
        period: formData.period,
        title: formData.title,
        content: formData.content,
        insight: formData.insight || null,
      });
      resetForm();
    });
  };

  const handleDelete = (id: string) => {
    if (!window.confirm('本当に削除しますか？')) return;
    startTransition(async () => {
      await deleteLifeHistory(id);
      if (editingId === id) resetForm();
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* タイムライン表示エリア */}
      <div className="lg:col-span-2 space-y-12">
        {PERIOD_ORDER.map((period) => (
          <div key={period} className="relative">
            <h2 className="text-xl font-bold text-zinc-100 flex items-center mb-6">
              <span className="w-3 h-3 rounded-full bg-indigo-500 mr-3 shadow-[0_0_8px_rgba(99,102,241,0.6)]"></span>
              {PERIOD_LABEL[period]}
            </h2>
            
            <div className="space-y-6 pl-5 border-l border-zinc-800">
              {groupedHistories[period].length === 0 ? (
                <p className="text-zinc-500 text-sm">エピソードがありません</p>
              ) : (
                groupedHistories[period].map((history) => (
                  <div key={history.id} className="relative pl-6">
                    <span className="absolute -left-[33px] top-2 w-4 h-4 rounded-full bg-zinc-900 border-2 border-indigo-500"></span>
                    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 hover:border-zinc-700 transition-colors group">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-semibold text-zinc-100">{history.title}</h3>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex space-x-2">
                          <button
                            onClick={() => startEdit(history)}
                            className="p-1 px-3 text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded"
                          >
                            編集
                          </button>
                          <button
                            onClick={() => handleDelete(history.id)}
                            className="p-1 px-3 text-xs bg-red-900/30 hover:bg-red-900/50 text-red-400 rounded"
                          >
                            削除
                          </button>
                        </div>
                      </div>
                      <p className="text-zinc-400 text-sm whitespace-pre-wrap mb-4">{history.content}</p>
                      
                      {history.insight && (
                        <div className="bg-indigo-950/30 border border-indigo-500/30 rounded-lg p-4 mt-4">
                          <div className="text-indigo-400 text-xs font-semibold mb-1 flex items-center">
                            💡 今の自分への繋がり (Insight)
                          </div>
                          <p className="text-indigo-200/80 text-sm whitespace-pre-wrap">
                            {history.insight}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>

      {/* エディター部分 */}
      <div className="lg:col-span-1">
        <div className="sticky top-6 bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-xl">
          <h3 className="text-lg font-semibold text-zinc-100 mb-6">
            {editingId ? 'エピソードを編集' : '新しいエピソードを追加'}
          </h3>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">時代</label>
              <select
                value={formData.period}
                onChange={(e) => setFormData({ ...formData, period: e.target.value as Period })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-zinc-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                required
              >
                {PERIOD_ORDER.map((p) => (
                  <option key={p} value={p}>{PERIOD_LABEL[p]}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">タイトル</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                placeholder="例: サッカー部での県大会出場"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">具体的な経験</label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="w-full h-32 bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none"
                placeholder="どんな困難があり、どう乗り越えたか等を具体的に記述"
                required
              />
            </div>

            <div className="relative">
              <label className="block text-sm font-medium text-indigo-400 mb-1 flex items-center">
                💡 今の自分への繋がり (Insight)
              </label>
              <textarea
                value={formData.insight}
                onChange={(e) => setFormData({ ...formData, insight: e.target.value })}
                className="w-full h-32 bg-indigo-950/20 border border-indigo-500/50 rounded-lg px-4 py-2 text-indigo-100 placeholder-indigo-900/50 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 resize-none shadow-[0_0_15px_rgba(99,102,241,0.1)] transition-all focus:shadow-[0_0_15px_rgba(99,102,241,0.2)]"
                placeholder="この経験から得た価値観や、それがなぜIT/志望業界への興味に繋がったのか等（空欄可）"
              />
            </div>

            <div className="pt-4 flex gap-3">
              <button
                type="submit"
                disabled={isPending}
                className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
              >
                {isPending ? '保存中...' : '保存する'}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  disabled={isPending}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition-colors"
                >
                  キャンセル
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
