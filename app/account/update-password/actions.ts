'use server';

import {
  redirect,
} from 'next/navigation';

import {
  createSupabaseServerClient,
} from '@/lib/supabaseServer';

export async function updatePassword(
  formData: FormData
) {
  const password =
    formData
      .get('password')
      ?.toString();

  const confirmPassword =
    formData
      .get('confirmPassword')
      ?.toString();

  if (
    !password ||
    !confirmPassword
  ) {
    redirect(
      '/account/update-password?error=missing'
    );
  }

  if (
    password.length < 8
  ) {
    redirect(
      '/account/update-password?error=length'
    );
  }

  if (
    password !==
    confirmPassword
  ) {
    redirect(
      '/account/update-password?error=mismatch'
    );
  }

  const supabase =
    await createSupabaseServerClient();

  const {
    data: {
      user,
    },
  } =
    await supabase.auth
      .getUser();

  if (!user) {
    redirect(
      '/account/update-password?error=session'
    );
  }

  const {
    error,
  } =
    await supabase.auth
      .updateUser({
        password,
      });

  if (error) {
    console.error(
      'UPDATE PASSWORD ERROR:',
      error
    );

    redirect(
      '/account/update-password?error=update'
    );
  }

  await supabase.auth
    .signOut();

  redirect(
    '/admin/login?reset=success'
  );
}