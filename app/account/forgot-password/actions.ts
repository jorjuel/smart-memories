'use server';

import {
  redirect,
} from 'next/navigation';

import {
  createSupabaseServerClient,
} from '@/lib/supabaseServer';

import {
  getCanonicalSiteUrl,
} from '@/lib/memoryUrl';

export async function requestCustomerPasswordReset(
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
      '/account/forgot-password?error=missing'
    );
  }

  const supabase =
    await createSupabaseServerClient();

  const {
    error,
  } =
    await supabase.auth
      .resetPasswordForEmail(
        email,
        {
          redirectTo:
            getCanonicalSiteUrl() +
            '/auth/callback?next=/account/update-password',
        }
      );

  if (error) {
    console.error(
      'CUSTOMER PASSWORD RESET ERROR:',
      error
    );

    redirect(
      '/account/forgot-password?error=send'
    );
  }

  redirect(
    '/account/forgot-password?sent=1'
  );
}