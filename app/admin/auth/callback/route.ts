import {
  NextResponse,
} from 'next/server';

import {
  createSupabaseAdminAuthClient,
} from '@/lib/supabaseAdminAuthServer';

export async function GET(
  request: Request
) {
  const url =
    new URL(request.url);

  const code =
    url.searchParams.get(
      'code'
    );

  if (!code) {
    return NextResponse.redirect(
      new URL(
        '/admin/login?error=callback',
        url.origin
      )
    );
  }

  const supabase =
    await createSupabaseAdminAuthClient();

  const {
    error,
  } =
    await supabase.auth
      .exchangeCodeForSession(
        code
      );

  if (error) {
    console.error(
      'ADMIN AUTH CALLBACK ERROR:',
      error
    );

    return NextResponse.redirect(
      new URL(
        '/admin/login?error=callback',
        url.origin
      )
    );
  }

  return NextResponse.redirect(
    new URL(
      '/admin/update-password',
      url.origin
    )
  );
}