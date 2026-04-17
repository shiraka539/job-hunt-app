import { getLifeHistories } from '@/app/actions/history';
import LifeHistoryTimeline from '@/components/history/LifeHistoryTimeline';

export const metadata = {
  title: '自分史・ルーツ管理 - Job Hunt Dashboard',
};

export default async function HistoryPage() {
  const histories = await getLifeHistories();

  return (
    <div className="min-h-screen bg-black text-zinc-100 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Life History</h1>
          <p className="text-zinc-400 mt-2">
            中学、高校、大学時代の経験を振り返り、今の自分（価値観や志望動機）への繋がりを整理しましょう。
          </p>
        </div>

        <LifeHistoryTimeline histories={histories} />
      </div>
    </div>
  );
}
