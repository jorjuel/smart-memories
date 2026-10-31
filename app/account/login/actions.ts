'use server';

import { redirect } from 'next/navigation';

import {
  createSupabaseServerClient,
} from '../../../lib/supabaseServer';

export async function customerLogin(
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
      '/account/login?error=missing'
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
      '/account/login?error=invalid'
    );
  }

  const ownerEmails =
    (
      process.env.ADMIN_EMAILS ||
      ''
    )
      .split(',')
      .map((value) =>
        value
          .trim()
          .toLowerCase()
      )
      .filter(Boolean);

  if (
    ownerEmails.includes(
      email
    )
  ) {
    redirect('/admin');
  }

  redirect('/account');
}