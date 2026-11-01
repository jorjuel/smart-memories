'use server';

import {
  redirect,
} from 'next/navigation';

import {
  createSupabaseAdminAuthClient,
} from '@/lib/supabaseAdminAuthServer';

import {
  getCanonicalSiteUrl,
} from '@/lib/memoryUrl';

export async function requestAdminPasswordReset(
  formData: FormData
) {
  const email =
    formData
      .get('email')
      ?.toString()
      .trim()
      .toLowerCase();

  if (!email) {
    redirect(
      '/admin/forgot-password?error=missing'
    );
  }

  const allowedEmails =
    (
      process.env.ADMIN_EMAILS ||
      ''
    )
      .split(',')
      .map(
        (value) =>
          value
            .trim()
            .toLowerCase()
      )
      .filter(Boolean);

  /*
   * Do not reveal whether an email
   * is authorised. The user gets the
   * same confirmation screen.
   */
  if (
    allowedEmails.includes(
      email
    )
  ) {
    const supabase =
      await createSupabaseAdminAuthClient();

    const redirectTo =
      `${getCanonicalSiteUrl()}` +
      '/auth/callback' +
      '?next=/account/update-password';

    const {
      error,
    } =
      await supabase.auth
        .resetPasswordForEmail(
          email,
          {
            redirectTo,
          }
        );

    if (error) {
      console.error(
        'ADMIN PASSWORD RESET ERROR:',
        error
      );
    }
  }

  redirect(
    '/admin/forgot-password?sent=1'
  );
}