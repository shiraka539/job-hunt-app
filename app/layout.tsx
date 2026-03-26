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
      <html lang="ja">
        <body className="bg-gray-50 text-gray-900 min-h-screen">
          <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
            {/* 🌟ここ！最大幅を制限して中央に寄せる */}
            <div className="max-w-4xl mx-auto px-6 py-4 flex justify-between items-center">
              <div className="font-bold text-xl text-blue-600 tracking-wide">
                JobHunt Dashboard
              </div>
              
              <div className="flex items-center gap-4">
                <SignedOut>
                  <SignInButton mode="modal">
                    <button className="bg-blue-600 text-white px-5 py-2 rounded-md hover:bg-blue-700 transition font-medium text-sm shadow-sm cursor-pointer">
                      ログイン
                    </button>
                  </SignInButton>
                </SignedOut>
                <SignedIn>
                  <UserButton afterSignOutUrl="/" />
                </SignedIn>
              </div>
            </div>
          </header>

          {/* コンテンツ側も max-w-4xl になっているはずだから、これで上下が揃う */}
          <main>{children}</main>
        </body>
      </html>
    </ClerkProvider>
  )
}