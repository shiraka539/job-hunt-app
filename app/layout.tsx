import { ClerkProvider, SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs'
import './globals.css'

export const metadata = {
  title: '就活ダッシュボード',
  description: '就活管理アプリケーション',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider 
      appearance={{
        elements: {
          socialButtonsBlockButton: "hidden", // 🌟 Google等のボタンを隠す
          dividerRow: "hidden",              // 🌟 「or」の線を隠す
        }
      }}
    >
      <html lang="ja" className="antialiased dark">
        <body className="bg-black text-zinc-100 min-h-screen transition-colors duration-300 pb-20 md:pb-0 font-sans">
          
          {/* ヘッダー (True Dark対応) */}
          <header className="bg-black/60 backdrop-blur-xl border-b border-zinc-900 shadow-sm sticky top-0 z-50 transition-colors">
            <div className="max-w-6xl mx-auto px-6 h-16 flex justify-between items-center">
              <a href="/" className="font-extrabold text-xl text-indigo-500 tracking-tight hover:opacity-80 transition-opacity">
                JobHunt<span className="text-zinc-100 block md:inline text-sm md:text-xl md:ml-2">Dashboard</span>
              </a>
              
              <div className="flex items-center gap-4">
                <SignedOut>
                  <SignInButton mode="modal">
                    <button className="bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 px-5 py-2.5 rounded-full hover:bg-indigo-600/40 hover:text-indigo-300 transition-all font-bold text-sm shadow-md active:scale-95 cursor-pointer">
                      ログイン
                    </button>
                  </SignInButton>
                </SignedOut>
                <SignedIn>
                  <UserButton afterSignOutUrl="/" appearance={{ elements: { avatarBox: "w-9 h-9 border-2 border-indigo-900/50 shadow-sm" } }} />
                </SignedIn>
              </div>
            </div>
          </header>

          {/* コンテンツ側もBentoGridを見越してmax-w-6xlまで広げる */}
          <div className="max-w-6xl mx-auto w-full">{children}</div>

          {/* 📱 スマホ用ボトムナビゲーション (md:hidden) */}
          <nav className="md:hidden fixed bottom-0 w-full bg-zinc-950/80 backdrop-blur-xl border-t border-zinc-900 flex justify-around items-center h-[68px] z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.5)] pb-safe transition-colors">
            <a href="/" className="flex flex-col items-center justify-center w-full h-full text-zinc-500 hover:text-indigo-400 active:scale-95 transition-all">
              <span className="text-2xl mb-1 drop-shadow-sm">🏠</span>
              <span className="text-[10px] font-bold tracking-wide">ホーム</span>
            </a>
            <a href="/new" className="flex flex-col items-center justify-center w-full h-full text-zinc-500 hover:text-indigo-400 active:scale-95 transition-all">
              <span className="text-2xl mb-1 drop-shadow-sm">➕</span>
              <span className="text-[10px] font-bold tracking-wide">新規登録</span>
            </a>
            <a href="/templates" className="flex flex-col items-center justify-center w-full h-full text-zinc-500 hover:text-indigo-400 active:scale-95 transition-all">
              <span className="text-2xl mb-1 drop-shadow-sm">💡</span>
              <span className="text-[10px] font-bold tracking-wide">テンプレ</span>
            </a>
          </nav>

        </body>
      </html>
    </ClerkProvider>
  )
}