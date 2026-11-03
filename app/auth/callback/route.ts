import {
  NextResponse,
} from 'next/server';

import {
  createSupabaseServerClient,
} from '@/lib/supabaseServer';

export async function GET(
  request: Request
) {
  const requestUrl =
    new URL(request.url);

  const code =
    requestUrl.searchParams.get(
      'code'
    );

  const requestedNext =
    requestUrl.searchParams.get(
      'next'
    );

  // Only internal destinations used by the registration and
  // password recovery flow are accepted, preventing open redirects.
  const next =
    requestedNext === '/account/update-password'
      ? '/account/update-password'
      : '/account';

  if (!code) {
    return NextResponse.redirect(
      new URL(
        '/account/login?error=callback',
        requestUrl.origin
      )
    );
  }

  const supabase =
    await createSupabaseServerClient();

  const {
    error,
  } =
    await supabase.auth
      .exchangeCodeForSession(
        code
      );

  if (error) {
    console.error(
      'AUTH CALLBACK ERROR:',
      error
    );

    return NextResponse.redirect(
      new URL(
        '/account/login?error=callback',
        requestUrl.origin
      )
    );
  }

  return NextResponse.redirect(
    new URL(
      next,
      requestUrl.origin
    )
  );
}