'use server';

import { redirect } from 'next/navigation';

import {
  createSupabaseServerClient,
} from '@/lib/supabaseServer';

export async function confirmPasswordRecovery(
  formData: FormData
) {
  const tokenHash =
    formData
      .get('token_hash')
      ?.toString()
      .trim();

  if (!tokenHash) {
    redirect(
      '/account/forgot-password?error=invalid'
    );
  }

  const supabase =
    await createSupabaseServerClient();

  const { error } =
    await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: 'recovery',
    });

  if (error) {
    console.error(
      'CUSTOMER RECOVERY VERIFY ERROR:',
      error
    );

    redirect(
      '/account/forgot-password?error=invalid'
    );
  }

  redirect('/account/update-password');
}