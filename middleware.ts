import { auth } from "@/auth"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export default auth((req) => {
  const { pathname } = req.nextUrl
  const isLoggedIn = !!req.auth

  // Public routes — always allow
  const publicRoutes = ["/", "/sign-in"]
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next()
  }

  // Auth API routes — always allow
  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next()
  }

  // Inngest webhook — always allow
  if (pathname.startsWith("/api/inngest")) {
    return NextResponse.next()
  }

  // Protected routes — redirect to sign-in if not authenticated
  if (!isLoggedIn) {
    const signInUrl = new URL("/sign-in", req.url)
    signInUrl.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(signInUrl)
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public).*)"],
}
