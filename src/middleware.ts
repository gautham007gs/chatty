
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

function isInstagramInAppBrowserServer(userAgent: string | null): boolean {
  if (userAgent) {
    // Common patterns for Instagram's in-app browser user agent string
    return /instagram/i.test(userAgent) || /mozilla\/5\.0 \([^)]+\) applewebkit\/[^ ]+ \(khtml, like gecko\) mobile\/[^ ]+ instagram/i.test(userAgent);
  }
  return false;
}

export function middleware(request: NextRequest) {
  const { pathname, searchParams, origin, search } = request.nextUrl;
  const userAgent = request.headers.get('user-agent');

  // Check if our redirect trick has already been attempted for this request flow
  const hasRedirectAttemptedFlag = searchParams.has('external_redirect_attempted');

  // Only apply the trick if it's an Instagram browser, the flag isn't set, and it's not an API/static asset path
  if (isInstagramInAppBrowserServer(userAgent) && !hasRedirectAttemptedFlag) {
    
    // More robustly ignore common asset paths and API routes
    if (pathname.startsWith('/_next/') || 
        pathname.startsWith('/api/') || 
        pathname.startsWith('/media/') || // Assuming /media/ for local assets like audio
        pathname.includes('.') // General check for file extensions like .png, .ico, .css, .js
       ) {
      return NextResponse.next();
    }

    // Construct the target URL for the meta-refresh, preserving original path and query params,
    // and adding our flag.
    const targetUrl = new URL(pathname, origin);
    // Append existing search params
    searchParams.forEach((value, key) => {
        if (key !== 'external_redirect_attempted') { // Avoid duplicating our flag
            targetUrl.searchParams.append(key, value);
        }
    });
    targetUrl.searchParams.set('external_redirect_attempted', 'true');
    const targetUrlString = targetUrl.toString();

    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Opening in Browser...</title>
    <meta http-equiv="refresh" content="0;url=${targetUrlString}">
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"; margin: 0; padding: 25px; background-color: #fafafa; display: flex; flex-direction: column; justify-content: center; align-items: center; min-height: 90vh; text-align: center; color: #262626; }
        .container { background-color: #ffffff; padding: 20px 30px; border-radius: 12px; box-shadow: 0 6px 18px rgba(0,0,0,0.08); max-width: 400px; width: 90%; }
        p { margin-bottom: 18px; font-size: 17px; line-height: 1.65; }
        a { color: #0095f6; text-decoration: none; font-weight: 600; }
        a:hover { text-decoration: underline; }
        .loader { border: 4px solid #dbdbdb; border-top: 4px solid #0095f6; border-radius: 50%; width: 35px; height: 35px; animation: spin 1.2s linear infinite; margin: 25px auto; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        .small-text { font-size: 13px; color: #8e8e8e; margin-top: 25px; }
    </style>
</head>
<body>
    <div class="container">
        <p>Taking you to the full experience...</p>
        <div class="loader"></div>
        <p>If you're not redirected, please <a href="${targetUrlString}">click here</a>.</p>
        <p class="small-text">This helps ensure all features work correctly by using your phone's main browser.</p>
    </div>
    <script type="text/javascript">
      // The meta refresh is the primary method.
      // A direct window.location.href might be too quick and less likely to trigger OS intervention.
      // No additional JS needed for this specific trick; meta-refresh + Content-Disposition is the core.
    </script>
</body>
</html>`;

    return new Response(htmlContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `attachment; filename="open-maya-chat.html"`, // Filename hints to browser/OS
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      },
    });
  }

  return NextResponse.next();
}

// Configure the matcher to run on most page routes, excluding API, static assets, etc.
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - /media/ (local media assets like audio)
     * - and other files with extensions (e.g. .png, .jpg)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|media/|.*\\.[^.]+$).*)',
  ],
};
