'use server';

import {
  redirect,
} from 'next/navigation';

import {
  createSupabaseAdminAuthClient,
} from '@/lib/supabaseAdminAuthServer';

export async function updateAdminPassword(
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
      '/admin/update-password?error=missing'
    );
  }

  if (
    password.length < 8
  ) {
    redirect(
      '/admin/update-password?error=length'
    );
  }

  if (
    password !==
    confirmPassword
  ) {
    redirect(
      '/admin/update-password?error=mismatch'
    );
  }

  const supabase =
    await createSupabaseAdminAuthClient();

  const {
    data: {
      user,
    },
  } =
    await supabase.auth
      .getUser();

  if (!user) {
    redirect(
      '/admin/update-password?error=session'
    );
  }

  const allowedEmails =
    (
      process.env.ADMIN_EMAILS ||
      ''
    )
      .split(',')
      .map(
        (email) =>
          email
            .trim()
            .toLowerCase()
      )
      .filter(Boolean);

  const userEmail =
    user.email
      ?.trim()
      .toLowerCase() ||
    '';

  if (
    !allowedEmails.includes(
      userEmail
    )
  ) {
    await supabase.auth
      .signOut();

    redirect(
      '/admin/login?error=unauthorised'
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
      'ADMIN PASSWORD UPDATE ERROR:',
      error
    );

    redirect(
      '/admin/update-password?error=update'
    );
  }

  await supabase.auth
    .signOut();

  redirect(
    '/admin/login?reset=success'
  );
}