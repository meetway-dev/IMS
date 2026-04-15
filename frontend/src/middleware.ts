import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const protectedRoutes = ['/dashboard'];
const publicRoutes = ['/login', '/register'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check for access token in both cookies and localStorage (via header)
  const accessToken = request.cookies.get('access_token')?.value ||
                      request.headers.get('authorization')?.replace('Bearer ', '');

  // Check if user is trying to access protected route without token
  if (protectedRoutes.some((route) => pathname.startsWith(route)) && !accessToken) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Check if user is trying to access auth route with token
  if (publicRoutes.some((route) => pathname.startsWith(route)) && accessToken) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
