import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET,
  });

  const isLoggedIn = Boolean(token);
  const onboardingCompleted = Boolean(token?.onboardingCompleted);

  if (pathname === "/login" || pathname === "/register") {
    return NextResponse.redirect(new URL("/start", request.url));
  }

  if (pathname.startsWith("/dashboard")) {
    if (!isLoggedIn) {
      const start = new URL("/start", request.url);
      start.searchParams.set("next", pathname);
      return NextResponse.redirect(start);
    }

    if (!onboardingCompleted) {
      return NextResponse.redirect(new URL("/onboarding", request.url));
    }
  }

  if (pathname === "/onboarding") {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/start", request.url));
    }

    if (onboardingCompleted) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  if (pathname === "/start" && isLoggedIn) {
    if (!onboardingCompleted) {
      return NextResponse.redirect(new URL("/onboarding", request.url));
    }
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/start", "/onboarding", "/login", "/register"],
};
