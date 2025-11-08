import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/middleware/auth";

// Public paths that don't require authentication
const publicPaths = [
  "/",
  "/sign-in",
  "/sign-up",
  "/pending-approval",
  "/unauthorized",
  "/api/auth",
];

// Check if the path is public
function isPublicPath(path: string): boolean {
  return publicPaths.some(publicPath =>
    path === publicPath || path.startsWith(publicPath)
  );
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  // Get the current session
  const session = await getCurrentSession(request);

  // Redirect to sign-in if no session
  if (!session) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  // Check user status
  if (session.user.status === "pending") {
    // Allow access to pending approval page, redirect others
    if (pathname === "/pending-approval") {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL("/pending-approval", request.url));
  }

  if (session.user.status === "inactive") {
    return NextResponse.redirect(new URL("/unauthorized", request.url));
  }

  // Allow access to dashboard and other protected routes for active users
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public directory)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};