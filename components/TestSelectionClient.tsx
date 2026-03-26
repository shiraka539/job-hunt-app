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
    <div className="bg-zinc-900 p-8 rounded-lg shadow border border-zinc-800 mt-6 transition-all">
      <h2 className="text-xl font-bold text-zinc-100 border-l-4 border-indigo-500 pl-3 mb-6">
        実施されるWebテストの形式
      </h2>
      
      {!isEditing ? (
        /* ＝＝＝ 閲覧モード（決定後） ＝＝＝ */
        <div className="flex flex-col items-start gap-4 animate-in fade-in duration-300">
          <div className="flex flex-wrap gap-3">
            {selectedTests.length > 0 ? (
              selectedTests.map(test => (
                <span key={test} className="bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 px-5 py-2.5 rounded-md text-xl font-bold shadow-sm">
                  {test}
                </span>
              ))
            ) : (
              <span className="text-zinc-500 font-medium">未設定</span>
            )}
          </div>
          <button 
            onClick={() => setIsEditing(true)}
            className="text-sm text-zinc-400 hover:text-indigo-400 border border-zinc-700 hover:border-indigo-500 bg-zinc-800 px-4 py-2 rounded transition mt-2 flex items-center gap-1"
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
                      ? 'bg-indigo-600/20 border-indigo-500/50 text-indigo-300 shadow-md transform scale-[1.02]' 
                      : 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:border-indigo-500/50 hover:bg-indigo-900/20'
                  }`}
                >
                  {testName}
                </button>
              )
            })}
          </div>

          <div className="flex justify-end gap-3 border-t border-zinc-800 pt-6">
            {initialSelections.length > 0 && (
              <button 
                onClick={() => {
                  setSelectedTests(initialSelections) // キャンセル時は元の状態に戻す
                  setIsEditing(false)
                }}
                className="px-6 py-3 min-w-[160px] rounded-lg text-zinc-400 hover:bg-zinc-800 transition font-bold text-base border border-transparent hover:border-zinc-700 text-center"
              >
                キャンセル
              </button>
            )}
            <button 
              onClick={handleSave}
              disabled={isPending}
              className="bg-indigo-600 text-white px-6 py-3 min-w-[160px] rounded-lg hover:bg-indigo-500 transition disabled:opacity-50 font-bold shadow-md text-base text-center border border-indigo-500"
            >
              {isPending ? '保存中...' : '形式を決定する'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}