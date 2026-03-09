import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  locales: ['en', 'ar'], // Supported languages
  defaultLocale: 'en', // Default language
  localeDetection: true, // Auto-detect user's language
});

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)'], // Apply middleware to all pages except API routes
};
