import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const protectedRoutes = ['/dashboard', '/dashboard/', '/dashboard/*'];
const publicRoutes = ['/login', '/register'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check for access token in both cookies and localStorage (via header)
  const accessToken = request.cookies.get('access_token')?.value ||
                      request.headers.get('authorization')?.replace('Bearer ', '');

  // Check if user is trying to access protected route without token
  const isProtectedRoute = protectedRoutes.some(route => {
    if (route.endsWith('/*')) {
      const base = route.slice(0, -2);
      return pathname.startsWith(base);
    }
    return pathname === route || pathname.startsWith(route + '/');
  });

  if (isProtectedRoute && !accessToken) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Check if user is trying to access auth route with token
  const isPublicRoute = publicRoutes.some(route =>
    pathname === route || pathname.startsWith(route + '/')
  );

  if (isPublicRoute && accessToken) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
