import { auth } from "@/auth"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

// Lazily initialized so cold starts without Upstash env vars don't crash
let registerLimiter: Ratelimit | null = null
let signInLimiter: Ratelimit | null = null

function getLimiters() {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return null
  }
  if (!registerLimiter) {
    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
    registerLimiter = new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(5, "60 s"), prefix: "rl:register" })
    signInLimiter = new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(10, "60 s"), prefix: "rl:signin" })
  }
  return { register: registerLimiter!, signIn: signInLimiter! }
}

function getIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    req.headers.get("x-real-ip") ??
    "127.0.0.1"
  )
}

export default auth(async (req) => {
  const { pathname } = req.nextUrl

  // Rate limit sensitive auth endpoints before any expensive work
  const limiters = getLimiters()
  if (limiters) {
    const ip = getIp(req)
    let limiter: Ratelimit | null = null

    if (pathname === "/api/auth/register" && req.method === "POST") {
      limiter = limiters.register
    } else if (pathname === "/api/auth/callback/credentials" && req.method === "POST") {
      limiter = limiters.signIn
    }

    if (limiter) {
      const { success, limit, remaining, reset } = await limiter.limit(ip)
      if (!success) {
        return new NextResponse("Too many requests", {
          status: 429,
          headers: {
            "Retry-After": String(Math.ceil((reset - Date.now()) / 1000)),
            "X-RateLimit-Limit": String(limit),
            "X-RateLimit-Remaining": String(remaining),
          },
        })
      }
    }
  }

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
  const publicRoutes = ["/", "/sign-in", "/sign-up", "/verify-email", "/terms", "/privacy"]
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
