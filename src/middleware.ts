import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export const config = {
  matcher: ['/dashboard/:path*', '/sign-in', '/sign-up', '/verify/:path*'],
};

export async function middleware(request: NextRequest) {
  // Token fetch karte waqt secret pass karna best practice hai production ke liye
  const token = await getToken({ 
    req: request, 
    secret: process.env.NEXTAUTH_SECRET 
  });
  const url = request.nextUrl;

  // 1. Agar user ALREADY LOGGED IN hai, aur wo wapas Sign-In/Sign-Up par jana chahe
  // Toh usko zabardasti Dashboard par bhej do
  if (
    token &&
    (url.pathname.startsWith('/sign-in') ||
      url.pathname.startsWith('/sign-up') ||
      url.pathname.startsWith('/verify'))
  ) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // 2. Agar user LOGGED OUT hai, aur wo chori se Dashboard access karna chahe
  // Toh usko Sign-In page par bhej denge
  if (!token && url.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }

  // Agar upar ki koi condition match nahi hui, toh user jahan ja raha tha wahan jane do
  return NextResponse.next();
}