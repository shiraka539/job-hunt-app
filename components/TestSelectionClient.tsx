'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { updateAnswer } from '../app/actions'

const TEST_OPTIONS = ['SPI', '玉手箱', 'TG-WEB', 'CAB/GAB', '企業オリジナル', 'その他']

export default function TestSelectionClient({ questionId, initialContent }: { questionId: string, initialContent: string | null }) {
  // 保存されている文字列を配列に戻す。空っぽの要素を消すために filter(Boolean) を追加
  const initialSelections = initialContent ? initialContent.split(',').filter(Boolean) : []
  
  const [selectedTests, setSelectedTests] = useState<string[]>(initialSelections)
  // 既にデータがあれば「閲覧モード(false)」、なければ「編集モード(true)」からスタート
  const [isEditing, setIsEditing] = useState(initialSelections.length === 0)
  
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  // ボタンを押したときの選択/解除の切り替え
  const handleToggle = (testName: string) => {
    setSelectedTests(prev => 
      prev.includes(testName) 
        ? prev.filter(t => t !== testName) 
        : [...prev, testName]
    )
  }

  // 保存処理
  const handleSave = () => {
    startTransition(async () => {
      await updateAnswer(questionId, selectedTests.join(','))
      setIsEditing(false) // 保存したら編集モードを終了してスッキリさせる！
      router.refresh()
    })
  }

  return (
    <div className="bg-white p-8 rounded-lg shadow border border-gray-100 mt-6 transition-all">
      <h2 className="text-xl font-bold text-gray-800 border-l-4 border-blue-600 pl-3 mb-6">
        実施されるWebテストの形式
      </h2>
      
      {!isEditing ? (
        /* ＝＝＝ 閲覧モード（決定後） ＝＝＝ */
        <div className="flex flex-col items-start gap-4 animate-in fade-in duration-300">
          <div className="flex flex-wrap gap-3">
            {selectedTests.length > 0 ? (
              selectedTests.map(test => (
                <span key={test} className="bg-blue-600 text-white px-5 py-2.5 rounded-md text-xl font-bold shadow-sm">
                  {test}
                </span>
              ))
            ) : (
              <span className="text-gray-400 font-medium">未設定</span>
            )}
          </div>
          <button 
            onClick={() => setIsEditing(true)}
            className="text-sm text-gray-500 hover:text-blue-600 border border-gray-300 hover:border-blue-400 bg-white px-4 py-2 rounded transition mt-2 flex items-center gap-1"
          >
            ✎ 形式を変更する
          </button>
        </div>
      ) : (
        /* ＝＝＝ 編集モード（選択画面） ＝＝＝ */
        <div className="animate-in fade-in duration-300">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
            {TEST_OPTIONS.map((testName) => {
              const isSelected = selectedTests.includes(testName)
              return (
                <button
                  key={testName}
                  type="button"
                  onClick={() => handleToggle(testName)}
                  // 選択されたら色を反転させてガッツリ目立たせる！
                  className={`py-4 px-6 rounded-lg font-bold text-lg border-2 transition-all duration-200 ${
                    isSelected 
                      ? 'bg-blue-600 border-blue-600 text-white shadow-md transform scale-[1.02]' 
                      : 'bg-white border-gray-200 text-gray-700 hover:border-blue-400 hover:bg-blue-50'
                  }`}
                >
                  {testName}
                </button>
              )
            })}
          </div>

          <div className="flex justify-end gap-3 border-t border-gray-100 pt-6">
            {initialSelections.length > 0 && (
              <button 
                onClick={() => {
                  setSelectedTests(initialSelections) // キャンセル時は元の状態に戻す
                  setIsEditing(false)
                }}
                className="px-6 py-3 min-w-[160px] rounded-lg text-gray-500 hover:bg-gray-100 transition font-bold text-base border border-transparent hover:border-gray-200 text-center"
              >
                キャンセル
              </button>
            )}
            <button 
              onClick={handleSave}
              disabled={isPending}
              className="bg-blue-600 text-white px-6 py-3 min-w-[160px] rounded-lg hover:bg-blue-700 transition disabled:opacity-50 font-bold shadow-md text-base text-center"
            >
              {isPending ? '保存中...' : '形式を決定する'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}