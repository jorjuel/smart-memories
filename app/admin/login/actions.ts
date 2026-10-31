'use server';

import { redirect } from 'next/navigation';

import {
  createSupabaseServerClient,
} from '../../../lib/supabaseServer';

export async function adminLogin(
  formData: FormData
) {
  const email =
    formData
      .get('email')
      ?.toString()
      .trim()
      .toLowerCase();

  const password =
    formData
      .get('password')
      ?.toString();

  if (!email || !password) {
    redirect(
      '/admin/login?error=missing'
    );
  }

  const supabase =
    await createSupabaseServerClient();

  const {
    data,
    error,
  } =
    await supabase.auth
      .signInWithPassword({
        email,
        password,
      });

  if (
    error ||
    !data.user
  ) {
    redirect(
      '/admin/login?error=invalid'
    );
  }

  const allowedEmails =
    (
      process.env
        .ADMIN_EMAILS || ''
    )
      .split(',')
      .map((value) =>
        value
          .trim()
          .toLowerCase()
      )
      .filter(Boolean);

  if (
    !allowedEmails.includes(
      email
    )
  ) {
    await supabase.auth
      .signOut();

    redirect(
      '/admin/login?error=unauthorised'
    );
  }

  redirect('/admin');
}
