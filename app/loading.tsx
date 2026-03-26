export default function Loading() {
  return (
    <main className="p-4 md:p-8 pt-6 md:pt-10 min-h-[calc(100vh-64px)] overflow-hidden">
      {/* 挨拶のスケルトン */}
      <div className="mb-8 pl-2">
        <div className="h-10 w-64 bg-zinc-200 dark:bg-zinc-800 rounded-lg animate-pulse mb-2"></div>
        <div className="h-5 w-48 bg-zinc-100 dark:bg-zinc-800/50 rounded-lg animate-pulse"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 w-full max-w-6xl mx-auto pb-6">
        
        {/* Widget A: クイックアクション スケルトン */}
        <div className="md:col-span-4 grid grid-cols-2 lg:grid-cols-1 gap-4">
          <div className="bg-zinc-100 dark:bg-zinc-800/60 rounded-[24px] p-6 animate-pulse h-[140px]"></div>
          <div className="bg-zinc-100 dark:bg-zinc-800/60 rounded-[24px] p-6 animate-pulse h-[140px]"></div>
        </div>

        {/* Widget B: 統計サマリー スケルトン */}
        <div className="md:col-span-8 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800/50 rounded-[32px] p-6 md:p-8 animate-pulse flex flex-col justify-between min-h-[296px]">
          <div className="h-4 w-32 bg-zinc-200 dark:bg-zinc-800 rounded mb-6"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-1">
            <div className="bg-zinc-200 dark:bg-zinc-800 rounded-2xl p-4"></div>
            <div className="bg-zinc-200 dark:bg-zinc-800 rounded-2xl p-4"></div>
            <div className="bg-zinc-200 dark:bg-zinc-800 rounded-2xl p-4"></div>
            <div className="bg-zinc-200 dark:bg-zinc-800 rounded-2xl p-4"></div>
          </div>
        </div>

        {/* Widget C: 企業一覧 スケルトン */}
        <div className="md:col-span-12 mt-4 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800/50 rounded-[32px] overflow-hidden min-h-[300px]">
          <div className="px-6 md:px-8 py-6 border-b border-zinc-100 dark:border-zinc-800">
            <div className="h-6 w-40 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse"></div>
          </div>
          <div className="p-6 md:p-8 space-y-6">
            <div className="h-16 bg-zinc-200 dark:bg-zinc-800 rounded-2xl animate-pulse"></div>
            <div className="h-16 bg-zinc-200 dark:bg-zinc-800 rounded-2xl animate-pulse"></div>
            <div className="h-16 bg-zinc-200 dark:bg-zinc-800 rounded-2xl animate-pulse"></div>
          </div>
        </div>

      </div>
    </main>
  )
}
