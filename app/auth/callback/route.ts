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

  const next =
    requestedNext &&
    requestedNext.startsWith('/') &&
    !requestedNext.startsWith('//')
      ? requestedNext
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