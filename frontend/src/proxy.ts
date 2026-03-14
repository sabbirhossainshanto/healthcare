import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { jwtUtils } from "./lib/jwtUtils";
import {
  getDefaultDashboardRoute,
  getRouteOwner,
  isAuthRoutes,
  UserRole,
} from "./lib/authUtils";
import {
  getNewTokensWithRefreshToken,
  getUserInfo,
} from "./services/auth.services";
import { isTokenExpiringSoon } from "./lib/tokenUtils";

async function refreshTokenMiddleware(refreshToken: string): Promise<boolean> {
  try {
    const refresh = await getNewTokensWithRefreshToken(refreshToken);
    if (!refresh) {
      return false;
    }
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
}

// This function can be marked `async` if using `await` inside
export async function proxy(req: NextRequest) {
  console.log(req);
  const { pathname } = req.nextUrl;
  const accessToken = req.cookies.get("accessToken")?.value;
  const refreshToken = req.cookies.get("refreshToken")?.value;

  const decodedAccessToken =
    accessToken &&
    jwtUtils.verifyToken(accessToken, process.env.JTW_ACCESS_SECRET!).data;

  const isValidAccessToken =
    accessToken &&
    jwtUtils.verifyToken(accessToken, process.env.JTW_ACCESS_SECRET!).success;

  let userRole: UserRole | null = null;
  if (decodedAccessToken) {
    userRole = decodedAccessToken.role as UserRole;
  }

  const routeOwner = getRouteOwner(pathname);
  const unifiedSuperAdminAndAdminRole =
    userRole === "SUPER_ADMIN" ? "ADMIN" : userRole;
  userRole = unifiedSuperAdminAndAdminRole;
  const isAuth = isAuthRoutes(pathname);

  if (
    isValidAccessToken &&
    refreshToken &&
    (await isTokenExpiringSoon(accessToken))
  ) {
    const requestHeaders = new Headers(req.headers);
    const response = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });

    try {
      const refreshed = await refreshTokenMiddleware(refreshToken);
      if (refreshed) {
        requestHeaders.set("x-token-refreshed", "1");
      }

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
        headers: response.headers,
      });
    } catch (error) {
      console.log(error);
    }
    return response;
  }

  //Rule - 1: User is logged in (has access token) and trying to access auth route -> don't allow
  if (isAuth && isValidAccessToken) {
    return NextResponse.redirect(
      new URL(getDefaultDashboardRoute(userRole as UserRole), req.url),
    );
  }

  if (pathname === "/reset-password") {
    const email = req.nextUrl.searchParams.get("email");

    if (accessToken && email) {
      const userInfo = await getUserInfo();
      if (userInfo.needPasswordChange) {
        return NextResponse.next();
      } else {
        return NextResponse.redirect(
          new URL(getDefaultDashboardRoute(userRole as UserRole), req.url),
        );
      }
    }
    if (email) {
      return NextResponse.next();
    }

    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  //Rule-2 User trying to access public route -> allow
  if (routeOwner === null) {
    return NextResponse.next();
  }

  //Rule-3 User is not logged in but trying to access protected route -> redirect to login page
  if (!accessToken || !isValidAccessToken) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (accessToken) {
    const userInfo = await getUserInfo();

    if (userInfo.emailVerified === false) {
      if (pathname !== "/verify-email") {
        const verifyEmailUrl = new URL("/verify-email", req.url);
        verifyEmailUrl.searchParams.set("email", userInfo.email);
        return NextResponse.redirect(verifyEmailUrl);
      }
      return NextResponse.next();
    }

    if (userInfo && userInfo.emailVerified && pathname === "/verify-email") {
      return NextResponse.redirect(
        new URL(getDefaultDashboardRoute(userRole as UserRole), req.url),
      );
    }

    if (userInfo.needPasswordChange) {
      if (userInfo.needPasswordChange) {
        const resetPasswordUrl = new URL("/reset-password", req.url);
        resetPasswordUrl.searchParams.set("email", userInfo.email);
        return NextResponse.redirect(resetPasswordUrl);
      }
      return NextResponse.next();
    }
    if (
      userInfo &&
      !userInfo.needPasswordChange &&
      pathname === "/reset-password"
    ) {
      return NextResponse.redirect(
        new URL(getDefaultDashboardRoute(userRole as UserRole), req.url),
      );
    }
  }

  //Rule-4 User trying to access common protected route -> allow
  if (routeOwner === "COMMON") {
    return NextResponse.next();
  }

  //Rule-5 User trying to visit role based protected but doesn't have required role -> redirect to their default dashboard
  if (
    routeOwner === "ADMIN" ||
    routeOwner === "DOCTOR" ||
    routeOwner === "PATIENT"
  ) {
    if (routeOwner !== userRole) {
      return NextResponse.redirect(
        new URL(getDefaultDashboardRoute(userRole as UserRole), req.url),
      );
    }
  }

  return NextResponse.next();
}

// Alternatively, you can use a default export:
// export default function proxy(request: NextRequest) { ... }
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.well-known).*)",
  ],
};
