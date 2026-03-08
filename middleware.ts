import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

// ログイン画面などの「誰でも見れるページ」を指定
const isPublicRoute = createRouteMatcher(['/sign-in(.*)', '/sign-up(.*)'])

export default clerkMiddleware(async (auth, request) => {
  // パブリックなルート以外にアクセスしようとしたら、強制的にログイン画面へ飛ばす！
  if (!isPublicRoute(request)) {
    await auth.protect()
  }
})

export const config = {
  matcher: [
    // Next.jsの裏側のファイル以外はすべてこの魔法（ミドルウェア）を通す
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}