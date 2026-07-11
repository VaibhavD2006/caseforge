import { auth } from "@/auth"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export default auth((req) => {
  const { pathname } = req.nextUrl
  const isLoggedIn = !!req.auth

  // Forward pathname so server component layouts can read it
  const response = NextResponse.next({
    request: {
      headers: new Headers({
        ...Object.fromEntries(req.headers),
        "x-pathname": pathname,
      }),
    },
  })

  // Public routes — always allow
  const publicRoutes = ["/", "/sign-in"]
  if (publicRoutes.includes(pathname)) {
    return response
  }

  // Auth API routes — always allow
  if (pathname.startsWith("/api/auth")) {
    return response
  }

  // Inngest webhook — always allow
  if (pathname.startsWith("/api/inngest")) {
    return response
  }

  // Protected routes — redirect to sign-in if not authenticated
  if (!isLoggedIn) {
    const signInUrl = new URL("/sign-in", req.url)
    signInUrl.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(signInUrl)
  }

  return response
})

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public).*)"],
}
