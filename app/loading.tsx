export default function Loading() {
  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* タイトル部分のスケルトン */}
        <div className="h-9 w-64 bg-gray-200 rounded-md animate-pulse mb-8"></div>

        {/* ボタン部分のスケルトン */}
        <div className="flex gap-4 mb-6">
          <div className="h-11 w-44 bg-gray-200 rounded-md animate-pulse"></div>
          <div className="h-11 w-44 bg-gray-200 rounded-md animate-pulse"></div>
        </div>

        {/* 企業リスト全体のスケルトン */}
        <div className="bg-white rounded-lg shadow border border-gray-100 p-6 space-y-4">
          <div className="h-[72px] bg-gray-100 rounded-lg animate-pulse"></div>
          <div className="border-t border-gray-100"></div>
          <div className="h-[72px] bg-gray-100 rounded-lg animate-pulse"></div>
          <div className="border-t border-gray-100"></div>
          <div className="h-[72px] bg-gray-100 rounded-lg animate-pulse"></div>
        </div>
      </div>
    </main>
  )
}
