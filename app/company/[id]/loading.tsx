export default function CompanyLoading() {
  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* ヘッダー部分のスケルトン */}
        <div className="mb-8 flex items-center justify-between p-4 bg-white rounded-xl shadow border border-gray-100 h-20">
          <div className="flex items-center gap-4">
            <div className="w-32 h-8 bg-gray-200 rounded animate-pulse"></div>
            <div className="w-48 h-8 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-36 h-10 bg-gray-200 rounded animate-pulse"></div>
            <div className="w-36 h-10 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>

        {/* コンテンツ部分のスケルトン */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-100 p-8 space-y-12">
          {/* ESの設問スケルトン1 */}
          <div className="border-b-2 border-gray-100 pb-10">
            <div className="w-full h-14 bg-gray-100 rounded animate-pulse mb-5"></div>
            <div className="w-full h-32 bg-gray-50 border border-gray-100 rounded animate-pulse"></div>
          </div>
          {/* ESの設問スケルトン2 */}
          <div className="border-b-2 border-gray-100 pb-10">
            <div className="w-[80%] h-14 bg-gray-100 rounded animate-pulse mb-5"></div>
            <div className="w-full h-32 bg-gray-50 border border-gray-100 rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    </main>
  )
}
