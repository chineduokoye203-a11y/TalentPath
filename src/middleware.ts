import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isAuth = !!req.auth;
  
  const isAuthRoute =
    pathname.startsWith("/auth") ||
    pathname.startsWith("/activate") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/register");

  const isPublicRoute = pathname === "/" || pathname.startsWith("/_next/static") || pathname.startsWith("/_next/image") || pathname.startsWith("/favicon.ico");

  if (isPublicRoute) {
    return NextResponse.next();
  }

  if (!isAuth && !isAuthRoute) {
    return NextResponse.redirect(new URL("/auth?mode=register", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
